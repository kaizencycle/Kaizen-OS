import fs from "fs";
import path from "path";

const DEFAULT_PATH = path.join(process.cwd(), "OAA_MEMORY.json");

export function readMemory(filePath = process.env.OAA_MEMORY_PATH || DEFAULT_PATH) {
  if (!fs.existsSync(filePath)) {
    const seed = { version: "v1", updatedAt: new Date().toISOString(), notes: [] as any[] };
    fs.writeFileSync(filePath, JSON.stringify(seed, null, 2));
    return seed;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function writeMemory(obj: any, filePath = process.env.OAA_MEMORY_PATH || DEFAULT_PATH) {
  obj.updatedAt = new Date().toISOString();
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2));
}
