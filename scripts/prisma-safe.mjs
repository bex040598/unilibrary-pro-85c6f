import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const repoRoot = process.cwd();

function hasNonAscii(value) {
  return /[^\x00-\x7F]/.test(value);
}

function run(command, commandArgs, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      cwd: options.cwd ?? repoRoot,
      stdio: "inherit",
      shell: false,
      env: options.env ?? process.env
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${commandArgs.join(" ")} exited with code ${code}`));
    });
  });
}

async function withMappedDrive(task) {
  const preferredDrive = process.env.PRISMA_MAPPED_DRIVE ?? "X:";
  const driveRoot = `${preferredDrive}\\`;

  if (process.platform !== "win32" || !hasNonAscii(repoRoot)) {
    return task(repoRoot);
  }

  if (existsSync(driveRoot)) {
    return task(driveRoot);
  }

  await run("cmd.exe", ["/c", "subst", preferredDrive, repoRoot], { cwd: repoRoot });

  try {
    return await task(driveRoot);
  } finally {
    await run("cmd.exe", ["/c", "subst", preferredDrive, "/d"], { cwd: repoRoot }).catch(() => {});
  }
}

async function main() {
  await withMappedDrive(async (mappedCwd) => {
    const env = { ...process.env };
    const prismaBin = path.join(mappedCwd, "node_modules", "prisma", "build", "index.js");

    if (!env.DATABASE_URL) {
      env.DATABASE_URL = args.some((value) => value.endsWith("schema.sqlite.prisma"))
        ? "file:./dev.db"
        : "postgresql://postgres:postgres@localhost:5432/unilibrary?schema=public";
    }

    await run(process.execPath, [prismaBin, ...args], { cwd: mappedCwd, env });
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
