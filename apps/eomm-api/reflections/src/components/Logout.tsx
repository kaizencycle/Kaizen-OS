"use client";
export default function Logout(){
  async function out(){
    await fetch("/api/auth/logout",{method:"POST"});
    location.href="/login";
  }
  return <button className="btn" onClick={out}>Logout</button>;
}
