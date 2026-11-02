import { spawn } from "node:child_process";

const services = [
  {
    name: "API",
    args: ["--filter", "@workspace/api-server", "run", "dev"],
    port: "8080",
  },
  {
    name: "Web",
    args: ["--filter", "@workspace/craftloop", "run", "dev"],
    port: "5000",
  },
];

const children = [];
let shuttingDown = false;
let exitCode = 0;

function stop(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  exitCode = code;

  for (const child of children) child.kill("SIGTERM");

  const forceStop = setTimeout(() => {
    for (const child of children) child.kill("SIGKILL");
    process.exit(exitCode);
  }, 5_000);
  forceStop.unref();
}

for (const service of services) {
  const child = spawn("pnpm", service.args, {
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "development",
      PORT: service.port,
    },
  });

  children.push(child);

  child.on("error", (error) => {
    console.error(`[${service.name}] failed to start: ${error.message}`);
    stop(1);
  });

  child.on("exit", (code, signal) => {
    if (!shuttingDown) {
      console.error(
        `[${service.name}] exited unexpectedly (${signal ?? code ?? "unknown"})`,
      );
      stop(code ?? 1);
      return;
    }

    if (
      children.every(
        (runningChild) =>
          runningChild.exitCode !== null || runningChild.signalCode !== null,
      )
    ) {
      process.exit(exitCode);
    }
  });
}

process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));
