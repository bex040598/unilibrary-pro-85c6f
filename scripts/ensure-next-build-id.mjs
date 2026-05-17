import fs from "node:fs";
import path from "node:path";

const buildDir = path.join(process.cwd(), ".next");
const buildIdPath = path.join(buildDir, "BUILD_ID");

if (!fs.existsSync(buildDir)) {
  console.error(".next build directory was not found");
  process.exit(1);
}

if (!fs.existsSync(buildIdPath)) {
  fs.writeFileSync(buildIdPath, `atmu-build-${Date.now()}\n`, "utf8");
  console.log("BUILD_ID was missing and has been created.");
} else {
  console.log("BUILD_ID already exists.");
}
