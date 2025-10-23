export default function ProofFooter({ hash, ts }:{hash:string; ts:string}){
  return (
    <div style={{marginTop:24, fontSize:12, color:"#6b7280"}}>
      <em>Ledger hash:</em> {hash} — <em>Timestamp:</em> {ts}
    </div>
  );
}
