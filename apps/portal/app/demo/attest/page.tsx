'use client';

import { AttestationBlock } from "@/lib/useAttestation";

export default function Page(){
  const endpoint = process.env.NEXT_PUBLIC_ATTEST_API || "http://localhost:8082";
  // demo hash: replace with real sha256
  return (
    <main style={{maxWidth:720,margin:"32px auto",padding:16}}>
      <h1>Truth Rail — Attestation Demo</h1>
      <p>Posting a declared-synthetic demo to the Attest API and rendering the provenance card.</p>
      <AttestationBlock endpoint={endpoint} mediaHash="b3e1f9d4e67b0b0cafedeadbeefcafebabefeed1234567890abcdeffeedc0de" />
    </main>
  );
}

