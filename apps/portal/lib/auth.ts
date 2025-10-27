export function getJWT(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('kaizen_jwt');
}

export function setJWT(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('kaizen_jwt', token);
}

export function clearJWT(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('kaizen_jwt');
}

export function isAuthenticated(): boolean {
  const jwt = getJWT();
  if (!jwt) return false;
  
  try {
    // Basic JWT validation - check if it's not expired
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    return payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}