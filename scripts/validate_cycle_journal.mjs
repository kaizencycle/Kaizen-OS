#!/usr/bin/env node

/**
 * Cycle Journal Schema Validator
 * 
 * Validates all journals/cycles/C-*.json files against the cycle_journal.schema.json
 * 
 * Usage: node scripts/validate_cycle_journal.mjs
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

// Dynamic import for ESM compatibility
const loadAjv = async () => {
  try {
    const Ajv = (await import("ajv")).default;
    const addFormats = (await import("ajv-formats")).default;
    return { Ajv, addFormats };
  } catch (e) {
    console.error("Error: ajv or ajv-formats not installed.");
    console.error("Run: npm install ajv ajv-formats");
    process.exit(1);
  }
};

const ROOT = process.cwd();
const SCHEMA_PATH = path.join(ROOT, "schemas", "cycle_journal.schema.json");
const LAYER1_SCHEMA_PATH = path.join(ROOT, "schemas", "cycle_journal_layer1_stub.schema.json");
const CYCLES_DIR = path.join(ROOT, "journals", "cycles");

/**
 * List all cycle journal JSON files
 */
function listCycleJsonFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir)
    .filter((f) => /^C-\d+\.json$/.test(f))
    .map((f) => path.join(dir, f));
}

/**
 * Load and parse JSON file
 */
function loadJson(filepath) {
  try {
    const content = fs.readFileSync(filepath, "utf8");
    return JSON.parse(content);
  } catch (e) {
    console.error(`Error reading ${filepath}: ${e.message}`);
    return null;
  }
}

/**
 * Layer-1 mobius-bot/state-sync writes a minimal witness stub in
 * journals/cycles/C-*.json. Full ATLAS cycle journals use meta/signals/seal.
 */
function isLayer1WriterStub(data) {
  if (!data || typeof data !== "object") return false;
  if (data.meta) return false;
  return data.writer === "mobius-bot/state-sync" && typeof data.cycle === "string";
}

function expectedCycleFromFilename(filepath) {
  const base = path.basename(filepath, ".json");
  return /^C-\d+$/.test(base) ? base : null;
}

/**
 * Format validation errors for display
 */
function formatErrors(errors, filepath) {
  const lines = [`\n❌ Schema validation failed: ${path.relative(ROOT, filepath)}`];
  
  for (const err of errors || []) {
    const location = err.instancePath || "(root)";
    const message = err.message || "Unknown error";
    const keyword = err.keyword || "";
    
    lines.push(`  - ${location} ${message}`);
    
    // Add helpful context for common errors
    if (keyword === "enum" && err.params?.allowedValues) {
      lines.push(`    Allowed values: ${err.params.allowedValues.join(", ")}`);
    }
    if (keyword === "required" && err.params?.missingProperty) {
      lines.push(`    Missing property: ${err.params.missingProperty}`);
    }
    if (keyword === "pattern" && err.params?.pattern) {
      lines.push(`    Expected pattern: ${err.params.pattern}`);
    }
  }
  
  return lines.join("\n");
}

/**
 * Main validation function
 */
async function main() {
  // Check schema exists
  if (!fs.existsSync(SCHEMA_PATH)) {
    console.error(`Missing schema: ${SCHEMA_PATH}`);
    process.exit(1);
  }

  // Load AJV
  const { Ajv, addFormats } = await loadAjv();
  
  const ajv = new Ajv({ 
    allErrors: true, 
    strict: false,
    verbose: true
  });
  addFormats(ajv);

  // Load and compile schema
  const schema = loadJson(SCHEMA_PATH);
  if (!schema) {
    console.error("Failed to load schema");
    process.exit(1);
  }
  
  let validate;
  try {
    validate = ajv.compile(schema);
  } catch (e) {
    console.error(`Schema compilation error: ${e.message}`);
    process.exit(1);
  }

  const layer1Schema = loadJson(LAYER1_SCHEMA_PATH);
  if (!layer1Schema) {
    console.error(`Failed to load schema: ${LAYER1_SCHEMA_PATH}`);
    process.exit(1);
  }
  let validateLayer1;
  try {
    validateLayer1 = ajv.compile(layer1Schema);
  } catch (e) {
    console.error(`Layer-1 schema compilation error: ${e.message}`);
    process.exit(1);
  }

  // Find cycle journal files
  const files = listCycleJsonFiles(CYCLES_DIR);

  if (files.length === 0) {
    console.log("No cycle journal JSON files found in journals/cycles/");
    console.log("This is expected if no journals have been created yet.");
    console.log("Skipping validation.");
    process.exit(0);
  }

  console.log(`Found ${files.length} cycle journal file(s) to validate.\n`);

  let allValid = true;
  const results = {
    passed: [],
    failed: []
  };

  for (const file of files) {
    const data = loadJson(file);
    
    if (data === null) {
      allValid = false;
      results.failed.push({ file, error: "Failed to parse JSON" });
      continue;
    }

    const relativePath = path.relative(ROOT, file);
    if (isLayer1WriterStub(data)) {
      const expectedCycle = expectedCycleFromFilename(file);
      if (!expectedCycle || data.cycle !== expectedCycle) {
        allValid = false;
        console.error(
          `\n❌ Layer-1 stub cycle mismatch: ${relativePath} ` +
            `(file ${expectedCycle ?? "?"} vs body ${data.cycle})`
        );
        results.failed.push({ file: relativePath, error: "cycle/filename mismatch" });
        continue;
      }
      const layer1Valid = validateLayer1(data);
      if (!layer1Valid) {
        allValid = false;
        console.error(formatErrors(validateLayer1.errors, file));
        results.failed.push({ file: relativePath, errors: validateLayer1.errors });
        continue;
      }
      console.log(`✅ ${relativePath} (Layer-1 state-sync stub)`);
      results.passed.push(relativePath);
      continue;
    }

    const valid = validate(data);

    if (!valid) {
      allValid = false;
      console.error(formatErrors(validate.errors, file));
      results.failed.push({ file: relativePath, errors: validate.errors });
    } else {
      console.log(`✅ ${relativePath}`);
      results.passed.push(relativePath);
    }
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("VALIDATION SUMMARY");
  console.log("=".repeat(50));
  console.log(`Total files: ${files.length}`);
  console.log(`Passed: ${results.passed.length}`);
  console.log(`Failed: ${results.failed.length}`);

  if (!allValid) {
    console.log("\n⚠️  Some cycle journal entries failed validation.");
    console.log("Please fix the errors above before committing.");
    process.exit(1);
  }

  console.log("\n✅ All cycle journal entries are schema-valid.");
}

main().catch((e) => {
  console.error("Unexpected error:", e);
  process.exit(1);
});
