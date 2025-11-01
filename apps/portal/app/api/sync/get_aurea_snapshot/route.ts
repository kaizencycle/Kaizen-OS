// apps/portal/app/api/sync/get_aurea_snapshot/route.ts
import { NextResponse } from "next/server";

const STATE = {
  aurea: {
    gi: 0.992,
    epoch: "E-560",
    last_attestation_id: "att-9f3a",
    ts: "2025-11-01T11:07:13Z"
  }
};

export async function GET() {
  return NextResponse.json(STATE.aurea);
}
