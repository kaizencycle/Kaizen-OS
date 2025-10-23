// OAA Memory - Parsers, schemas, and memory management for Civic OS
export * from './parser';
export * from './validator';
export * from './memory-manager';
export * from './types';

// Main OAA parser function
export function parseOAA(content: string): OAAIntent {
  const parser = new OAAParser();
  return parser.parse(content);
}

// Main OAA validator function
export function validateOAA(intent: OAAIntent): ValidationResult {
  const validator = new OAAValidator();
  return validator.validate(intent);
}
