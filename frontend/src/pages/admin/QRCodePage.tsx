import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

export default function QRSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [menuUrl, setMenuUrl] = useState('');

  useEffect(() => {
    const url = `${window.location.origin}/menu`;
    setMenuUrl(url);
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 260,
        margin: 2,
        color: { dark: '#006B3C', light: '#ffffff' },
      });
    }
  }, []);

  const downloadQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'capvin13-menu-qr.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1a1a1a]" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
          QR Kodi
        </h1>
        <p className="text-gray-500 text-sm mt-1">Printo dhe vendos këtë kod QR në tavolinat e restorantit</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* QR card */}
        <div className="bg-white rounded-xl shadow-sm p-8 text-center flex-shrink-0">
          <div
            className="inline-block p-5 rounded-xl mb-5"
            style={{ border: '2px solid rgba(0,107,60,0.12)' }}
          >
            <canvas ref={canvasRef} />
          </div>

          <p className="text-xs text-gray-400 mb-1">Drejtimi:</p>
          <a
            href={menuUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium break-all transition-colors hover:underline"
            style={{ color: '#006B3C' }}
          >
            {menuUrl}
          </a>

          <div className="mt-6 space-y-3">
            <button
              onClick={downloadQR}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-white text-sm transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: '#006B3C' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Shkarko PNG
            </button>
            <a
              href={menuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-semibold text-sm border transition-all hover:bg-gray-50 active:scale-[0.98]"
              style={{ borderColor: '#006B3C', color: '#006B3C' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Shko te /menu
            </a>
          </div>
        </div>

        {/* Instructions */}
        <div
          className="rounded-xl p-6 flex-1"
          style={{ backgroundColor: 'rgba(0,107,60,0.05)', border: '1px solid rgba(0,107,60,0.15)' }}
        >
          <h2 className="font-semibold text-[#006B3C] mb-4 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
            </svg>
            Si ta përdorësh
          </h2>
          <ol className="space-y-3 text-sm text-gray-700">
            {[
              'Shkarko kodin QR si imazh PNG',
              'Printo dhe laminato për qëndrueshmëri',
              'Vendos në çdo tavolinë të restorantit',
              'Klientët skanojnë dhe shikojnë menunë menjëherë',
              'Nuk kërkohet asnjë aplikacion — hapet direkt në browser',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                  style={{ backgroundColor: '#006B3C' }}
                >
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
