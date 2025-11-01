// apps/portal/app/api/sync/get_cycle_status/route.ts
import { NextResponse } from "next/server";

const STATE = {
  cycle_id: "C-121",
  gi_baseline: 0.993,
  next_epoch_eta_sec: 46800,
};

export async function GET() {
  return NextResponse.json({
    cycle_id: STATE.cycle_id,
    date_local: new Date().toISOString(),
    gi_baseline: STATE.gi_baseline,
    next_epoch_eta_sec: STATE.next_epoch_eta_sec
  });
}
