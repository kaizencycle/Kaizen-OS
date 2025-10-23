export default function Hero({ title, subtitle }:{title:string; subtitle?:string}){
  return (
    <div style={{padding:"24px 0"}}>
      <h1 style={{fontSize:36, margin:0}}>{title}</h1>
      {subtitle && <p style={{color:"#4b5563"}}>{subtitle}</p>}
    </div>
  );
}
