import { existsSync, readFileSync } from "node:fs";

const files = [
  "dist/index.html", "dist/legacy-theme.css", "dist/assets/retro-computer-front.webp",
  "dist/learn/networking/index.html", "dist/learn/networking/course-reader.js",
  "dist/learn/networking/course-lessons.js", "dist/learn/fortran/index.html",
  "dist/labs/index.html", "dist/labs/lan/index.html", "dist/disks/internet/index.html",
  "dist/disks/gaming-history/index.html", "dist/disks/oregon-trail/index.html",
  "dist/disks/oregon-trail/game.js", "dist/learn.js", "dist/styles.css"
];
for (const file of files) if (!existsSync(file)) throw new Error(`Missing site asset: ${file}`);
const home = readFileSync("dist/index.html", "utf8");
if (!home.includes("Bit Foundry Labs")) throw new Error("Homepage not built");
for (const page of files.filter((file) => file.endsWith("index.html") && file !== "dist/index.html")) {
  if (!readFileSync(page, "utf8").includes("legacy-theme.css")) {
    throw new Error(`Page omitted the design bridge: ${page}`);
  }
}
console.log(`Verified ${files.length} essential homepage, lessons, labs, game and asset files.`);