import { useEffect, useState } from "react";

export function useRegistry(label: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!label) return;
    setLoading(true);
    fetch(`/api/civic/resolve?label=${encodeURIComponent(label.toLowerCase())}`)
      .then(r => r.json())
      .then(j => { 
        if (j.ok) setData(j); 
        else setError(j.error || "resolve_error"); 
      })
      .catch(e => setError(e?.message || "resolve_error"))
      .finally(() => setLoading(false));
  }, [label]);
  
  return { data, loading, error };
}

