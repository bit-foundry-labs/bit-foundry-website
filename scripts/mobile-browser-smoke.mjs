/**
 * Headless Chromium browser smoke tests (Node 22+, no third-party packages).
 * Exercises the built networking reader and model at 390px and 1280px widths.
 */
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join, resolve, sep } from "node:path";
import { once } from "node:events";

const root = resolve("dist");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".webp": "image/webp", ".svg": "image/svg+xml" };
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
  throw new Error("Install Chrome or Chromium to run browser smoke tests");
}
async function chromePort(dir, child) {
  // Shared CI workers can be slow to launch Chromium after pnpm and Vite.
  // Still fail explicitly if DevTools never starts; do not skip browser checks.
  for (let i = 0; i < 300; i += 1) {
    if (child.exitCode !== null) throw new Error("Chrome exited before starting DevTools");
    try {
      const port = Number.parseInt((await readFile(join(dir, "DevToolsActivePort"), "utf8")).split("\n")[0], 10);
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
    close() { socket.close(); },
  };
}
const probe = "(" + (async function () {
  const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
  for (let i = 0; i < 120 && !window.networkingContentReady; i += 1) await sleep(60);
  if (!window.networkingContentReady) throw new Error("Course loader missing");
  await Promise.race([
    window.networkingContentReady,
    sleep(9000).then(() => { throw new Error("Course content timed out"); }),
  ]);
  const first = document.querySelector('[data-module-open="module-1-1"]');
  const second = document.querySelector('[data-module-open="module-1-4"]');
  if (!first || !second) throw new Error("Lesson launch buttons missing");
  first.click();
  await sleep(75);
  const dialog = document.getElementById("module-reader");
  const page = document.getElementById("reader-page");
  const title = page.querySelector("h2");
  const intro = page.querySelector(".reader-intro");
  const titleBox = title?.getBoundingClientRect();
  const introBox = intro?.getBoundingClientRect();
  const mobile = innerWidth <= 640;
  const content = {
    width: innerWidth,
    open: dialog.open,
    display: getComputedStyle(page).display,
    paragraphWidth: introBox?.width || 0,
    vertical: Boolean(titleBox && introBox && titleBox.bottom <= introBox.top + 8),
    fits: Boolean(introBox && introBox.left >= -1 && introBox.right <= innerWidth + 2),
    mobileGuide: Boolean(page.querySelector(".reader-phone-guide")),
  };
  second.click();
  await sleep(75);
  const lab = page.querySelector("[data-encapsulation-lab]");
  const action = lab?.querySelector("[data-encapsulation-next]");
  const unit = lab?.querySelector("[data-encapsulation-unit]");
  const before = unit?.textContent;
  action?.click();
  await sleep(20);
  return { content, model: {
    found: Boolean(lab), button: Boolean(action),
    before, after: unit?.textContent || "",
    width: lab?.getBoundingClientRect().width || 0,
  } };
}).toString() + ")()";

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = "http://127.0.0.1:" + server.address().port;
const directory = await mkdtemp(join(tmpdir(), "bitfoundry-browser-"));
const child = spawn(chromeBinary(), [
  "--headless=new", "--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu",
  "--remote-debugging-port=0", "--no-first-run", "--no-default-browser-check",
  "--user-data-dir=" + directory, "about:blank",
], { stdio: "ignore" });
let connection;
try {
  const port = await chromePort(directory, child);
  const targets = await (await fetch("http://127.0.0.1:" + port + "/json")).json();
  const target = targets.find((candidate) => candidate.type === "page");
  assert.ok(target, "Chrome must expose a page");
  connection = await connect(target.webSocketDebuggerUrl);
  await connection.send("Page.enable");
  await connection.send("Runtime.enable");
  for (const size of [{ width: 390, height: 844, mobile: true }, { width: 1280, height: 800, mobile: false }]) {
    await connection.send("Emulation.setDeviceMetricsOverride", {
      width: size.width, height: size.height, mobile: size.mobile,
      deviceScaleFactor: size.mobile ? 3 : 1,
    });
    await connection.send("Emulation.setTouchEmulationEnabled", { enabled: size.mobile });
    await connection.send("Page.navigate", { url: origin + "/learn/networking/?test=" + size.width });
    let ready = false;
    for (let i = 0; i < 140; i += 1) {
      try {
        const state = await connection.send("Runtime.evaluate", {
          expression: "({ready:document.readyState,route:location.pathname})", returnByValue: true,
        });
        if (state.result?.value?.ready === "complete" && state.result.value.route === "/learn/networking/") {
          ready = true;
          break;
        }
      } catch {}
      await sleep(70);
    }
    assert.equal(ready, true, "Networking document should load in Chrome");
    const evaluated = await connection.send("Runtime.evaluate", {
      expression: probe, awaitPromise: true, returnByValue: true,
    });
    if (evaluated.exceptionDetails) {
      throw new Error("Browser probe: " + (evaluated.exceptionDetails.exception?.description || evaluated.exceptionDetails.text));
    }
    const actual = evaluated.result?.value;
    assert.ok(actual, "Browser probe must return results");
    assert.equal(actual.content.width, size.width, "Emulated viewport width");
    assert.equal(actual.content.open, true, "Reader dialog should open");
    assert.equal(actual.content.display, "block", "Reader content should flow vertically");
    assert.equal(actual.content.vertical, true, "Text should stack below its title");
    assert.equal(actual.content.fits, true, "Lesson text should fit the viewport");
    assert.ok(actual.content.paragraphWidth >= (size.mobile ? 250 : 350), "Text should not be squeezed");
    assert.equal(actual.content.mobileGuide, size.mobile);
    assert.equal(actual.model.found, true, "Interactive encapsulation model should render");
    assert.equal(actual.model.button, true);
    assert.notEqual(actual.model.before, actual.model.after, "Model button should advance the simulation");
    assert.ok(actual.model.width > 200);
    console.log("✓ " + size.width + "px: reader layout and interactive model");
    // The same real browser also checks the React homepage and the first-party
    // foundry illustration. This catches missing artwork and mobile headline overflow.
    await connection.send("Page.navigate", { url: origin + "/?forge-test=" + size.width });
    const forgeProbe = "(" + (async function () {
      const pause = (ms) => new Promise((done) => setTimeout(done, ms));
      for (let i = 0; i < 90 && !document.querySelector(".forge-scene"); i += 1) await pause(55);
      const hero = document.querySelector(".forge-scene");
      if (!hero) throw new Error("Foundry scene did not mount");
      const art = hero.querySelector(".forge-art");
      const image = art?.querySelector(".forge-art__image");
      for (let i = 0; i < 80 && image && !image.complete; i += 1) await pause(55);
      const reflection = art?.querySelector(".forge-art__reflection");
      const h1 = hero.querySelector("h1");
      const words = Array.from(h1.querySelectorAll(".split-text")).map((node) => node.getBoundingClientRect());
      const section = hero.querySelector(".hero-copy");

      return {
        heading: Array.from(h1.querySelectorAll(".split-text")).map((node) => node.getAttribute("aria-label")).join(" "),
        artworkPresent: !!image && image.complete && image.naturalWidth > 0 && art.getAttribute("aria-hidden") === "true",
        reflectionAnimated: !!reflection && getComputedStyle(reflection).animationName.includes("casting-reflection"),
        lettersFit: words.every((box) => box.left >= -2 && box.right <= innerWidth + 2),
        titleVisible: getComputedStyle(section).display !== "none",
        castings: Array.from(document.querySelectorAll(".forge-casting")).map((casting) => {
          const bounds = casting.getBoundingClientRect();
          return {
            tool: casting.className,
            decorative: casting.getAttribute("aria-hidden") === "true",
            fits: bounds.left >= -2 && bounds.right <= innerWidth + 2,
            paths: casting.querySelectorAll("svg path").length,
            animated: getComputedStyle(casting.querySelector(".forge-casting__stream")).animationName.includes("forge-stream-cast"),
          };
        }),
      };
    }).toString() + ")()";
    const forgeEvaluated = await connection.send("Runtime.evaluate", {
      expression: forgeProbe, awaitPromise: true, returnByValue: true,
    });
    if (forgeEvaluated.exceptionDetails) {
      throw new Error("Foundry browser probe: " +
        (forgeEvaluated.exceptionDetails.exception?.description || forgeEvaluated.exceptionDetails.text));
    }
    const forge = forgeEvaluated.result?.value;
    assert.ok(forge?.heading.includes("Welcome to") && forge.heading.includes("the Foundry."));
    assert.equal(forge.artworkPresent, true, "Decorative forge artwork must render");
    assert.equal(forge.reflectionAnimated, true, "Forge reflection should animate");
    assert.equal(forge.lettersFit, true, "Hero lettering should fit the phone and desktop viewport");
    assert.equal(forge.titleVisible, true);
    assert.equal(forge.castings.length, 3, "Only three illustrative casts remain after deleting filler sections");
    assert.ok(forge.castings.every((casting) => casting.decorative && casting.fits && casting.paths >= 4));
    assert.ok(forge.castings.every((casting) => casting.animated), "Native scroll-timeline effects should initialize");
    console.log("✓ " + size.width + "px: forge castings fit the viewport and animate");
    console.log("✓ " + size.width + "px: foundry hero artwork, typography and animation");

    const materialCheck = await connection.send("Runtime.evaluate", {
      expression: "(" + (function () {
        const nav = document.querySelector(".nav-shell");
        const archive = document.querySelector(".archive-section");
        const button = document.querySelector(".soft-button");
        return {
          navBorder: getComputedStyle(nav).borderTopColor,
          seam: getComputedStyle(document.querySelector(".about-section"), "::after").backgroundImage,
          archiveSurface: getComputedStyle(archive).backgroundColor,
          buttonGlint: getComputedStyle(button, "::after").content,
          token: getComputedStyle(document.documentElement).getPropertyValue("--forge-ember").trim(),
        };
      }).toString() + ")()", returnByValue: true,
    });
    if (materialCheck.exceptionDetails) throw new Error("Forge theme computed-style check failed");
    const material = materialCheck.result.value;
    assert.equal(material.token, "#ff742f");
    assert.ok(material.seam.includes("linear-gradient"),"Thin ember seam should separate the scenes");
    assert.ok(material.buttonGlint && material.buttonGlint !== "none");
    assert.ok(material.archiveSurface !== "rgba(0, 0, 0, 0)");
    console.log("✓ " + size.width + "px: forge materials, metallic seams and interaction styling");

    const editorial = await connection.send("Runtime.evaluate", {
      expression: "(" + (async function () {
        const nav=document.querySelector(".nav-shell");
        const button=document.querySelector(".menu-toggle");
        const hero=document.querySelector(".forge-scene");
        const labs=document.querySelector("#labs");
        const archive=document.querySelector(".archive-section");
        const navRect=nav.getBoundingClientRect();
        const archiveTitle=archive.querySelector("h2");
        const before=button.getAttribute("aria-expanded");
        button.click();
        await new Promise(done=>setTimeout(done,75));
        const expanded=button.getAttribute("aria-expanded");
        const menu=document.querySelector(".menu-layer");
        const navLinks=Array.from(menu.querySelectorAll("nav a"));
        const links=navLinks.map(a=>a.getAttribute("aria-label"));
        const hubPath=navLinks.find(a=>a.getAttribute("aria-label")==="Labs")?.getAttribute("href");
        const footerHubPath=document.querySelector("footer a[href='/labs/']")?.getAttribute("href");
        const aboutHubPath=document.querySelector(".about-section a.soft-button")?.getAttribute("href");
        const menuVisible=getComputedStyle(menu).visibility;
        button.click();
        return {
          before,expanded,menuVisible,links,hubPath,footerHubPath,aboutHubPath,
          buttonLabel:button.textContent.trim(),
          navWidth:navRect.width,
          navRight:navRect.right,
          heroMetadata:hero.querySelectorAll(".hero-coordinate,.hero-kicker").length,
          fillerSections:document.querySelectorAll(".method-section,.lab-intro").length,
          labsId:labs.className,
          archColor:getComputedStyle(archive).color,
          archBg:getComputedStyle(archive).backgroundColor,
          archiveTitleWithinWidth:(()=>{const r=archiveTitle.getBoundingClientRect();return r.left>=-2&&r.right<=innerWidth+2;})()
        };
      }).toString() + ")()",awaitPromise:true,returnByValue:true,
    });
    if(editorial.exceptionDetails) throw new Error("Editorial controls: "+editorial.exceptionDetails.text);
    const ui=editorial.result?.value;
    assert.equal(ui.before,"false");
    assert.equal(ui.expanded,"true");
    assert.equal(ui.menuVisible,"visible");
    assert.ok(ui.links.includes("Networking")&&ui.links.includes("Fortran"));
    assert.equal(ui.hubPath,"/labs/","Labs menu item should reach the actual hub");
    assert.equal(ui.footerHubPath,"/labs/","Footer Labs link should reach the hub");
    assert.equal(ui.aboutHubPath,"/labs/","About CTA should reach the hub");
    assert.ok(ui.navWidth<=220&&ui.navRight<=size.width+2,"Only small floating menu should cover the hero");
    assert.equal(ui.heroMetadata,0);
    assert.equal(ui.fillerSections,0);
    assert.ok(ui.labsId.includes("project-network"));
    assert.equal(ui.archiveTitleWithinWidth,true);
    console.log("✓ " + size.width + "px: floating menu, no microcopy, no filler and readable dark archive");

    // Real interaction check: the original photograph is preserved, and a
    // keyboard/touch-accessible control reveals a clipped technical layer.
    const xrayCheck = await connection.send("Runtime.evaluate", {
      expression: "(" + (async function () {
        const sleep = (ms) => new Promise(done => setTimeout(done,ms));
        const button=document.querySelector(".xray-toggle");
        const stage=document.querySelector(".xray-stage");
        const machine=stage?.querySelector("svg");
        if(!button||!machine)throw new Error("X-ray controls missing");
        const before=button.getAttribute("aria-pressed");
        const image=machine.querySelector('image[href="/assets/retro-computer-front.webp"]');
        const clip=machine.querySelector("#xray-inspection-lens circle");
        button.click();
        await sleep(50);
        const opened={
          pressed:button.getAttribute("aria-pressed"),
          active:stage.getAttribute("data-inspecting"),
          radius:Number(clip.getAttribute("r")),
          label:document.querySelector(".xray-panel-readout strong")?.textContent,
        };
        const rect=machine.getBoundingClientRect();
        machine.dispatchEvent(new PointerEvent("pointermove",{
          bubbles:true, pointerType:"mouse",
          clientX:rect.left+rect.width*.63,
          clientY:rect.top+rect.height*.39,
        }));
        await sleep(50);
        const moved={
          radius:Number(clip.getAttribute("r")),
          label:document.querySelector(".xray-panel-readout strong")?.textContent,
          x:Number(clip.getAttribute("cx")),
        };
        button.click();
        await sleep(50);
        return {
          before, image:!!image, opened, moved,
          closed:button.getAttribute("aria-pressed"),
          fits: (()=>{ const r=button.getBoundingClientRect();return r.left>=-2&&r.right<=innerWidth+2; })(),
        };
      }).toString() + ")()", awaitPromise: true, returnByValue: true,
    });
    if(xrayCheck.exceptionDetails)throw new Error("X-ray browser probe: "+
      (xrayCheck.exceptionDetails.exception?.description||xrayCheck.exceptionDetails.text));
    const xr=xrayCheck.result?.value;
    assert.equal(xr.before,"false");
    assert.equal(xr.image,true);
    assert.equal(xr.opened.pressed,"true");
    assert.equal(xr.opened.active,"true");
    assert.equal(xr.opened.radius,226);
    assert.ok(xr.opened.label.length>0);
    assert.equal(xr.moved.radius,226);
    assert.ok(xr.moved.x>=270&&xr.moved.x<=1190);
    assert.equal(xr.closed,"false");
    assert.equal(xr.fits,true,"Inspect control fits the viewport");
    console.log("✓ " + size.width + "px: x-ray inspector toggle, lens tracking and layout");

    // Normal page flow, central exhibit, and a three-state SVG instrument.
    const flowResponse = await connection.send("Runtime.evaluate", {
      expression: "(" + (async function () {
        const pause=(ms)=>new Promise(done=>setTimeout(done,ms));
        const sceneClasses=["hero-sticky","artifact-sticky","project-sticky","closing-sticky"];
        const positions=sceneClasses.map(name=>({
          name,position:getComputedStyle(document.querySelector("."+name)).position
        }));
        const exhibit=document.querySelector(".artifact-sticky--xray");
        const machine=exhibit.querySelector(".xray-stage").getBoundingClientRect();
        const exhibitBox=exhibit.getBoundingClientRect();
        const centered=Math.abs((machine.left+machine.right)/2-(exhibitBox.left+exhibitBox.right)/2);
        const circuit=document.querySelector(".molten-circuit");
        const buttons=Array.from(circuit.querySelectorAll(".molten-circuit__phase"));
        const sequence=[];
        for (const button of buttons) {
          button.click();
          await pause(40);
          sequence.push({
            name:button.textContent,
            pressed:button.getAttribute("aria-pressed"),
            className:circuit.className,
            title:circuit.querySelector(".molten-circuit__readout strong").textContent
          });
        }
        const bounds=circuit.getBoundingClientRect();
        return {
          positions,centered,
          machineWidth:machine.width,
          sequence,
          stageFits:bounds.left>=-2 && bounds.right<=innerWidth+2,
          imageWithinMachine:machine.width<=innerWidth+2,
          panelsSeparated:(()=>{
            const copy=document.querySelector(".project-network .project-copy").getBoundingClientRect();
            return innerWidth<=760 ? copy.bottom<=bounds.top+2 : copy.right<=bounds.left-8;
          })()
        };
      }).toString() + ")()",awaitPromise:true,returnByValue:true,
    });
    if(flowResponse.exceptionDetails)throw new Error("Flow and circuitry: "+
      (flowResponse.exceptionDetails.exception?.description||flowResponse.exceptionDetails.text));
    const flow=flowResponse.result?.value;
    assert.ok(flow.positions.every(s=>s.position==="relative"),"No scene may pin the page");
    assert.ok(flow.centered<=2,"X-ray computer should be horizontally centered");
    assert.ok(flow.machineWidth>250);
    assert.equal(flow.stageFits,true,"Circuitry should fit the viewport");
    assert.equal(flow.imageWithinMachine,true);
    assert.equal(flow.panelsSeparated,true,"Showcase copy and circuitry must not overlap");
    assert.deepEqual(flow.sequence.map(s=>s.pressed),["true","true","true"]);
    assert.deepEqual(flow.sequence.map(s=>s.className.split(" ").at(-1)),
      ["molten-circuit--pour","molten-circuit--temper","molten-circuit--conduct"]);
    assert.ok(flow.sequence.every(s=>s.title.length>8));
    console.log("✓ " + size.width + "px: natural scroll, centered X-ray, and three-stage molten circuitry");

    await connection.send("Page.navigate", { url: origin + "/labs/?forge-theme=" + size.width });
    const labsProbe = "(" + (async function () {
      for(let i=0;i<100&&(!document.querySelector(".artifact-card")||document.readyState!=="complete");i++)
        await new Promise(done=>setTimeout(done,60));
      const cards = Array.from(document.querySelectorAll(".artifact-card"));
      return {
        className: document.body.className,
        token: getComputedStyle(document.body).getPropertyValue("--forest").trim(),
        cardCount: cards.length,
        cardFits: cards.every(card=> {
          const box = card.getBoundingClientRect();
          return box.left>=-2 && box.right<=innerWidth+2;
        }),
        cardBorder: cards.length?getComputedStyle(cards[0]).borderTopColor:"",
      };
    }).toString() + ")()";
    const labsResponse = await connection.send("Runtime.evaluate", {
      expression: labsProbe, awaitPromise: true, returnByValue: true,
    });
    if(labsResponse.exceptionDetails) throw new Error("Labs theme probe: " +
      (labsResponse.exceptionDetails.exception?.description || labsResponse.exceptionDetails.text));
    const labs = labsResponse.result?.value;
    assert.ok(labs?.className.includes("labs-page"));
    assert.equal(labs.token, "#ff8239");
    assert.ok(labs.cardCount >= 5);
    assert.equal(labs.cardFits, true, "Lab cards must fit without horizontal overflow");
    console.log("✓ " + size.width + "px: labs forge theme and card reflow");

  }
} finally {
  connection?.close();
  child.kill("SIGTERM");
  await Promise.race([once(child, "exit"), sleep(2000)]);
  if (child.exitCode === null) child.kill("SIGKILL");
  await rm(directory, { recursive: true, force: true, maxRetries: 8, retryDelay: 200 });
  await new Promise((resolve) => server.close(resolve));
}
