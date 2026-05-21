import { spawn } from "node:child_process";

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? process.cwd(),
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

      reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

function normalizeDatabaseUrl(rawUrl = process.env.DATABASE_URL) {
  if (!rawUrl) {
    return null;
  }

  if (rawUrl.startsWith("postgres://")) {
    return rawUrl.replace(/^postgres:\/\//, "postgresql://");
  }

  return rawUrl;
}

function summarizeDatabaseUrl(rawUrl) {
  if (!rawUrl) {
    return { configured: false, host: null, database: null };
  }

  try {
    const url = new URL(rawUrl);
    return {
      configured: true,
      host: url.hostname || null,
      database: url.pathname.replace(/^\//, "") || null
    };
  } catch {
    return {
      configured: false,
      host: null,
      database: null
    };
  }
}

async function main() {
  const cwd = process.cwd();
  const databaseUrl = normalizeDatabaseUrl();
  const summary = summarizeDatabaseUrl(databaseUrl);

  if (!databaseUrl) {
    console.error("[render-start] DATABASE_URL is missing. Refusing to start with a broken database configuration.");
    process.exit(1);
  }

  console.log(`[render-start] Starting deploy with database host=${summary.host ?? "unknown"} db=${summary.database ?? "unknown"}`);

  const env = {
    ...process.env,
    DATABASE_URL: databaseUrl
  };

  await run(process.execPath, ["./node_modules/prisma/build/index.js", "migrate", "deploy", "--schema", "prisma/schema.prisma"], {
    cwd,
    env
  });

  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient({
    datasourceUrl: databaseUrl,
    log: ["error"]
  });

  try {
    await prisma.$connect();
    const userCount = await prisma.user.count();
    console.log(`[render-start] Database connected. userCount=${userCount}`);

    if (userCount === 0) {
      console.log("[render-start] Empty database detected. Running seed once.");
      await run(process.execPath, ["./scripts/run-seed.mjs", "postgres"], {
        cwd,
        env: {
          ...env,
          ALLOW_PRODUCTION_SEED: "true"
        }
      });
    }
  } finally {
    await prisma.$disconnect().catch(() => {});
  }

  await run(process.execPath, ["./node_modules/next/dist/bin/next", "start"], {
    cwd,
    env
  });
}

main().catch((error) => {
  console.error("[render-start] Fatal startup error");
  console.error(error);
  process.exit(1);
});
