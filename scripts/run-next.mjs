import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const command = process.argv[2] ?? "start";
const repoRoot = process.cwd();

function hasNonAscii(value) {
  return /[^\x00-\x7F]/.test(value);
}

function loadDotEnv(filepath) {
  if (!existsSync(filepath)) {
    return {};
  }

  const content = readFileSync(filepath, "utf8");
  const lines = content.split(/\r?\n/);
  const env = {};

  for (const line of lines) {
    if (!line || line.trim().startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

function run(commandPath, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(commandPath, args, {
      cwd: options.cwd ?? repoRoot,
      stdio: "inherit",
      shell: false,
      env: options.env ?? process.env
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      process.exit(code ?? 1);
      resolve();
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

  await new Promise((resolve, reject) => {
    const child = spawn("cmd.exe", ["/c", "subst", preferredDrive, repoRoot], {
      cwd: repoRoot,
      stdio: "inherit",
      shell: false
    });

    child.on("error", reject);
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`subst failed with code ${code}`))));
  });

  try {
    return await task(driveRoot);
  } finally {
    await new Promise((resolve) => {
      const child = spawn("cmd.exe", ["/c", "subst", preferredDrive, "/d"], {
        cwd: repoRoot,
        stdio: "ignore",
        shell: false
      });
      child.on("exit", () => resolve());
      child.on("error", () => resolve());
    });
  }
}

const env = {
  ...process.env,
  ...loadDotEnv(path.join(repoRoot, ".env"))
};

await withMappedDrive(async (mappedCwd) => {
  const nextBin = path.join(mappedCwd, "node_modules", "next", "dist", "bin", "next");
  await run(process.execPath, [nextBin, command], {
    cwd: mappedCwd,
    env
  });
});
