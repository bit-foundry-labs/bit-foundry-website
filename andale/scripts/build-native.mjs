/* Assemble the same static app for Capacitor's local iOS WebView bundle. */
import { cp, copyFile, mkdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const webDir = join(root, "www");
await rm(webDir, { recursive: true, force: true });
await mkdir(webDir, { recursive: true });
await Promise.all(["index.html", "manifest.webmanifest", "service-worker.js"].map(
  file => copyFile(join(root, file), join(webDir, file))
));
await cp(join(root, "assets"), join(webDir, "assets"), { recursive: true });
console.log("¡Ándale! iOS web bundle assembled at", webDir);
