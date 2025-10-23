import Link from "next/link";

export default function Home(){
  return (
    <main style={{minHeight:'100vh',background:'#050914',color:'#cfe0ff',display:'grid',placeItems:'center',padding:20}}>
      <div style={{maxWidth:720}}>
        <h1>Companion Site Starter</h1>
        <p>This is your AI companion's home on the web. Try the hologram:</p>
        <p><Link href="/holo" style={{color:'#9fd1ff'}}>Open Holo</Link></p>
        <p>API tools: <code>/api/tools/ping</code>, <code>/api/tools/status</code></p>
      </div>
    </main>
  );
}
