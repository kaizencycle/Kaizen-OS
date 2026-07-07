export {
  AGENT_CODES,
  AGENT_CODE_TO_NAME,
  MEC_REGEX,
  MEC_CANONICAL_REGEX,
  MECParseError,
  buildMec,
  decodeGiField,
  encodeGiField,
  expandMEC,
  formatMEC,
  formatMec,
  formatSealCode,
  parseMEC,
  parseMec,
  toSealCode,
} from './mec-parser.js';

export type { AgentCode, AgentName, MecRecord, ParsedMEC } from './mec-parser.js';

export type {
  ParseMecFailure,
  ParseMecResult,
  ParseMecSuccess,
} from './legacy-types.js';
