"use client";
import { useState } from "react";

export default function Onboarding() {
  const [publish, setPublish] = useState(true);
  const [text, setText] = useState("");
  return (
    <section className="container">
      <h1 className="title">Welcome to Agora!</h1>
      <div className="card">
        <h3>Daily Reflections</h3>
        <textarea
          placeholder="What did today teach you?"
          value={text}
          onChange={e=>setText(e.target.value)}
        />
        <label className="row">
          <input type="checkbox" checked={publish} onChange={e=>setPublish(e.target.checked)} />
          <span>Publish this entry (earn a bonus when public sharing is enabled)</span>
        </label>
        <button className="btn primary">Log Reflection</button>
      </div>
    </section>
  );
}
