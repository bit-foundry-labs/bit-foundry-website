import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * The original standalone HTML/JS labs remain authoritative and functional.
 * Vite owns /index.html only. Existing secondary routes are copied untouched,
 * except for adding a shared stylesheet after each page's original styles.
 */
export const preserveLegacySite = (root, output) => {
  const directories = ["assets", "disks", "forgeloop", "labs", "learn", "styles"];
  const files = ["styles.css", "learn.js", "script.js"];
  mkdirSync(output, { recursive: true });

  for (const entry of [...directories, ...files]) {
    const source = join(root, entry);
    if (!existsSync(source)) throw new Error(`Missing original site content: ${entry}`);
    cpSync(source, join(output, entry), { recursive: true, force: true });
  }

  const pages = [
    "disks/internet/index.html",
    "disks/gaming-history/index.html",
    "disks/oregon-trail/index.html",
    "forgeloop/index.html",
    "labs/index.html",
    "labs/lan/index.html",
    "learn/networking/index.html",
    "learn/fortran/index.html",
  ];
  for (const page of pages) {
    const destination = join(output, page);
    if (!existsSync(destination)) throw new Error(`Missing preserved page: ${page}`);
    if (page === "forgeloop/index.html") continue;
    const cssPath = relative(dirname(page), "legacy-theme.css").replaceAll("\\", "/");
    const source = readFileSync(destination, "utf8");
    if (!source.includes("</head>")) throw new Error(`Missing head in ${page}`);
    const stylesheet = `<link rel="stylesheet" href="${cssPath}">`;
    writeFileSync(destination, source.replace("</head>", `  ${stylesheet}\n</head>`));
  }
  return pages;
};

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  preserveLegacySite(process.cwd(), join(process.cwd(), "dist"));
}
