export default function XPCard({ xp }: { xp: number }) {
  return (
    <div style={{
      background: '#171717', border: '1px solid #2a2a2a', borderRadius: 12,
      padding: 16, marginBottom: 16
    }}>
      <div style={{ opacity: 0.8, fontSize: 14 }}>Current XP</div>
      <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: 1, marginTop: 4 }}>{xp}</div>
    </div>
  );
}
