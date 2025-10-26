export async function postShield(path: string, body: any) {
  const raw = JSON.stringify(body || {});
  // client-side: we can't sign with the server secret; in prod,
  // route through OAA/Shield broker. For demo, send unsigned.
  const res = await fetch(path, { 
    method:"POST", 
    headers:{ 
      "content-type":"application/json",
      "x-citizen-sig": "demo-signature" // In production, this would be properly signed
    }, 
    body: raw 
  });
  return res.json();
}
