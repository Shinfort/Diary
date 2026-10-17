import { ImageResponse } from 'next/og';

export const alt = 'Shine Journal - Buku Catatan Harian Pribadi';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
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
          backgroundColor: '#faf7f2',
          backgroundImage: 'radial-gradient(circle at 25px 25px, #ebe5db 2%, transparent 0%), radial-gradient(circle at 75px 75px, #ebe5db 2%, transparent 0%)',
          backgroundSize: '100px 100px',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '40px',
            left: '40px',
            right: '40px',
            bottom: '40px',
            border: '2px dashed #d5ccbe',
            borderRadius: '24px',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            backgroundColor: '#2d6a4f',
            color: 'white',
            fontSize: '44px',
            marginBottom: '24px',
          }}
        >
          📖
        </div>

        <div
          style={{
            fontSize: '56px',
            fontWeight: 800,
            color: '#1c1917',
            letterSpacing: '-0.02em',
            marginBottom: '16px',
            textAlign: 'center',
          }}
        >
          Shine Journal
        </div>

        <div
          style={{
            fontSize: '26px',
            fontWeight: 500,
            color: '#57534e',
            textAlign: 'center',
            maxWidth: '850px',
            lineHeight: 1.4,
            marginBottom: '32px',
          }}
        >
          Buku Catatan Harian Pribadi &amp; Galeri Memori Digital Interaktif
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              padding: '10px 20px',
              backgroundColor: '#e8f5e9',
              borderRadius: '20px',
              color: '#2d6a4f',
              fontSize: '18px',
              fontWeight: 600,
            }}
          >
            ✨ Desain Buku Realistis
          </div>
          <div
            style={{
              padding: '10px 20px',
              backgroundColor: '#fef3c7',
              borderRadius: '20px',
              color: '#92400e',
              fontSize: '18px',
              fontWeight: 600,
            }}
          >
            😊 Mood Tracker
          </div>
          <div
            style={{
              padding: '10px 20px',
              backgroundColor: '#ede9fe',
              borderRadius: '20px',
              color: '#5b21b6',
              fontSize: '18px',
              fontWeight: 600,
            }}
          >
            🔒 Aman &amp; Privat
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
