import { useState } from "react";
import { registerApp, issueToken, introspectToken } from "./api";
import { importSecret, generateNonce, signMessage } from "./crypto";

export default function UnlockPage({ onUnlock }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function handleUnlock() {
    setLoading(true);
    setStatus("Registering app…");
    try {
      const appId = "founder-console";
      const reg = await registerApp(appId);

      // Import secret returned from API
      const secretKey = await importSecret(reg.secret);

      // Nonce + signature
      const nonce = generateNonce();
      const signature = await signMessage(secretKey, nonce);

      setStatus("Requesting token…");
      const tok = await issueToken(appId, nonce, signature);

      // Save & introspect
      localStorage.setItem("admin_token", tok.token);
      const info = await introspectToken(tok.token);

      setStatus(`Unlocked as ${info.admin}, expires in ${info.expires_in_seconds}s`);
      onUnlock();
    } catch (err) {
      console.error(err);
      setStatus("Unlock failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4 text-center">
      <h1 className="text-2xl font-bold">🔒 Civic Unlock</h1>
      <p className="text-gray-600">Enter the Dome with a founder token</p>
      <button
        onClick={handleUnlock}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Unlocking…" : "Unlock"}
      </button>
      {status && <p className="text-sm mt-2">{status}</p>}
    </div>
  );
}
