import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join, resolve, sep } from "node:path";
import { once } from "node:events";

const root = resolve("dist");
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

const server = createServer(async (request, response) => {
  try {
    const requested = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const target = resolve(root, "." + (requested.endsWith("/") ? requested + "index.html" : requested));
    if (!target.startsWith(root + sep)) return response.writeHead(403).end();
    const bytes = await readFile(target);
    response.writeHead(200, { "content-type": types[extname(target)] || "application/octet-stream" }).end(bytes);
  } catch {
    response.writeHead(404).end();
  }
});

function chromeBinary() {
  if (process.env.CHROME_BIN) return process.env.CHROME_BIN;
  for (const candidate of ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]) {
    if (spawnSync("which", [candidate], { stdio: "ignore" }).status === 0) return candidate;
  }
  throw new Error("Install Chrome or Chromium to run experience QA smoke tests");
}

async function chromePort(directory, child) {
  for (let i = 0; i < 120; i += 1) {
    if (child.exitCode !== null) throw new Error("Chrome exited before starting DevTools");
    try {
      const port = Number.parseInt((await readFile(join(directory, "DevToolsActivePort"), "utf8")).split("\n")[0], 10);
      if (port > 0) return port;
    } catch {}
    await sleep(90);
  }
  throw new Error("Timed out waiting for Chrome DevTools");
}

async function connect(endpoint) {
  const socket = new WebSocket(endpoint);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  let nextId = 0;
  const waiting = new Map();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    const item = waiting.get(message.id);
    if (!item) return;
    waiting.delete(message.id);
    if (message.error) item.reject(new Error(JSON.stringify(message.error)));
    else item.resolve(message.result);
  });

  return {
    send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = ++nextId;
        waiting.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
    close() {
      socket.close();
    },
  };
}

async function evaluate(connection, expression, options = {}) {
  const result = await connection.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: options.awaitPromise || false,
  });
  if (result.exceptionDetails) {
    throw new Error(options.label || (result.exceptionDetails.exception?.description || result.exceptionDetails.text));
  }
  return result.result?.value;
}

async function navigateReady(connection, origin, route) {
  await connection.send("Page.navigate", { url: origin + route.path + "?qa=" + Date.now() });
  let ready = false;
  for (let i = 0; i < 140; i += 1) {
    try {
      const state = await evaluate(connection, "({ready: document.readyState, route: location.pathname})");
      if (state?.ready === "complete" && state.route === route.path) {
        ready = true;
        break;
      }
    } catch {}
    await sleep(70);
  }
  if (!ready) throw new Error(`${route.label} did not finish loading`);
}

function addFinding(findings, severity, route, check, details, reproduction) {
  findings.push({ severity, route, check, details, reproduction });
}

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = "http://127.0.0.1:" + server.address().port;
const directory = await mkdtemp(join(tmpdir(), "bitfoundry-experience-qa-"));
const child = spawn(chromeBinary(), [
  "--headless",
  "--no-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
  "--remote-debugging-port=0",
  "--no-first-run",
  "--no-default-browser-check",
  "--user-data-dir=" + directory,
  "about:blank",
], { stdio: "ignore" });

let connection;
let failed = false;
try {
  const port = await chromePort(directory, child);
  const targets = await (await fetch("http://127.0.0.1:" + port + "/json")).json();
  const target = targets.find((candidate) => candidate.type === "page");
  if (!target) throw new Error("Chrome did not expose a page target");

  connection = await connect(target.webSocketDebuggerUrl);
  await connection.send("Page.enable");
  await connection.send("Runtime.enable");

  const routes = [
    { path: "/", label: "Homepage" },
    { path: "/labs/", label: "Labs" },
    { path: "/learn/networking/", label: "Networking" },
    { path: "/learn/fortran/", label: "Fortran" },
    { path: "/disks/internet/", label: "Archive Internet" },
    { path: "/disks/gaming-history/", label: "Archive Gaming History" },
    { path: "/disks/oregon-trail/", label: "Archive Oregon Trail" },
  ];

  const findings = [];

  for (const size of [
    { width: 390, height: 844, mobile: true, label: "390px Chromium" },
    { width: 1280, height: 800, mobile: false, label: "1280px Chromium" },
  ]) {
    await connection.send("Emulation.setDeviceMetricsOverride", {
      width: size.width,
      height: size.height,
      mobile: size.mobile,
      deviceScaleFactor: size.mobile ? 3 : 1,
    });
    await connection.send("Emulation.setTouchEmulationEnabled", { enabled: size.mobile });

    for (const route of routes) {
      await connection.send("Emulation.setEmulatedMedia", {
        features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
      });
      await navigateReady(connection, origin, route);

      const probe = await evaluate(connection, "(" + (function () {
        const primaryTargets = Array.from(document.querySelectorAll(
          ".menu-toggle, .soft-button, .glass-button, a.artifact-card, .control-button, .nav-cta, .chapter-module-button, .osi-layer, .chapter-card-toggle",
        ))
          .filter((node) => {
            const box = node.getBoundingClientRect();
            const style = getComputedStyle(node);
            return box.width > 0 && box.height > 0 && style.visibility !== "hidden" && style.display !== "none";
          });

        const tooSmallTargets = primaryTargets
          .map((node) => {
            const box = node.getBoundingClientRect();
            return {
              label: (node.getAttribute("aria-label") || node.textContent || "").trim().slice(0, 50),
              tag: node.tagName.toLowerCase(),
              width: Math.round(box.width),
              height: Math.round(box.height),
            };
          })
          .filter((item) => item.width < 44 || item.height < 44)
          .map((item) => `${item.tag}:${item.label || "(no label)"}`);

        let focusRuleCount = 0;
        for (const sheet of Array.from(document.styleSheets)) {
          let rules;
          try {
            rules = sheet.cssRules;
          } catch {
            continue;
          }
          for (const rule of Array.from(rules)) {
            if (rule.selectorText?.includes(":focus-visible")) focusRuleCount += 1;
          }
        }

        const allLinks = Array.from(document.querySelectorAll("a[href]"));
        const hashMisses = allLinks
          .map((anchor) => anchor.getAttribute("href") || "")
          .filter((href) => href.startsWith("#") && href.length > 1)
          .filter((href) => !document.querySelector(href));

        const localLinks = Array.from(new Set(allLinks
          .map((anchor) => {
            const href = anchor.getAttribute("href") || "";
            if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return "";
            const parsed = new URL(href, location.href);
            if (parsed.origin !== location.origin) return "";
            return parsed.pathname;
          })
          .filter(Boolean)));

        const images = Array.from(document.images);
        const brokenImages = images
          .filter((img) => {
            if (!img.complete || img.naturalWidth > 0) return false;
            try {
              return new URL(img.currentSrc || img.src, location.href).origin === location.origin;
            } catch {
              return false;
            }
          })
          .map((img) => img.currentSrc || img.src);
        const overflow = Math.max(
          document.documentElement.scrollWidth - window.innerWidth,
          (document.body?.scrollWidth || 0) - window.innerWidth,
        );

        return {
          path: location.pathname,
          focusRuleCount,
          tooSmallTargets,
          hashMisses,
          localLinks,
          imageCount: images.length,
          brokenImages,
          overflow,
        };
      }).toString() + ")()", { label: `${route.label} probe failed` });

      if (probe.hashMisses.length > 0) {
        addFinding(findings, "high", `${size.label} · ${route.label}`, "Internal hash targets", `Missing ${probe.hashMisses.join(", ")}`, `Load ${route.path} and activate the listed # links.`);
      }
      if (probe.brokenImages.length > 0) {
        addFinding(findings, "high", `${size.label} · ${route.label}`, "Image loading", `Broken images: ${probe.brokenImages.join(", ")}`, `Load ${route.path} and inspect image requests in DevTools.`);
      }
      if (probe.overflow > 2) {
        addFinding(findings, "high", `${size.label} · ${route.label}`, "Horizontal overflow", `Content overflows viewport by ${Math.round(probe.overflow)}px`, `Open ${route.path} at ${size.width}px and check horizontal scroll.`);
      }
      if (probe.focusRuleCount === 0) {
        addFinding(findings, "medium", `${size.label} · ${route.label}`, "Focus indicator visibility", "No :focus-visible CSS rules detected in readable stylesheets", `Press Tab on ${route.path} and verify visible focus ring.`);
      }
      if (probe.tooSmallTargets.length > 0) {
        addFinding(findings, "low", `${size.label} · ${route.label}`, "Touch target size", `${probe.tooSmallTargets.length} sampled primary controls are below 44x44px`, `Inspect interactive controls on ${route.path} at ${size.width}px.`);
      }

      if (route.path === "/") {
        const homeInteraction = await evaluate(connection, "(" + (async function () {
          const wait = (ms) => new Promise((done) => setTimeout(done, ms));
          const menu = document.querySelector(".menu-toggle");
          if (!menu) return { menu: false, expanded: false };
          menu.click();
          await wait(80);
          return { menu: true, expanded: menu.getAttribute("aria-expanded") === "true" };
        }).toString() + ")()", { awaitPromise: true, label: "Homepage menu interaction failed" });
        if (homeInteraction.menu && !homeInteraction.expanded) {
          addFinding(findings, "high", `${size.label} · Homepage`, "Menu toggle interaction", "Menu button did not update aria-expanded after click", "Open homepage and activate the menu button once.");
        }
      }

      if (route.path === "/labs/") {
        const labsInteraction = await evaluate(connection, "(" + (function () {
          const card = document.querySelector('a.artifact-card[href*="learn/networking/"]');
          if (!card) return { found: false, href: "" };
          card.click();
          return { found: true, href: card.getAttribute("href") || "" };
        }).toString() + ")()", { label: "Labs interaction failed" });
        if (!labsInteraction.found) {
          addFinding(findings, "high", `${size.label} · Labs`, "Labs artifact navigation", "Networking artifact card not found", "Load /labs/ and inspect the artifact card links.");
        } else {
          let reached = false;
          for (let i = 0; i < 120; i += 1) {
            const state = await evaluate(connection, "location.pathname");
            if (state === "/learn/networking/") {
              reached = true;
              break;
            }
            await sleep(50);
          }
          if (!reached) {
            addFinding(findings, "high", `${size.label} · Labs`, "Labs artifact navigation", "Clicking networking artifact did not open /learn/networking/", "Open /labs/, activate the networking artifact card.");
          }
        }
      }

      if (route.path === "/learn/networking/") {
        const networkingInteraction = await evaluate(connection, "(" + (async function () {
          const wait = (ms) => new Promise((done) => setTimeout(done, ms));
          for (let i = 0; i < 150 && !window.networkingContentReady; i += 1) await wait(40);
          if (window.networkingContentReady) await window.networkingContentReady;
          const launch = document.querySelector('[data-module-open="module-1-1"]');
          if (!launch) return { found: false, dialog: false };
          launch.click();
          for (let i = 0; i < 80; i += 1) {
            if (document.getElementById("module-reader")?.open) return { found: true, dialog: true };
            await wait(40);
          }
          return { found: true, dialog: false };
        }).toString() + ")()", { awaitPromise: true, label: "Networking interaction failed" });
        if (!networkingInteraction.found || !networkingInteraction.dialog) {
          addFinding(findings, "high", `${size.label} · Networking`, "Lesson launch interaction", "Lesson launch did not open the reader dialog", "Open /learn/networking/ and activate the first lesson button.");
        }
      }

      if (route.path === "/learn/fortran/") {
        const fortranInteraction = await evaluate(connection, "(" + (async function () {
          const wait = (ms) => new Promise((done) => setTimeout(done, ms));
          const compile = document.querySelector('[data-action="compile"]');
          const link = document.querySelector('[data-action="link"]');
          if (!compile || !link) return { found: false, progressed: false };
          compile.click();
          for (let i = 0; i < 200; i += 1) {
            if (!link.disabled) return { found: true, progressed: true };
            await wait(40);
          }
          return { found: true, progressed: false };
        }).toString() + ")()", { awaitPromise: true, label: "Fortran interaction failed" });
        if (!fortranInteraction.found || !fortranInteraction.progressed) {
          addFinding(findings, "high", `${size.label} · Fortran`, "Compile interaction", "Compile action did not progress to link stage", "Open /learn/fortran/ and run Compile once.");
        }
      }

      const missingRoutes = [];
      for (const localPath of probe.localLinks) {
        await connection.send("Page.navigate", { url: origin + localPath + "?qa-link=" + Date.now() });
        let reached = false;
        for (let i = 0; i < 120; i += 1) {
          const state = await evaluate(connection, "({ ready: document.readyState, route: location.pathname })");
          if (state?.ready === "complete" && state.route === localPath) {
            reached = true;
            break;
          }
          await sleep(50);
        }
        if (!reached) missingRoutes.push(localPath);
      }
      if (missingRoutes.length > 0) {
        addFinding(findings, "high", `${size.label} · ${route.label}`, "Local route navigation", `Unreachable routes: ${missingRoutes.join(", ")}`, `Open ${route.path}, activate each local link, and verify destination loads.`);
      }

      await connection.send("Emulation.setEmulatedMedia", {
        features: [{ name: "prefers-reduced-motion", value: "reduce" }],
      });
      await navigateReady(connection, origin, route);
      const reducedMotion = await evaluate(connection, "(" + (function () {
        const moving = [
          ".forge-embers--near",
          ".forge-casting__stream",
          ".packet",
          ".build-stage",
          ".disk-glow",
        ];
        const samples = moving
          .map((selector) => document.querySelector(selector))
          .filter(Boolean)
          .slice(0, 5)
          .map((node) => {
            const style = getComputedStyle(node);
            const durations = style.animationDuration.split(",").map((token) => Number.parseFloat(token) || 0);
            const hasAnimation = style.animationName !== "none" && durations.some((value) => value > 0.01);
            return { hasAnimation };
          });

        return {
          reducedMotionMatches: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          activeAnimations: samples.filter((sample) => sample.hasAnimation).length,
          sampled: samples.length,
        };
      }).toString() + ")()", { label: `${route.label} reduced-motion probe failed` });

      if (!reducedMotion.reducedMotionMatches) {
        addFinding(findings, "high", `${size.label} · ${route.label}`, "Reduced motion emulation", "Browser did not apply prefers-reduced-motion: reduce", "Run the script in a Chromium build with Emulation.setEmulatedMedia support.");
      } else if (reducedMotion.sampled > 0 && reducedMotion.activeAnimations > 0) {
        addFinding(findings, "medium", `${size.label} · ${route.label}`, "Reduced motion behavior", `${reducedMotion.activeAnimations} of ${reducedMotion.sampled} sampled animated elements still run`, `Open ${route.path} with reduced-motion preference enabled and inspect animations.`);
      }

      console.log(`✓ ${size.label}: ${route.label}`);
    }
  }

  const high = findings.filter((finding) => finding.severity === "high");
  const medium = findings.filter((finding) => finding.severity === "medium");

  console.log("\nExperience QA regression evidence (Chromium emulation only):");
  console.log("- Viewports: 390px mobile emulation and 1280px desktop emulation");
  console.log("- Coverage: homepage, labs, networking, fortran, and archive routes");
  console.log("- Limits: does not represent physical iOS Safari or screen-reader output");

  if (findings.length === 0) {
    console.log("\nNo issues found in sampled checks.");
  } else {
    console.log(`\nFindings (${findings.length} total):`);
    for (const finding of findings) {
      console.log(`- [${finding.severity.toUpperCase()}] ${finding.route} · ${finding.check}`);
      console.log(`  details: ${finding.details}`);
      console.log(`  reproduce: ${finding.reproduction}`);
    }
  }

  if (high.length > 0) {
    failed = true;
    console.error(`\nFailing because ${high.length} high-severity issue(s) were detected.`);
  } else {
    console.log(`\nPassed with ${medium.length} medium warning(s) and no high-severity issues.`);
  }
} finally {
  connection?.close();
  child.kill("SIGTERM");
  await Promise.race([once(child, "exit"), sleep(2000)]);
  if (child.exitCode === null) child.kill("SIGKILL");
  await rm(directory, { recursive: true, force: true, maxRetries: 8, retryDelay: 200 });
  await new Promise((resolve) => server.close(resolve));
}

if (failed) process.exitCode = 1;
