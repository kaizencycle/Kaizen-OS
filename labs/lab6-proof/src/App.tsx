import { Link } from 'react-router-dom'

export default function App() {
  return (
    <div className="container">
      <h1>Citizen Shield</h1>
      <p className="muted">Lab6 — Civic Protocol Core</p>
      <nav className="nav">
        <Link to="/onboard">Onboarding (Twin Seals)</Link>
        <Link to="/enroll">Enroll</Link>
        <Link to="/verify">ZK Verify Reflection</Link>
        <Link to="/group">Group Status</Link>
      </nav>
      <p>Configure <code>VITE_LAB6_API</code> in <code>.env</code> (default: https://lab6-proof-api.onrender.com)</p>
    </div>
  )
}
