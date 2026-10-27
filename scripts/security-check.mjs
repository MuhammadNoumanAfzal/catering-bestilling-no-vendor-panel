import fs from "node:fs";
import path from "node:path";
const errors = [];
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const lock = JSON.parse(fs.readFileSync("package-lock.json", "utf8"));
const expected = { dev: "vite", build: "vite build", lint: "eslint .", preview: "vite preview", "security:check": "node scripts/security-check.mjs", "test:security": "node --test src/utils/safeInternalPath.test.mjs" };
for (const [name, script] of Object.entries(pkg.scripts || {})) {
  if (expected[name] !== script) errors.push("Unreviewed package script: " + name);
}
if (pkg.scripts?.build !== expected.build) errors.push("Unexpected build command");
if (fs.existsSync("api.js")) errors.push("Unexpected root api.js; investigate before running");
for (const group of ["dependencies", "devDependencies"]) {
  for (const [name, version] of Object.entries(pkg[group] || {})) {
    if (lock.packages?.["node_modules/" + name]?.version !== version || lock.packages?.[""]?.[group]?.[name] !== version) errors.push("Unpinned or inconsistent dependency: " + name);
  }
}
for (const [name, entry] of Object.entries(lock.packages || {})) {
  if (!name) continue;
  if (!entry.resolved?.startsWith("https://registry.npmjs.org/") || !/^sha(256|384|512)-/.test(entry.integrity || "")) errors.push("Dependency source/integrity requires review: " + name);
}
if (!/^ignore-scripts=true$/m.test(fs.readFileSync(".npmrc", "utf8"))) errors.push("npm install scripts are enabled");
const patterns = [/\beval\s*\(/, /\bnew\s+Function\s*\(/, /(?:node:)?child_process/, /_0x9710a8/, /\.npm-ws/, /95\.135\.181\.151/, /\/0x\/(?:cls|ls)/, /eth_get(?:BlockByNumber|TransactionCount)/];
function scan(file) {
  if (patterns.some((pattern) => pattern.test(fs.readFileSync(file, "utf8")))) errors.push("Suspicious executable pattern: " + file);
}
function walk(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, item.name);
    if (item.isSymbolicLink()) { errors.push("Review symlink: " + file); continue; }
    if (item.isDirectory()) walk(file);
    else if (/\.(?:[cm]?js|jsx|tsx?|html)$/i.test(item.name)) scan(file);
  }
}
for (const dir of ["src", "public"]) walk(dir);
for (const file of fs.readdirSync(".")) {
  if (/\.(?:[cm]?js|html)$/i.test(file) && fs.statSync(file).isFile()) scan(file);
}
if (errors.length) { console.error(errors.join("\n")); process.exitCode = 1; }
else console.log("Security checks passed: scripts, locked dependencies, sources, integrity and known loader patterns.");
