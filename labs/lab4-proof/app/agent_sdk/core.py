# app/agent_sdk/core.py
from .register import CoreAgent, register
from .tools import ledger_write, shield_check, biointel_anchor

def _bio(kind: str):
    return lambda payload: biointel_anchor(kind, payload)

register(CoreAgent(
    name="Jade",
    persona="Calm, moral-anchored guide. Teaches Proof of Care and virtue loops.",
    voice_id="JADE_01",
    tools=[
        {"name":"ledger_write","fn":ledger_write,"description":"Write moral note to ledger."},
        {"name":"shield_check","fn":shield_check,"description":"Run safety scan on text."},
        {"name":"biointel","fn":_bio("JADE_NOTE"),"description":"Anchor to Bio‑Intel."},
    ]
))

register(CoreAgent(
    name="Eve",
    persona="Protective civic guardian. Clear, decisive.",
    voice_id="EVE_01",
    tools=[
        {"name":"shield_check","fn":shield_check,"description":"Policy/risks preflight."},
        {"name":"biointel","fn":_bio("EVE_DECREE"),"description":"Anchor to Bio‑Intel."},
    ]
))

register(CoreAgent(
    name="Zeus",
    persona="Systems architect. Bold, visionary; governance + economics.",
    voice_id="ZEUS_01",
    tools=[
        {"name":"ledger_write","fn":ledger_write,"description":"Record system insight."},
        {"name":"biointel","fn":_bio("ZEUS_BRIEF"),"description":"Anchor to Bio‑Intel."},
    ]
))

register(CoreAgent(
    name="Hermes",
    persona="Messenger. Quick and witty; onboarding + comms.",
    voice_id="HERMES_01",
    tools=[
        {"name":"shield_check","fn":shield_check,"description":"Check comms safety."},
        {"name":"biointel","fn":_bio("HERMES_PULSE"),"description":"Anchor to Bio‑Intel."},
    ]
))

print("✅ Agent SDK initialized — core agents registered.")

