# lab7-oaa-client (Python)

Python client (sync + async) for the Lab7-proof OAA `/v1` API.

## Install
```bash
pip install lab7-oaa-client

```
  
**Sync usage**  
  
```
from lab7_oaa_client import OAAClient, StartSessionRequest, TurnRequest, SubmitRequest, CritiqueRequest

oaa = OAAClient("http://localhost:8080")
sid = oaa.start_session(StartSessionRequest(user_id="michael", mentors=["gemini","claude","deepseek","perplexity"])).session_id

print(oaa.turn(TurnRequest(session_id=sid, prompt="Explain gravity.")).drafts)

res = oaa.submit(SubmitRequest(
    session_id=sid, user_id="michael",
    prompt="Explain gravity", answer="Gravity is the curvature of spacetime..."
))
print(res.level_after, res.reward_tx_id)

crit = oaa.critique(CritiqueRequest(session_id=sid, prompt="Explain gravity", answer="..."))

```
print(crit.rubric, crit.critique[:160])  
  
**Async usage**  
  
```
import asyncio
from lab7_oaa_client import AsyncOAAClient, StartSessionRequest, TurnRequest

async def main():
    oaa = AsyncOAAClient("http://localhost:8080")
    sid = (await oaa.start_session(StartSessionRequest(user_id="michael"))).session_id
    drafts = await oaa.turn(TurnRequest(session_id=sid, prompt="Study tips?"))
    print(drafts.drafts)

asyncio.run(main())

```
  
**Errors**  
  
Requests raise ApiError(code, message, details) on non-2xx responses.
