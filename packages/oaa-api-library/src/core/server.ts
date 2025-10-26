// oaa/server.ts
import express from "express";
import bodyParser from "body-parser";
import { plan, act } from "./hub";

const app = express();
app.use(bodyParser.json());

app.post("/oaa/plan", async (req, res) => {
  const p = await plan(req.body);
  res.json({ ok: true, plan: p });
});

app.post("/oaa/act", async (req, res) => {
  const out = await act(req.body);
  res.json(out);
});

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`[OAA Hub] listening on :${port}`));

