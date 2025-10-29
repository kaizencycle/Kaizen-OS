/**
 * Environment variable utilities
 */

/**
 * Get a required environment variable, throw if not set
 */
export function mustEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Get an optional environment variable with default
 */
export function optionalEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

/**
 * Check if an environment variable is set
 */
export function hasEnv(name: string): boolean {
  return !!process.env[name];
}
