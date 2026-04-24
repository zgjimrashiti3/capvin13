import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../../api/categories';
import { getMenuItems } from '../../api/menuItems';

interface Props {
  onQuickAdd: (section: 'categories' | 'items') => void;
}

export default function DashboardSection({ onQuickAdd }: Props) {
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const { data: items } = useQuery({ queryKey: ['menu-items'], queryFn: () => getMenuItems() });

  const totalCategories = categories?.length ?? 0;
  const totalItems = items?.length ?? 0;
  const unavailableItems = items?.filter((i) => !i.isAvailable).length ?? 0;

  const stats = [
    {
      label: 'Kategori Gjithsej',
      value: totalCategories,
      border: '#006B3C',
      valueColor: '#006B3C',
      icon: '📂',
    },
    {
      label: 'Artikuj Gjithsej',
      value: totalItems,
      border: '#1a1a1a',
      valueColor: '#1a1a1a',
      icon: '🍽️',
    },
    {
      label: 'Artikuj të Padisponueshëm',
      value: unavailableItems,
      border: '#CE2B37',
      valueColor: '#CE2B37',
      icon: '⚠️',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1a1a1a]" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
          Dashboard
        </h1>
        <p className="text-gray-500 text-sm mt-1">Pasqyrë e menusë suaj të restorantit</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl p-6 shadow-sm"
            style={{ borderLeft: `4px solid ${s.border}` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{s.label}</p>
                <p className="text-4xl font-bold mt-2" style={{ color: s.valueColor, fontFamily: '"Playfair Display", Georgia, serif' }}>
                  {s.value}
                </p>
              </div>
              <span className="text-2xl">{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-[#1a1a1a] mb-4">Veprime të Shpejta</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onQuickAdd('categories')}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: '#006B3C' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Shto Kategori
          </button>
          <button
            onClick={() => onQuickAdd('items')}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: '#CE2B37' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Shto Artikull
          </button>
        </div>
      </div>
    </div>
  );
}
