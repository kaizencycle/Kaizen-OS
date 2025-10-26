import crypto from "crypto";
export function sha256hex(input: string) {
  return "0x" + crypto.createHash("sha256").update(input, "utf8").digest("hex");
}
