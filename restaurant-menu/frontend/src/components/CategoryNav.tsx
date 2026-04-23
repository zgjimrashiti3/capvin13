import { useState, useEffect, useRef } from 'react';
import type { CategoryWithItems } from '../types';

const FOOD_EMOJIS: Record<string, string> = {
  'Antipasti':         '🥗',
  'Pica Innovative':   '🍕',
  'Pica Tradizionale': '🍕',
  'Pasta & Calzone':   '🍝',
};

interface Props {
  categories: CategoryWithItems[];
  sectionRefs: React.MutableRefObject<Record<string, HTMLElement>>;
}

export default function CategoryNav({ categories, sectionRefs }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // First 2 categories (Kafe, Pije) are direct buttons; the rest go in the dropdown
  const directCats = categories.slice(0, 2);
  const foodCats = categories.slice(2);
  const activeFoodCat = foodCats.find((c) => c.id === activeId) ?? null;
  const isUshqimiActive = activeFoodCat !== null;

  const scrollTo = (id: string) => {
    const el = sectionRefs.current[id];
    if (el) {
      // Account for sticky header + nav height (~112px)
      const top = el.getBoundingClientRect().top + window.scrollY - 112;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    setActiveId(id);
    setDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close dropdown on scroll
  useEffect(() => {
    const handler = () => setDropdownOpen(false);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // IntersectionObserver: highlight whichever section is in the top portion of the viewport
  useEffect(() => {
    if (!categories.length) return;
    const cleanup: (() => void)[] = [];

    const setup = () => {
      categories.forEach((cat) => {
        const el = sectionRefs.current[cat.id];
        if (!el) return;
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) setActiveId(cat.id);
          },
          { rootMargin: '-110px 0px -65% 0px', threshold: 0 },
        );
        observer.observe(el);
        cleanup.push(() => observer.disconnect());
      });
    };

    // Small delay to ensure sectionRefs are populated after first render
    const t = setTimeout(setup, 60);
    return () => {
      clearTimeout(t);
      cleanup.forEach((fn) => fn());
    };
  }, [categories, sectionRefs]);

  const pillBase: React.CSSProperties = {
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: '#006B3C',
    borderRadius: 9999,
    fontWeight: 600,
    fontSize: 14,
    padding: '7px 16px',
    cursor: 'pointer',
    transition: 'background-color 0.15s, color 0.15s',
    flexShrink: 0,
    whiteSpace: 'nowrap' as const,
    fontFamily: 'Inter, system-ui, sans-serif',
  };

  const activePill: React.CSSProperties = { backgroundColor: '#006B3C', color: 'white' };
  const inactivePill: React.CSSProperties = { backgroundColor: 'white', color: '#006B3C' };

  return (
    <div className="sticky top-0 z-20 bg-white shadow-sm">
      <div className="max-w-3xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-center gap-2">

          {/* Direct buttons: Kafe, Pije */}
          {directCats.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollTo(cat.id)}
              style={{ ...pillBase, ...(activeId === cat.id ? activePill : inactivePill) }}
            >
              {cat.name}
            </button>
          ))}

          {/* Ushqimi dropdown */}
          {foodCats.length > 0 && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                style={{
                  ...pillBase,
                  ...(isUshqimiActive ? activePill : inactivePill),
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  maxWidth: 168,
                }}
              >
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: 120,
                  }}
                >
                  {activeFoodCat ? activeFoodCat.name : 'Ushqimi'}
                </span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    flexShrink: 0,
                    transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Dropdown panel */}
              {dropdownOpen && (
                <div
                  className="absolute mt-2 py-1 bg-white rounded-2xl border border-gray-100 overflow-hidden"
                  style={{
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    minWidth: 210,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    zIndex: 60,
                  }}
                >
                  {foodCats.map((cat) => {
                    const isActive = activeId === cat.id;
                    const emoji = FOOD_EMOJIS[cat.name] ?? '🍴';
                    return (
                      <button
                        key={cat.id}
                        onClick={() => scrollTo(cat.id)}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors hover:bg-gray-50"
                        style={{
                          color: isActive ? '#006B3C' : '#1a1a1a',
                          fontWeight: isActive ? 600 : 400,
                          fontFamily: 'Inter, system-ui, sans-serif',
                        }}
                      >
                        <span className="flex items-center gap-2.5">
                          <span>{emoji}</span>
                          <span>{cat.name}</span>
                        </span>
                        {isActive && (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#006B3C"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
