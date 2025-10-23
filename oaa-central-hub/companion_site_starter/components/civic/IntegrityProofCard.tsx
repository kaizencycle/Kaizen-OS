export default function IntegrityProofCard({ data }: { data: any }) {
  if (!data) return null;
  
  return (
    <div style={{
      padding: '1.5rem',
      background: '#0a1a2e',
      borderRadius: '8px',
      border: '1px solid #1e3a8a',
      marginTop: '1rem'
    }}>
      <h3 style={{marginTop: 0, color: '#9fd1ff'}}>Current Records</h3>
      <div style={{
        background: '#050914',
        padding: '1rem',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '14px',
        overflow: 'auto'
      }}>
        <div style={{marginBottom: '8px'}}>
          <strong style={{color: '#60a5fa'}}>Owner:</strong> 
          <span style={{color: '#cfe0ff', marginLeft: '8px'}}>{data.owner}</span>
        </div>
        <div style={{marginBottom: '8px'}}>
          <strong style={{color: '#60a5fa'}}>IPFS CID:</strong> 
          <span style={{color: '#cfe0ff', marginLeft: '8px'}}>{data.cid}</span>
        </div>
        <div style={{marginBottom: '8px'}}>
          <strong style={{color: '#60a5fa'}}>Integrity Proof:</strong> 
          <span style={{color: '#cfe0ff', marginLeft: '8px'}}>{data.proof}</span>
        </div>
        <div>
          <strong style={{color: '#60a5fa'}}>Expires At:</strong> 
          <span style={{color: '#cfe0ff', marginLeft: '8px'}}>
            {new Date(Number(data.expiresAt) * 1000).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}