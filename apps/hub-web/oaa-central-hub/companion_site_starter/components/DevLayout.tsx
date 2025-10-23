import DevBanner from "./DevBanner";
import DevNav from "./DevNav";
import SentinelBadge from "./SentinelBadge";

export default function DevLayout({ children }:{ children: React.ReactNode }){
  return (
    <>
      <DevBanner />
      <div style={{display:"grid", gridTemplateColumns:"180px 1fr", gap:16, maxWidth:1200, margin:"24px auto", padding:"0 20px"}}>
        <DevNav />
        <section>
          <header style={{display:"flex", alignItems:"center", gap:12, marginBottom:12}}>
            <h1 style={{margin:0, fontSize:20}}>Developer Surface</h1>
            <div style={{marginLeft:"auto"}}><SentinelBadge/></div>
          </header>
          {children}
        </section>
      </div>
    </>
  );
}