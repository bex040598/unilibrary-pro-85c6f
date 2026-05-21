import { spawn } from "node:child_process";
import path from "node:path";
import { existsSync, readFileSync } from "node:fs";

const target = process.argv[2] ?? "postgres";
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

function loadDotEnv(cwd) {
  const envPath = path.join(cwd, ".env");

  if (!existsSync(envPath)) {
    return {};
  }

  return readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.trim().startsWith("#") && line.includes("="))
    .reduce((acc, line) => {
      const index = line.indexOf("=");
      const key = line.slice(0, index).trim();
      const rawValue = line.slice(index + 1).trim();
      const value = rawValue.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
      acc[key] = value;
      return acc;
    }, {});
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
    const tsxBin = path.join(mappedCwd, "node_modules", "tsx", "dist", "cli.mjs");
    const loadedEnv = loadDotEnv(repoRoot);

    await run(process.execPath, [tsxBin, "prisma/seed.ts"], {
      cwd: mappedCwd,
      env: {
        ...process.env,
        ...loadedEnv,
        DATABASE_URL:
          target === "sqlite"
            ? "file:./dev.db"
            : process.env.DATABASE_URL ??
              loadedEnv.DATABASE_URL ??
              "postgresql://postgres:postgres@localhost:5432/unilibrary?schema=public"
      }
    });
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
