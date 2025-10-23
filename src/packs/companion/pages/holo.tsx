import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function Holo() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [reply, setReply] = useState("Ask me something and I will respond.");
  const [listening, setListening] = useState(false);

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

    const geo = new THREE.CylinderGeometry(0.5, 0.6, 1.6, 32, 1, true);
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: { time: { value: 0 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `varying vec2 vUv; uniform float time;
        float scan = 0.5 + 0.5*sin(30.0*(vUv.y + time*0.9));
        float glow = smoothstep(0.0, 0.3, abs(vUv.x-0.5)) * 0.4;
        vec3 col = mix(vec3(0.10,0.45,0.85), vec3(0.2,0.9,1.0), scan);
        float edge = smoothstep(0.48,0.5,abs(vUv.x-0.5));
        float alpha = 0.55*edge + 0.25*scan + 0.2*glow;
        gl_FragColor = vec4(col, alpha);`
    });
    const mesh = new THREE.Mesh(geo, mat); mesh.position.y = 0.9; scene.add(mesh);
    const grid = new THREE.GridHelper(6, 30, 0x163968, 0x102444); grid.position.y = -0.01; scene.add(grid);
    const clock = new THREE.Clock();
    const loop = () => { (mat.uniforms as any).time.value = clock.getElapsedTime(); mesh.rotation.y += 0.002; renderer.render(scene, cam); requestAnimationFrame(loop); };
    loop();
    return () => { window.removeEventListener("resize", resize); renderer.dispose(); mountRef.current?.removeChild(renderer.domElement); };
  }, []);

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
    <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:14,height:'100vh',background:'#050914'}}>
      <div ref={mountRef}/>
      <aside style={{padding:12,color:'#cfe0ff',borderLeft:'1px solid #1f2a44'}}>
        <h2>Hologram</h2>
        <button onClick={ask} disabled={listening} style={{padding:'8px 12px'}}>{listening? 'Listening…':'Ask'}</button>
        <h3 style={{marginTop:16}}>Reply</h3>
        <div style={{whiteSpace:'pre-wrap'}}>{reply}</div>
        <hr style={{borderColor:'#1f2a44',margin:'16px 0'}}/>
        <small>All tool calls are gated by Citizen Shield (HMAC).</small>
      </aside>
    </div>
  );
}
