"use client";
import { useEffect, useState } from "react";
import { loadUserCompanions, saveUserCompanions, type UserCompanion } from "@/lib/customCompanions";

type Props = {
  handle: string;
  balance: number;       // total_gic
  onUnlocked?: (key: string) => void;
  cost?: number;         // default 10 GIC per unlock
};

export default function CompanionStore({ handle, balance, onUnlocked, cost = 10 }: Props) {
  const [companions, setCompanions] = useState<UserCompanion[]>([]);
  const [name, setName] = useState("");
  // read companions
  useEffect(() => {
    if (!handle) return;
    setCompanions(loadUserCompanions(handle));
  }, [handle]);
  useEffect(() => {
    if (!handle) return;
    saveUserCompanions(handle, companions);
  }, [handle, companions]);

  const canBuy = balance >= cost;

  async function create() {
    if (!canBuy) return alert("Earn more GIC to unlock.");
    if (!name.trim()) return alert("Give your companion a name.");
    const r = await fetch("/api/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: handle, companion: "custom", costGIC: cost })
    });
    if (!r.ok) {
      const err = await r.json().catch(()=>({error:"unlock failed"}));
      return alert(`⚠️ ${err.error || "Unlock failed"}`);
    }
    const id = `cmp-${Date.now()}`;
    const next = [...companions, { id, name: name.trim() }];
    setCompanions(next);
    onUnlocked?.(id);
    setName("");
    alert(`🎉 Created companion: ${next[next.length-1].name}`);
  }

  return (
    <div className="card mini">
      <div className="row" style={{justifyContent:"space-between"}}>
        <strong>Create a new companion</strong>
        <span className="badge">{balance.toFixed(2)} GIC</span>
      </div>
      <small className="muted">Cost: <b>{cost} GIC</b>. The first companion is free.</small>
      <input className="field" placeholder="Name your companion (e.g., Athena)" value={name} onChange={e=>setName(e.target.value)} />
      <button className={`btn ${canBuy ? "primary" : ""}`} disabled={!canBuy} onClick={create}>
        {canBuy ? "Create companion" : "Earn GIC to unlock"}
      </button>
    </div>
  );
}