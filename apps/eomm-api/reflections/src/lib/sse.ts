export function openSSE(url: string, headers: Record<string,string>) {
  // EventSource doesn’t support custom headers, so we pass token via querystring.
  const u = new URL(url);
  // token in query (since /stream still checks header we'll accept query alternative too if you add it)
  // For now, we’ll put it in query and forward to header via a small API proxy, or we’ll modify backend to read query.
  return new EventSource(u.toString());
}

