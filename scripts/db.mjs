// Starts the local MongoDB only, so `npm run dev` can be driven separately.
import { MongoMemoryServer } from "mongodb-memory-server";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dbPath = path.join(root, ".mongo-data");
fs.mkdirSync(dbPath, { recursive: true });

const mongod = await MongoMemoryServer.create({
  instance: { port: 27017, dbName: "bhancer", dbPath, storageEngine: "wiredTiger" },
  launchTimeout: 180_000,
});

console.log(`MongoDB ready at ${mongod.getUri()}bhancer`);
process.on("SIGINT", async () => {
  await mongod.stop();
  process.exit(0);
});
