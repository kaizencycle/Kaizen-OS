// components/HoloMouth.tsx
import { useEffect, useRef, useState } from "react";

type Viseme = { t: number; v: string };

export default function HoloMouth({ visemes = [], playing = false }: { visemes: Viseme[]; playing: boolean }) {
  const [current, setCurrent] = useState<string>("REST");
  const startRef = useRef<number>(0);
  useEffect(()=>{
    if (!playing || visemes.length === 0) { setCurrent("REST"); return; }
    startRef.current = performance.now();
    let raf: number;
    const loop = () => {
      const elapsed = performance.now() - startRef.current;
      let v = "REST";
      for (let i=0;i<visemes.length;i++){
        const now = visemes[i];
        const next = visemes[i+1];
        if (!next || (elapsed >= now.t && elapsed < next.t)) { v = now.v || "REST"; break; }
        if (elapsed >= visemes[visemes.length-1].t) { v = visemes[visemes.length-1].v; }
      }
      setCurrent(v);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return ()=> cancelAnimationFrame(raf);
  }, [visemes, playing]);

  return (
    <div className="mouth">
      <img src={`/visemes/${current}.svg`} alt={current} width={120} height={80}/>
      <style jsx>{`
        .mouth { position:absolute; left: 50%; bottom: 18%; transform: translateX(-50%); opacity: .9; }
        img { filter: drop-shadow(0 0 10px rgba(136,192,255,.35)); }
      `}</style>
    </div>
  );
}
