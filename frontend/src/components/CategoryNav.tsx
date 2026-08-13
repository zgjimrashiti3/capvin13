import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import type { CategoryWithItems } from '../types';

interface Props {
  categories: CategoryWithItems[];
  sectionRefs: React.MutableRefObject<Record<string, HTMLElement>>;
}

interface Tab {
  key: string;
  label: string;
  scrollToId: string;
  isActive: boolean;
}

export default function CategoryNav({ categories, sectionRefs }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const scrollTo = (id: string) => {
    const el = sectionRefs.current[id];
    if (el) {
      // Account for sticky header + nav height (~112px)
      const top = el.getBoundingClientRect().top + window.scrollY - 112;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    setActiveId(id);
  };

  const tabs: Tab[] = categories.map((cat) => ({
    key: cat.id,
    label: cat.name,
    scrollToId: cat.id,
    isActive: activeId === cat.id,
  }));

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

  // Sliding underline: measure the active tab and glide the indicator under it,
  // scrolling the strip so the active tab stays in view.
  useLayoutEffect(() => {
    const activeTab = tabs.find((t) => t.isActive) ?? tabs[0];
    const container = containerRef.current;
    const el = activeTab ? tabRefs.current[activeTab.key] : null;
    if (!activeTab || !el || !container) return;

    setIndicator({ left: el.offsetLeft, width: el.offsetWidth });

    const isOutOfView =
      el.offsetLeft < container.scrollLeft ||
      el.offsetLeft + el.offsetWidth > container.scrollLeft + container.clientWidth;
    if (isOutOfView) {
      container.scrollTo({ left: el.offsetLeft - 16, behavior: 'smooth' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, categories]);

  return (
    <div className="sticky top-0 z-20 bg-white shadow-sm">
      <div className="max-w-3xl mx-auto px-4">
        <div
          ref={containerRef}
          className="relative flex items-center gap-7 overflow-x-auto [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              ref={(el) => { tabRefs.current[tab.key] = el; }}
              onClick={() => scrollTo(tab.scrollToId)}
              className="shrink-0 py-3 text-sm font-semibold whitespace-nowrap transition-colors"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                color: tab.isActive ? '#006B3C' : '#9ca3af',
              }}
            >
              {tab.label}
            </button>
          ))}

          {/* Sliding underline indicator */}
          <div
            className="absolute bottom-0 h-[3px] rounded-full transition-all duration-300 ease-out"
            style={{
              backgroundColor: '#CE2B37',
              transform: `translateX(${indicator.left}px)`,
              width: indicator.width,
            }}
          />
        </div>
      </div>
    </div>
  );
}
