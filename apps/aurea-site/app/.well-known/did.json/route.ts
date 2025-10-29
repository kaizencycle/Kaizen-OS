import { NextResponse } from 'next/server'

export async function GET() {
  const didDocument = {
    "@context": [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/suites/ed25519-2020/v1"
    ],
    "id": "did:key:z6MkAUREA...",
    "controller": "did:key:z6MkAUREA...",
    "verificationMethod": [
      {
        "id": "did:key:z6MkAUREA...#keys-1",
        "type": "Ed25519VerificationKey2020",
        "controller": "did:key:z6MkAUREA...",
        "publicKeyMultibase": "z6MkAUREA..."
      }
    ],
    "authentication": ["#keys-1"],
    "assertionMethod": ["#keys-1"],
    "service": [
      {
        "id": "#consensus",
        "type": "ConsensusService",
        "serviceEndpoint": "https://aurea.gic/api/consensus"
      },
      {
        "id": "#ledger",
        "type": "LedgerService",
        "serviceEndpoint": "https://civic-ledger/api/attest"
      },
      {
        "id": "#codex",
        "type": "CodexService",
        "serviceEndpoint": "https://aurea.gic/api/codex/query"
      }
    ],
    "giBaseline": 0.993,
    "activation": "active",
    "created": "2024-10-28T00:00:00Z",
    "updated": "2024-10-28T00:00:00Z"
  }

  return NextResponse.json(didDocument, {
    headers: {
      'Content-Type': 'application/did+json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
