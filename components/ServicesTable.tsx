import * as React from "react";

export function ServicesTable() {
  const [data, setData] = React.useState<any>(null);
  React.useEffect(() => {
    fetch("/api/services")
      .then(r => r.json())
      .then(setData)
      .catch(() => setData({ services: [] }));
  }, []);
  
  if (!data) return <div>Loading services…</div>;
  
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th align="left">Service</th>
          <th align="left">Alias</th>
          <th align="left">Type</th>
          <th align="left">Health</th>
          <th align="left">Base (env)</th>
        </tr>
      </thead>
      <tbody>
        {data.services?.map((s: any) => (
          <tr key={s.id}>
            <td><code>{s.id}</code></td>
            <td>{Array.isArray(s.alias) ? s.alias.join(", ") : s.alias}</td>
            <td>{s.type}</td>
            <td><code>{s.healthPath}</code></td>
            <td><code>{s.envBaseUrl || "—"}</code></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}