# @lab7/oaa-client (TypeScript)

Type-safe TS client for the Lab7-proof OAA `/v1` API:
- `/v1/session/start` — create a session
- `/v1/session/turn` — get mentor drafts
- `/v1/session/submit` — Shield→Rubric→XP/Level→Attest→(maybe) Reward
- `/v1/session/critique` — rubric-backed critique (no XP/mint)

## Install
```bash
npm i @lab7/oaa-client
# or
pnpm add @lab7/oaa-client

```
  
**Quick start**  
  
```
import { OAAClient } from "@lab7/oaa-client";

const oaa = new OAAClient(process.env.OAA_BASE || "http://localhost:8080");

(async () => {
  const start = await oaa.startSession({ user_id: "michael", mentors: ["gemini","claude","deepseek","perplexity"] });
  const drafts = await oaa.turn({ session_id: start.session_id, prompt: "Explain gravity to a teen." });

  const sub = await oaa.submit({
    session_id: start.session_id,
    user_id: "michael",
    prompt: "Explain gravity to a teen.",
    answer: "Gravity is the curvature of spacetime..."
  });

  const crit = await oaa.critique({
    session_id: start.session_id,
    prompt: "Explain gravity to a teen.",
    answer: "Gravity is the curvature of spacetime..."
  });

  console.log(drafts.drafts, sub.level_after, crit.rubric);
})();

```
  
**Config**  
	•	Base URL defaults to http://localhost:8080.  
	•	Customize headers:  
  
const oaa = new OAAClient("https://api.example.com", fetch, { Authorization: "Bearer <token>" });  
  
**Types**  
  
Exposes request/response interfaces for all four endpoints.
