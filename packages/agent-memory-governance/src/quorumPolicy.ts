/** C-386 default evidentiary quorum (configs/c386-agent-memory-policy.yaml). */
export const DEFAULT_INDEPENDENT_SOURCES_REQUIRED = 2;

/** Quorum cannot be lowered below policy default (blocks requiredSources: 0 gaming). */
export function resolveRequiredSources(requested?: number): number {
  const value = requested ?? DEFAULT_INDEPENDENT_SOURCES_REQUIRED;
  if (!Number.isFinite(value) || value < DEFAULT_INDEPENDENT_SOURCES_REQUIRED) {
    return DEFAULT_INDEPENDENT_SOURCES_REQUIRED;
  }
  return Math.floor(value);
}
