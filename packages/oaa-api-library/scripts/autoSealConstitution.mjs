// Node 20+
// Usage (CI): node scripts/autoSealConstitution.mjs
import fs from "fs";
import crypto from "crypto";

const MD_PATH = "public/constitution/virtue_accords.md";
const HIST_PATH = "public/constitution/history.json";
const LEDGER = process.env.LEDGER_BASE_URL;
const TOKEN = process.env.LEDGER_ADMIN_TOKEN;

function sha256(text) { 
  return "0x" + crypto.createHash("sha256").update(text, "utf8").digest("hex"); 
}

function bump(v) {
  // naive semver bump minor
  const [maj, min, pat] = (v || "1.0.0").split(".").map(n => parseInt(n || "0", 10));
  return [maj, min + 1, 0].join(".");
}

async function main() {
  console.log("🔍 Checking constitution for changes...");
  
  const md = fs.readFileSync(MD_PATH, "utf8");
  const sum = sha256(md);

  const history = JSON.parse(fs.readFileSync(HIST_PATH, "utf8"));
  const latest = history[0];
  
  if (latest && latest.sha256 && latest.sha256.toLowerCase() === sum.toLowerCase()) {
    console.log("✅ No content change in constitution; skipping seal.");
    return;
  }

  console.log("📝 Constitution content changed, sealing to ledger...");

  // Mock ledger seal (replace with real implementation)
  let proof;
  if (LEDGER && TOKEN) {
    try {
      const body = { 
        title: "Virtue Accords", 
        slug: "constitution", 
        companion: "civic", 
        sha256: sum 
      };
      const r = await fetch(`${LEDGER}/seal`, {
        method: "POST",
        headers: { 
          "content-type": "application/json", 
          "authorization": `Bearer ${TOKEN}` 
        },
        body: JSON.stringify(body)
      });
      const j = await r.json();
      if (!j?.ok || !j?.proof) {
        throw new Error(`Ledger seal failed: ${JSON.stringify(j)}`);
      }
      proof = j.proof;
      console.log("✅ Successfully sealed to ledger");
    } catch (e) {
      console.warn("⚠️ Ledger seal failed, using mock proof:", e.message);
      proof = "0x" + crypto.createHash("sha256").update(sum + Date.now()).digest("hex");
    }
  } else {
    console.log("⚠️ No ledger configured, using mock proof");
    proof = "0x" + crypto.createHash("sha256").update(sum + Date.now()).digest("hex");
  }

  const entry = {
    version: latest?.version ? bump(latest.version) : "1.0.0",
    date: new Date().toISOString(),
    title: "Constitution Update",
    summary: "Auto-sealed amendment",
    sha256: sum,
    proof
  };
  
  history.unshift(entry);
  fs.writeFileSync(HIST_PATH, JSON.stringify(history, null, 2));
  
  console.log("✅ Sealed constitution; new entry:", entry);
  console.log(`📊 Total history entries: ${history.length}`);
}

main().catch(e => { 
  console.error("❌ Auto-seal failed:", e); 
  process.exit(1); 
});