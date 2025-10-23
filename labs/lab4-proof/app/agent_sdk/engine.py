# app/agent_sdk/engine.py
import os, json
from openai import OpenAI
from .register import get  # ← Fixed: was .registry, should be .register

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

def run_agent(name: str, prompt: str) -> dict:
    agent = get(name)
    system = f"You are {agent.name}. Persona: {agent.persona}. Keep answers within ~120 words unless asked."
    if client is None:
        return {"agent": agent.name, "reply": f"[stub] {agent.name} would answer: {prompt[:80]}..."}
    res = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role":"system","content":system},
            {"role":"user","content":prompt + "\nIf a tool would help, respond exactly: CALL:<tool_name>|<json>."}
        ],
        temperature=0.6,
    )
    text = res.choices[0].message.content or ""
    tool_used = None
    tool_result = None
    if text.startswith("CALL:"):
        head, payload = text.split("|", 1)
        tool_name = head.replace("CALL:","").strip()
        tool_used = tool_name
        try:
            payload_obj = json.loads(payload)
        except Exception:
            payload_obj = {"text": payload}
        tool = next((t for t in agent.tools if t["name"] == tool_name), None)
        if tool:
            tool_result = tool["fn"](payload_obj if isinstance(payload_obj, dict) else {"payload": payload_obj})
        else:
            tool_result = {"error": f"Unknown tool '{tool_name}'"}
        res2 = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role":"system","content":system},
                {"role":"user","content":f"Tool result: {tool_result}. Now answer the user succinctly in ~120 words."}
            ],
            temperature=0.6,
        )
        text = res2.choices[0].message.content or text
    return {"agent": agent.name, "reply": text, "tool_used": tool_used, "tool_result": tool_result}
