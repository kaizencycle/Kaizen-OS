import asyncio, random
class MockCharter: async def check(self, t): return 90+random.random()*5
class MockGI: async def get_score(self, u): return 0.96
class MockDB:
    def embed(self, t): return [1.0,2.0,3.0]
    def upsert(self, id, vector, metadata): print('[DB] upsert', id[:8])
class MockLedger: async def attest(self, r): return {'hash':'0x'+r['embedding_id'][:16]}
from packages.vip.validator import VIPValidator
from packages.vip.embedder_adapter import VIPEmbedder
async def main():
    v=VIPValidator(MockCharter(), MockGI()); vip=VIPEmbedder(MockDB(), MockLedger(), v)
    rec=await vip.embed('seed text about virtue', {'source':'lab4.reflection','user':'kaizen'})
    print(rec['integrity_score'], rec['ledger_hash'])
asyncio.run(main())
