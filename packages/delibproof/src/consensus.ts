export type Label = "authentic"|"synthetic_declared"|"synthetic_undeclared"|"indeterminate";

export interface PanelVote {
  model: "gpt"|"claude"|"gemini"|"local";
  label: Label;
  confidence: number; // 0..1
  notes?: string;
}

export interface Consensus {
  agreement: number; // 0..1 (mean confidence of winning cluster)
  votes: number;
  label: Label;
  rationale: string[];
}

const FAMILY_WEIGHT: Record<PanelVote["model"], number> = {
  gpt: 1.0, claude: 1.0, gemini: 1.0, local: 0.8
};

export function deliberate(votes: PanelVote[], minKappa=0.6): Consensus {
  if (!votes.length) return { agreement: 0.0, votes: 0, label: "indeterminate", rationale:["no votes"] };

  // bucket by label, weighted by confidence & family weight
  const buckets = new Map<Label, number>();
  votes.forEach(v => {
    const w = v.confidence * (FAMILY_WEIGHT[v.model] ?? 1);
    buckets.set(v.label, (buckets.get(v.label) || 0) + w);
  });

  const sorted = [...buckets.entries()].sort((a,b)=>b[1]-a[1]);
  const [winLabel, winScore] = sorted[0];
  const total = [...buckets.values()].reduce((a,b)=>a+b,0) || 1;
  const agreement = winScore / total;

  const label: Label = agreement >= minKappa ? winLabel : "indeterminate";
  const rationale = [
    `votes=${votes.length}`,
    `clusters=${sorted.map(([l,s])=>`${l}:${s.toFixed(2)}`).join(", ")}`,
    `agreement=${agreement.toFixed(2)}`
  ];
  return { agreement, votes: votes.length, label, rationale };
}

