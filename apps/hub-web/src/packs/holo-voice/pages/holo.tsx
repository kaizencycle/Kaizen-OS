import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import HoloMouth from "../components/HoloMouth";

export default function HoloOAA() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [listening, setListening] = useState(false);
  const [reply, setReply] = useState("");
  const [visemes, setVisemes] = useState<{t:number,v:string}[]>([]);
  const [speaking, setSpeaking] = useState(false);

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
      vertexShader: `
        varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }
      `,
      fragmentShader: `
        varying vec2 vUv; uniform float time;
        float scan = 0.5 + 0.5*sin(30.0*(vUv.y + time*0.9));
        float glow = smoothstep(0.0, 0.3, abs(vUv.x-0.5)) * 0.4;
        vec3 col = mix(vec3(0.10,0.45,0.85), vec3(0.2,0.9,1.0), scan);
        float edge = smoothstep(0.48,0.5,abs(vUv.x-0.5));
        float alpha = 0.55*edge + 0.25*scan + 0.2*glow;
        gl_FragColor = vec4(col, alpha);
      `
    });
    const mesh = new THREE.Mesh(geo, mat); mesh.position.y = 0.9;
    scene.add(mesh);

    const grid = new THREE.GridHelper(6, 30, 0x163968, 0x102444); grid.position.y = -0.01; scene.add(grid);
    const clock = new THREE.Clock();
    const loop = () => { (mat.uniforms as any).time.value = clock.getElapsedTime(); mesh.rotation.y += 0.002; renderer.render(scene, cam); requestAnimationFrame(loop); };
    loop();

    return () => { window.removeEventListener("resize", resize); renderer.dispose(); mountRef.current?.removeChild(renderer.domElement); };
  }, []);

  function startListening() {
    const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) { alert("SpeechRecognition not supported."); return; }
    const rec = new SR(); rec.lang = "en-US"; rec.interimResults = false;
    rec.onresult = async (e: any) => {
      const transcript = e.results[0][0].transcript;
      setListening(false);
      await askOAA(transcript);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    setListening(true); rec.start();
  }

  async function askOAA(userText: string) {
    try {
      const planRes = await fetch("/api/oaa/plan", { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({ query: userText })});
      const plan = await planRes.json();
      const actRes = await fetch("/api/oaa/act", { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({ tool: plan?.plan?.tool || "webDataScout", args: { url: "https://status.render.com", fields: [{name:"title", required:true}] } })});
      const out = await actRes.json();
      const text = out?.ok ? \`Here’s what I found: \${out?.data?.title || "Success."}\` : \`I hit a policy guard: \${out?.error}\`;
      setReply(text);

      // Request TTS + visemes
      const vres = await fetch("/api/oaa/voice", { method:"POST", headers: { "content-type":"application/json" }, body: JSON.stringify({ text }) });
      const vjson = await vres.json();
      if (vjson?.ok) {
        setVisemes(vjson.visemes || []);
        setSpeaking(true);
        const audio = new Audio(vjson.audioUrl);
        audio.onended = () => setSpeaking(false);
        audio.play().catch(()=> setSpeaking(false));
      } else {
        // fallback to Web Speech
        const synth = window.speechSynthesis;
        const utt = new SpeechSynthesisUtterance(text);
        synth.cancel(); synth.speak(utt);
      }

      await fetch("/api/holo/ledger", { method: "POST", headers: {"content-type":"application/json"}, body: JSON.stringify({ userText, reply: text, at: new Date().toISOString() })});
    } catch (e: any) {
      setReply("Connection issue. Citizen Shield may be gating an unsafe call.");
    }
  }

  return (
    <div style={{display:"grid", gridTemplateColumns:"1fr 320px", gap:14, height:"100vh", background:"#050914", position:"relative"}}>
      <div ref={mountRef} />
      <HoloMouth visemes={visemes} playing={speaking} />
      <aside style={{padding:12, color:"#cfe0ff", borderLeft:"1px solid #1f2a44"}}>
        <h2>Holo-OAA</h2>
        <button onClick={startListening} disabled={listening} style={{padding:"8px 12px"}}>{listening? "Listening…": "Ask"}</button>
        <h3 style={{marginTop:16}}>Reply</h3>
        <div style={{whiteSpace:"pre-wrap"}}>{reply || "Ask me anything in your Library."}</div>
        <hr style={{borderColor:"#1f2a44", margin:"16px 0"}}/>
        <small>All actions go through Citizen Shield & are sealed to Civic Ledger.</small>
      </aside>
    </div>
  );
}
