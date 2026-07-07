export {
  AGENT_CODE_TO_NAME,
  MEC_CANONICAL_REGEX,
  agentCodeToName,
  agentNameToCode,
  buildMec,
  decodeGiField,
  encodeGiField,
  formatMec,
  formatSealCode,
  parseMec,
} from './mec-parser.js';

export type {
  AgentCode,
  AgentName,
  MecRecord,
  ParseMecFailure,
  ParseMecResult,
  ParseMecSuccess,
} from './mec-parser.js';
