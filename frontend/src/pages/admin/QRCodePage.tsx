import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

const INPUT_CLS =
  'w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#006B3C] focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-400';

type WifiSecurity = 'WPA' | 'WEP' | 'nopass';

// Per the standard WIFI: QR payload, ; , : and \ must be backslash-escaped
// inside each field or scanners will mis-parse the string.
function escapeWifiField(value: string) {
  return value.replace(/([\\;,:"])/g, '\\$1');
}

function buildWifiPayload(ssid: string, password: string, security: WifiSecurity) {
  const s = escapeWifiField(ssid);
  if (security === 'nopass') return `WIFI:T:nopass;S:${s};;`;
  const p = escapeWifiField(password);
  return `WIFI:T:${security};S:${s};P:${p};;`;
}

export default function QRSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [menuUrl, setMenuUrl] = useState('');

  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [security, setSecurity] = useState<WifiSecurity>('WPA');
  const wifiCanvasRef = useRef<HTMLCanvasElement>(null);
  const hasWifiQr = ssid.trim().length > 0;

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

  // Debounce ~300ms after typing stops before regenerating the WiFi QR
  useEffect(() => {
    if (!hasWifiQr) return;
    const timeout = setTimeout(() => {
      if (!wifiCanvasRef.current) return;
      QRCode.toCanvas(wifiCanvasRef.current, buildWifiPayload(ssid, password, security), {
        width: 220,
        margin: 2,
        color: { dark: '#006B3C', light: '#ffffff' },
      });
    }, 300);
    return () => clearTimeout(timeout);
  }, [ssid, password, security, hasWifiQr]);

  const downloadQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'capvin13-menu-qr.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const downloadWifiQR = () => {
    const canvas = wifiCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'capvin13-wifi-qr.png';
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

      {/* WiFi QR Generator */}
      <div className="mt-10">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#1a1a1a]" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            QR Kodi për WiFi
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Klientët skanojnë dhe lidhen automatikisht me WiFi-n, pa shkruar fjalëkalimin
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Form card */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex-1 w-full space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                Emri i Rrjetit (SSID)
              </label>
              <input
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                className={INPUT_CLS}
                placeholder="p.sh. Capvin13-WiFi"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                Siguria
              </label>
              <select
                value={security}
                onChange={(e) => setSecurity(e.target.value as WifiSecurity)}
                className={INPUT_CLS}
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">Pa fjalëkalim</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                Fjalëkalimi
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={INPUT_CLS}
                placeholder="Fjalëkalimi i WiFi-t"
                disabled={security === 'nopass'}
              />
            </div>
          </div>

          {/* QR preview card */}
          <div className="bg-white rounded-xl shadow-sm p-8 text-center flex-shrink-0 w-full lg:w-auto">
            <div
              className="inline-flex items-center justify-center p-5 rounded-xl mb-5"
              style={{ border: '2px solid rgba(0,107,60,0.12)', width: 260, height: 260 }}
            >
              {hasWifiQr ? (
                <canvas ref={wifiCanvasRef} />
              ) : (
                <p className="text-gray-400 text-sm px-4">
                  Shkruaj emrin e rrjetit (SSID) për të parë kodin QR
                </p>
              )}
            </div>

            <button
              onClick={downloadWifiQR}
              disabled={!hasWifiQr}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-white text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#006B3C' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Shkarko QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
