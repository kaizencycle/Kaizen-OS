export type ModelId = 'oaa-llm-a' | 'oaa-llm-b' | 'oaa-llm-c';

export type ThoughtMessage = {
  role: 'hypothesis' | 'critique' | 'arbiter';
  from: ModelId;
  content: string;
  citations?: { url: string; hash?: string }[];
  score?: number;
  continue?: boolean;
};

export type LoopState = {
  id: string;
  cycle: string;
  startedAt: number;
  lastUpdatedAt: number;
  step: number;
  messages: ThoughtMessage[];
  status: 'running' | 'halted' | 'failed';
  consensus?: {
    summary: string;
    specDelta: string;
    testsDelta: any[];
    riskNotes: string[];
    citations: { url: string; hash?: string }[];
    score: number;
  };
  attestRef?: string;
};

export type StartLoopBody = {
  cycle: string;
  proposalRef: string;
  specRef?: string;
  testsRef?: string;
  goal: string;
  models: { id: ModelId }[];
};