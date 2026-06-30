import fs from "node:fs";
import path from "node:path";
import { load } from "js-yaml";

import type { MKM } from "../types.js";

const DEFAULT_MKM_PATH = path.join(process.cwd(), "system", "mkm", "knowledge_map.yaml");

export function loadMKM(customPath?: string): MKM {
  const mkmPath = customPath ?? DEFAULT_MKM_PATH;
  if (!fs.existsSync(mkmPath)) {
    throw new Error(`MKM file not found at path: ${mkmPath}`);
  }

  const yamlText = fs.readFileSync(mkmPath, "utf-8");
  const parsed = load(yamlText);

  if (!parsed || typeof parsed !== "object") {
    throw new Error(`Failed to parse MKM YAML at path: ${mkmPath}`);
  }

  return parsed as MKM;
}
