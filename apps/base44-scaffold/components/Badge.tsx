export default function Badge({ label }:{label:string}){
  return (
    <span style={{display:"inline-block", padding:"4px 8px", borderRadius:999, background:"#f1f5f9", fontSize:12, marginRight:8}}>
      {label}
    </span>
  );
}
