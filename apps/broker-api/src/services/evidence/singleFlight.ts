/**
 * In-process single-flight acquisition locks (v0.1).
 * NOT production-safe across multiple broker instances — documented in protocol.
 */

type FlightEntry<T> = {
  promise: Promise<T>;
  expiresAt: number;
};

const flights = new Map<string, FlightEntry<unknown>>();
const DEFAULT_TIMEOUT_MS = 30_000;

export async function withSingleFlight<T>(
  requestHash: string,
  timeoutMs: number,
  leader: () => Promise<T>,
): Promise<{ result: T; leader: boolean }> {
  const now = Date.now();
  const existing = flights.get(requestHash);
  if (existing && existing.expiresAt > now) {
    return { result: (await existing.promise) as T, leader: false };
  }

  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  flights.set(requestHash, {
    promise,
    expiresAt: now + (timeoutMs > 0 ? timeoutMs : DEFAULT_TIMEOUT_MS),
  });

  try {
    const result = await leader();
    resolve(result);
    return { result, leader: true };
  } catch (error) {
    reject(error);
    throw error;
  } finally {
    flights.delete(requestHash);
  }
}

export function resetSingleFlightLocks(): void {
  flights.clear();
}

export function activeSingleFlightCount(): number {
  return flights.size;
}
