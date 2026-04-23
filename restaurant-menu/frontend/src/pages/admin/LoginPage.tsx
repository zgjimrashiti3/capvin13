import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login } from '../../api/auth';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(username, password);
      setAuth(data.access_token, data.user);
      navigate('/admin');
    } catch {
      setError('Emri i përdoruesit ose fjalëkalimi është i gabuar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Left panel — Italian flag gradient ── */}
      <div
        className="hidden md:flex flex-col items-center justify-center relative overflow-hidden"
        style={{
          width: '60%',
          background: 'linear-gradient(135deg, #006B3C 0%, #007d46 30%, #ffffff 50%, #e03342 70%, #CE2B37 100%)',
        }}
      >
        {/* Soft overlay for contrast */}
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.08)' }} />

        <div className="relative z-10 text-center px-12">
          <div className="mb-6 text-5xl">🇮🇹</div>
          <h1
            className="text-6xl font-bold text-white mb-4 drop-shadow-lg"
            style={{ fontFamily: '"Playfair Display", Georgia, serif', letterSpacing: '-1px' }}
          >
            Capvin13
          </h1>
          <p
            className="text-xl text-white/90 italic"
            style={{ fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' }}
          >
            Sapori autentici di Napoli
          </p>
          <div className="mt-8 w-12 h-0.5 mx-auto bg-white/50 rounded-full" />
        </div>

        {/* Decorative circles */}
        <div
          className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        />
        <div
          className="absolute -top-10 -left-10 w-48 h-48 rounded-full"
          style={{ background: 'rgba(0,0,0,0.06)' }}
        />
      </div>

      {/* ── Right panel — login form ── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-8 py-12 bg-white"
        style={{ minWidth: 0 }}
      >
        {/* Mobile logo */}
        <div className="md:hidden text-center mb-10">
          <h1
            className="text-3xl font-bold mt-2"
            style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#006B3C' }}
          >
            Capvin13
          </h1>
          <p className="text-gray-400 text-sm italic mt-1">Sapori autentici di Napoli</p>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2
              className="text-2xl font-bold text-[#1a1a1a]"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              Hyrja e Adminit
            </h2>
            <p className="text-gray-400 text-sm mt-1">Vendos kredencialet tuaja</p>
          </div>

          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-lg text-sm text-white"
              style={{ backgroundColor: '#CE2B37' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Emri i Përdoruesit
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm transition-all outline-none"
                style={{ '--tw-ring-color': '#006B3C' } as React.CSSProperties}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#006B3C')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
                placeholder="admin"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Fjalëkalimi
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm transition-all outline-none"
                onFocus={(e) => (e.currentTarget.style.borderColor = '#006B3C')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-white text-sm transition-all disabled:opacity-60 active:scale-[0.98]"
              style={{ backgroundColor: loading ? '#004d2b' : '#006B3C' }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = '#004d2b'; }}
              onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = '#006B3C'; }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" opacity="0.3" />
                    <path d="M21 12a9 9 0 0 1-9 9" />
                  </svg>
                  Duke u kyçur...
                </span>
              ) : (
                'Kyçu'
              )}
            </button>
          </form>
        </div>

        <p className="mt-auto pt-12 text-xs text-gray-300">
          Capvin13 © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
