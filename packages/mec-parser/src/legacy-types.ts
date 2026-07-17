export type ParseMecSuccess = {
  ok: true;
  value: import('./mec-parser.js').MecRecord;
  canonical: string;
};

export type ParseMecFailure = {
  ok: false;
  error: string;
};

export type ParseMecResult = ParseMecSuccess | ParseMecFailure;
