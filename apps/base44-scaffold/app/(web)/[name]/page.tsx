async function getProfile(name: string) {
  const origin = process.env.APP_ORIGIN || "http://localhost:3000";
  const res = await fetch(`${origin}/api/resolve/` + encodeURIComponent(name), { cache: 'no-store' });
  if (!res.ok) throw new Error('resolve failed');
  return res.json();
}

export default async function CivicHome({ params }: { params: { name: string } }) {
  const data = await getProfile(params.name);

  return (
    <div>
      <h1 style={{fontSize:32, marginBottom:4}}>{data?.profile?.name || params.name + '.gic'}</h1>
      <p style={{color:"#4b5563"}}>{data?.profile?.bio || 'New Civic Home'}</p>

      <div style={{marginTop:20}}>
        <h3>Verified identifiers</h3>
        <ul>
          <li>DID: <code>{data?.did}</code></li>
          <li>Ledger hash: <code>{data?.proofs?.ledgerHash}</code></li>
        </ul>
      </div>

      {!!(data?.profile?.links?.length) && (
        <div style={{marginTop:20}}>
          <h3>Links</h3>
          <ul>
            {data.profile.links.map((l:any, i:number)=>(
              <li key={i}><a href={l.href} target="_blank">{l.title}</a></li>
            ))}
          </ul>
        </div>
      )}

      <div style={{marginTop:24, fontSize:12, color:"#6b7280"}}>
        <em>Proof timestamp:</em> {data?.proofs?.timestamp}
      </div>
    </div>
  )
}
