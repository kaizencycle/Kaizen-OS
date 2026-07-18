import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Mobius — See, understand, and help shape the world';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #0a0a0a 0%, #14110f 45%, #0c0a09 100%)',
          color: '#fafaf9',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(55% 45% at 50% 0%, rgba(16,185,129,.22), transparent 70%), radial-gradient(40% 35% at 80% 20%, rgba(99,102,241,.14), transparent 65%)',
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '0 80px',
            position: 'relative',
          }}
        >
          <div
            style={{
              fontSize: 88,
              fontWeight: 600,
              letterSpacing: '-3px',
              marginBottom: 16,
            }}
          >
            Mobius
          </div>
          <div
            style={{
              fontSize: 34,
              fontStyle: 'italic',
              color: '#a8a29e',
              letterSpacing: '-1px',
              maxWidth: 900,
              lineHeight: 1.25,
            }}
          >
            See the world. Understand the world. Help shape the world.
          </div>
          <div
            style={{
              marginTop: 48,
              fontSize: 14,
              fontFamily: 'monospace',
              letterSpacing: '0.35em',
              color: '#6b6255',
              textTransform: 'uppercase',
            }}
          >
            Pulse · Chambers · HIVE
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
