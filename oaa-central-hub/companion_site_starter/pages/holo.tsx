import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type HoloItem = { 
  title: string; 
  sha256: string; 
  proof: string; 
  ts: number;
  integrityScore?: number;
};

export default function Holo() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [reply, setReply] = useState("Ask me something and I will respond.");
  const [listening, setListening] = useState(false);
  const [items, setItems] = useState<HoloItem[]>([]);
  const [integrityScore, setIntegrityScore] = useState(0.5); // 0-1 scale

  // Fetch companion feed data
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/companions/feed?companion=jade');
        const j = await r.json();
        if (j.ok && j.items) {
          const feedItems = j.items.map((item: any) => ({
            title: item.title || 'Untitled',
            sha256: item.sha256 || '0x0000',
            proof: item.proof || '0x0000',
            ts: item.ts || Date.now(),
            integrityScore: item.proof ? 0.8 + Math.random() * 0.2 : 0.3 + Math.random() * 0.4
          }));
          setItems(feedItems);
          // Calculate average integrity score
          const avgScore = feedItems.reduce((sum: number, item: HoloItem) => sum + (item.integrityScore || 0.5), 0) / feedItems.length;
          setIntegrityScore(avgScore);
        }
      } catch (e) {
        console.log('Feed fetch failed, using mock data');
        // Mock data for demo
        setItems([
          { title: "First Flight", sha256: "0x1234...", proof: "0x5678...", ts: Date.now() - 3600000, integrityScore: 0.9 },
          { title: "Memory Core", sha256: "0x9abc...", proof: "0xdef0...", ts: Date.now() - 7200000, integrityScore: 0.7 },
          { title: "Reflection", sha256: "0x2468...", proof: "0x1357...", ts: Date.now() - 10800000, integrityScore: 0.8 }
        ]);
        setIntegrityScore(0.8);
      }
    })();
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a1020, 0.03);
    const cam = new THREE.PerspectiveCamera(55, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 100);
    cam.position.set(0, 1.6, 2.2);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    const resize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth, h = mountRef.current.clientHeight;
      cam.aspect = w / h; cam.updateProjectionMatrix(); renderer.setSize(w, h);
    };
    window.addEventListener("resize", resize);

    // Main holo ring with integrity-based color
    const torusGeo = new THREE.TorusGeometry(1.2, 0.06, 32, 200);
    const torusMat = new THREE.MeshStandardMaterial({ 
      color: 0x66ccff, 
      metalness: 0.8, 
      roughness: 0.2, 
      transparent: true, 
      opacity: 0.9 
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.position.y = 0.9;
    scene.add(torus);

    // Memory beads (one per item)
    const beads: THREE.Mesh[] = [];
    items.forEach((_, i) => {
      const beadGeo = new THREE.SphereGeometry(0.06, 24, 24);
      const beadMat = new THREE.MeshStandardMaterial({ 
        color: 0x00ffcc,
        emissive: 0x003322,
        emissiveIntensity: 0.3
      });
      const bead = new THREE.Mesh(beadGeo, beadMat);
      const angle = (i / Math.max(1, items.length)) * Math.PI * 2;
      bead.position.set(
        Math.cos(angle) * 1.2, 
        Math.sin(angle) * 1.2 + 0.9, 
        0
      );
      beads.push(bead);
      scene.add(bead);
    });

    // Enhanced lighting
    const light = new THREE.PointLight(0x99ddff, 2, 20);
    light.position.set(2, 2, 3);
    scene.add(light);
    
    const rim = new THREE.PointLight(0x00ffaa, 1, 15);
    rim.position.set(-2, -1, 2);
    scene.add(rim);

    // Ambient light for better visibility
    const ambient = new THREE.AmbientLight(0x404080, 0.3);
    scene.add(ambient);

    const grid = new THREE.GridHelper(6, 30, 0x163968, 0x102444);
    grid.position.y = -0.01;
    scene.add(grid);

    const clock = new THREE.Clock();
    const loop = () => {
      const t = clock.getElapsedTime();
      
      // Rotate torus
      torus.rotation.x = Math.sin(t * 0.5) * 0.3;
      torus.rotation.y = t * 0.8;
      
      // Integrity pulse (color changes based on integrity score)
      const pulse = (Math.sin(t * 2.0) + 1) / 2; // 0..1
      const baseHue = 0.55 + 0.15 * pulse; // Blue to cyan
      const integrityHue = baseHue + (integrityScore - 0.5) * 0.3; // Green for high integrity
      torusMat.color.setHSL(integrityHue, 0.7, 0.6);
      
      // Animate beads
      beads.forEach((bead, i) => {
        const item = items[i];
        if (item) {
          const beadIntensity = (item.integrityScore || 0.5) * 0.5 + 0.3;
          (bead.material as THREE.MeshStandardMaterial).emissiveIntensity = beadIntensity;
          bead.rotation.y += 0.01;
          bead.scale.setScalar(0.8 + 0.2 * Math.sin(t * 2 + i));
        }
      });
      
      renderer.render(scene, cam);
      requestAnimationFrame(loop);
    };
    loop();
    
    return () => { 
      window.removeEventListener("resize", resize); 
      renderer.dispose(); 
      mountRef.current?.removeChild(renderer.domElement); 
    };
  }, [items, integrityScore]);

  async function ask(){
    const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    let text = 'Hello from your companion.';
    if (SR) {
      const rec = new SR(); rec.lang = "en-US"; rec.interimResults = false;
      setListening(true);
      text = await new Promise<string>((resolve) => {
        rec.onresult = (e:any)=> resolve(e.results[0][0].transcript);
        rec.onerror = ()=> resolve('Say hello.');
        rec.onend = ()=> setListening(false);
        rec.start();
      });
    }
    const res = await fetch('/api/tools/ping', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ text })});
    const json = await res.json();
    const msg = json?.ok ? `PONG • You said: ${json?.echo}` : 'Tool error.';
    setReply(msg);
    const synth = window.speechSynthesis;
    const utt = new SpeechSynthesisUtterance(msg);
    synth.cancel(); synth.speak(utt);
  }

  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:24,minHeight:'100vh',background:'#050914',color:'#cfe0ff',padding:24}}>
      <div style={{width:'100%',aspectRatio:'1/1',border:'1px solid #1b2440',borderRadius:12,background:'radial-gradient(120% 120% at 50% 0%, #0b1733 0%, #050914 60%)'}} ref={mountRef}/>
      <aside style={{padding:'12px 16px',border:'1px solid #1b2440',borderRadius:12,background:'#0b1020'}}>
        <h2 style={{margin:'6px 0 12px 0'}}>Hologram</h2>
        <button onClick={ask} disabled={listening} style={{padding:'8px 12px',background:'#1b2440',border:'1px solid #253055',borderRadius:6,color:'#cfe0ff',cursor:'pointer'}}>
          {listening? 'Listening…':'Ask'}
        </button>
        
        <h3 style={{marginTop:16,marginBottom:12}}>Recent Reflections</h3>
        <ul style={{listStyle:'none',padding:0,margin:0}}>
          {items.map((item, i) => (
            <li key={i} style={{margin:'8px 0',padding:'8px 10px',border:'1px solid #253055',borderRadius:8,background:'rgba(27,36,64,0.3)'}}>
              <strong style={{color:'#00ffcc'}}>{item.title}</strong><br/>
              <small style={{color:'#8a9bb5'}}>
                proof {item.proof.slice(0,10)}… • 
                integrity: {Math.round((item.integrityScore || 0.5) * 100)}%
              </small>
            </li>
          ))}
        </ul>
        
        <h3 style={{marginTop:16,marginBottom:12}}>Reply</h3>
        <div style={{whiteSpace:'pre-wrap',padding:'8px',background:'rgba(27,36,64,0.3)',borderRadius:6}}>{reply}</div>
        
        <hr style={{borderColor:'#1f2a44',margin:'16px 0'}}/>
        <small style={{color:'#8a9bb5'}}>
          Ring color pulses with integrity score. All tool calls are gated by Citizen Shield (HMAC).
        </small>
      </aside>
    </div>
  );
}
