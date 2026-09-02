import { MongoMemoryServer } from "mongodb-memory-server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// Storing the data files on disk means content survives a restart, unlike a
// pure in-memory instance. Delete .mongo-data to start from scratch.
const dbPath = path.join(root, ".mongo-data");
fs.mkdirSync(dbPath, { recursive: true });

const isWin = process.platform === "win32";
const npmCmd = isWin ? "npm.cmd" : "npm";
const shouldSeed = process.argv.includes("--seed") || !fs.existsSync(path.join(dbPath, "WiredTiger"));

function run(cmd, args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit", shell: true, env });
    child.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`${cmd} exited with ${code}`)),
    );
  });
}

async function start() {
  console.log("Starting local MongoDB...");
  const mongod = await MongoMemoryServer.create({
    instance: { port: 27017, dbName: "bhancer", dbPath, storageEngine: "wiredTiger" },
    // The first run downloads a mongod binary; give it room.
    launchTimeout: 180_000,
  });

  const uri = `${mongod.getUri()}bhancer`;
  const env = { ...process.env, MONGODB_URI: uri };
  console.log(`MongoDB running at ${uri}`);

  const shutdown = async (code = 0) => {
    await mongod.stop();
    process.exit(code);
  };
  process.on("SIGINT", () => shutdown(0));
  process.on("SIGTERM", () => shutdown(0));

  if (shouldSeed) {
    console.log("Seeding database...");
    try {
      await run("npx", ["tsx", path.join(__dirname, "seed.ts")], env);
    } catch (err) {
      console.error("Seed failed:", err.message);
      await shutdown(1);
    }
  } else {
    console.log("Existing data found — skipping seed. Pass --seed to reseed.");
  }

  console.log("Starting Next.js dev server...");
  try {
    await run(npmCmd, ["run", "dev"], env);
    await shutdown(0);
  } catch (err) {
    console.error(err.message);
    await shutdown(1);
  }
}

start().catch(async (err) => {
  console.error(err);
  process.exit(1);
});
