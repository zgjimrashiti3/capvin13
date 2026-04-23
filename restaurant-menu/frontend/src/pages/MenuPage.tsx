import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMenuGrouped } from '../api/menuItems';
import ItemCard, { InstagramIcon } from '../components/ItemCard';

export default function MenuPage() {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['menu-grouped'],
    queryFn: getMenuGrouped,
  });

  const sectionRefs = useRef<Record<string, HTMLElement>>({});

  const scrollToCategory = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#006B3C' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/80 text-base">Caricamento menù...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8]">
        <div className="text-center px-4">
          <p className="text-[#CE2B37] text-lg font-medium">Impossibile caricare il menù. Riprova.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8f8f8', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Top Navbar ── */}
      <header style={{ backgroundColor: '#006B3C' }}>
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <h1
              className="text-3xl font-bold text-white"
              style={{ fontFamily: '"Playfair Display", Georgia, serif', letterSpacing: '-0.5px' }}
            >
              Capvin13
            </h1>
            <p className="text-white/60 text-xs mt-0.5 italic" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
              Sapori autentici di Napoli
            </p>
          </div>
          <span className="text-3xl" role="img" aria-label="Italian flag">🇮🇹</span>
        </div>
      </header>

      {/* ── Sticky category tabs ── */}
      {categories && categories.length > 0 && (
        <div className="sticky top-0 z-20 bg-white shadow-sm">
          <div className="max-w-3xl mx-auto">
            <div className="flex overflow-x-auto scrollbar-hide px-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => scrollToCategory(cat.id)}
                  className="flex-shrink-0 relative px-5 py-3.5 text-sm font-medium transition-colors duration-200 whitespace-nowrap"
                  style={{ color: '#1a1a1a' }}
                  onMouseEnter={(e) => {
                    const line = e.currentTarget.querySelector('.tab-line') as HTMLElement;
                    if (line) line.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    const line = e.currentTarget.querySelector('.tab-line') as HTMLElement;
                    if (line) line.style.opacity = '0';
                  }}
                >
                  {cat.name}
                  <span
                    className="tab-line absolute bottom-0 left-0 right-0 h-0.5 transition-opacity duration-200"
                    style={{ backgroundColor: '#CE2B37', opacity: 0 }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Categories & items ── */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 pb-16">
        {categories?.map((cat) => (
          <section
            key={cat.id}
            ref={(el) => { if (el) sectionRefs.current[cat.id] = el; }}
            className="pt-10"
          >
            <div className="mb-6">
              <h2
                className="text-2xl font-bold text-[#1a1a1a]"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              >
                {cat.name}
              </h2>
              {cat.description && (
                <p className="text-gray-500 text-sm mt-1">{cat.description}</p>
              )}
              {/* Red underline accent */}
              <div className="mt-2 h-0.5 w-10 rounded-full" style={{ backgroundColor: '#CE2B37' }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cat.items.length === 0 ? (
                <p className="text-gray-400 col-span-2 text-sm italic">Nessun articolo in questa categoria.</p>
              ) : (
                cat.items.map((item) => <ItemCard key={item.id} item={item} />)
              )}
            </div>
          </section>
        ))}
      </div>

      {/* ── Footer ── */}
      <footer style={{ backgroundColor: '#004d2b' }}>
        <div className="max-w-3xl mx-auto px-4 py-10 text-center">

          {/* Instagram */}
          <a
            href="https://instagram.com/capvin13"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 text-white/80 hover:text-white transition-all duration-200 hover:scale-105 group text-sm mb-5"
            style={{ display: 'inline-flex' }}
          >
            <span
              className="transition-colors duration-200"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              <InstagramIcon />
            </span>
            <span className="font-medium group-hover:text-white">
              Seguici su Instagram <span style={{ color: '#CE2B37' }}>@capvin13</span>
            </span>
          </a>

          <div className="border-t border-white/10 my-5" />

          {/* Branding */}
          <p
            className="text-white text-lg font-bold mb-1"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            🇮🇹 Capvin13 — Napoli, Italia
          </p>
          <p className="text-white/50 text-xs mt-2">
            © {new Date().getFullYear()} Capvin13. Tutti i diritti riservati.
          </p>
        </div>
      </footer>
    </div>
  );
}
