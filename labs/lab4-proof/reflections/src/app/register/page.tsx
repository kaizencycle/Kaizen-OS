"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [civicId, setCivicId] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!civicId || !password) return setError("Please fill all fields.");
    if (password !== confirm) return setError("Passwords don’t match.");
    setLoading(true);

    try {
      // 1) Try to register and get a token in one step
      const regRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ civic_id: civicId, password })
      });

      // If register returns a token, use it; otherwise do a login
      if (regRes.ok) {
        const reg = await regRes.json();
        const token = reg?.token;

        if (token) {
          localStorage.setItem("civic_token", token);
          localStorage.setItem("civic_id", civicId);
          router.push("/reflections");
          return;
        }
      }

      // 2) Fallback: immediately login after successful register-without-token
      const loginRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ civic_id: civicId, password })
      });

      if (!loginRes.ok) throw new Error("Login after register failed.");
      const data = await loginRes.json();
      const token = data.token;
      if (!token) throw new Error("No token returned.");

      localStorage.setItem("civic_token", token);
      localStorage.setItem("civic_id", civicId);
      router.push("/reflections");
    } catch (err: any) {
      setError(err?.message ?? "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: "4rem auto" }}>
      <h1>🆕 Create your Civic ID</h1>
      <p style={{ marginBottom: "1rem", color: "#555" }}>
        This will let your Companion remember you and sync to the Ledger.
      </p>

      <form onSubmit={handleRegister} className="form">
        <input
          type="text"
          placeholder="Civic ID (handle)"
          value={civicId}
          onChange={(e) => setCivicId(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password (min 8 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>

      {error && <p style={{ color: "crimson", marginTop: "0.75rem" }}>{error}</p>}

      <p style={{ marginTop: "1rem" }}>
        Already have an account? <a href="/login">Log in</a>
      </p>

      <style jsx>{`
        .form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        input, button {
          padding: 0.75rem;
          border-radius: 6px;
          border: 1px solid #ccc;
        }
        button {
          background: #0f62fe;
          color: white;
          border: none;
          cursor: pointer;
        }
        button[disabled] {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </main>
  );
}
