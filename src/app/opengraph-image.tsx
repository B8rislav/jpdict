import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'JapChin Dict — Изучение японского и китайского';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0f0f0f',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 80, fontWeight: 700, color: '#ffffff', letterSpacing: '-2px' }}>
          JapChin Dict
        </div>
        <div style={{ fontSize: 32, color: '#888888', marginTop: 20 }}>
          Изучение японского и китайского
        </div>
        <div style={{ display: 'flex', gap: 48, marginTop: 52 }}>
          <span style={{ fontSize: 56, color: '#ff6b6b' }}>日本語</span>
          <span style={{ fontSize: 56, color: '#4ecdc4' }}>中文</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
