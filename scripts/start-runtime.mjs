import { spawn } from "node:child_process";

function runScript(script) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script], {
      cwd: process.cwd(),
      stdio: "inherit",
      shell: false,
      env: process.env
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      process.exit(code ?? 1);
      resolve();
    });
  });
}

const isRenderRuntime =
  process.env.RENDER === "true" ||
  typeof process.env.RENDER_EXTERNAL_URL === "string" ||
  typeof process.env.RENDER_SERVICE_ID === "string";

if (isRenderRuntime) {
  await runScript("./scripts/render-start.mjs");
} else {
  await runScript("./scripts/run-next.mjs");
}
