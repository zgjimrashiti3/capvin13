import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories } from '../../api/categories';
import { getMenuItems } from '../../api/menuItems';
import { getSettings, updateSettings } from '../../api/settings';
import { SETTINGS_QUERY_KEY } from '../../hooks/useShowImages';
import { useToast } from '../../components/Toast';

interface Props {
  onQuickAdd: (section: 'categories' | 'items') => void;
}

export default function DashboardSection({ onQuickAdd }: Props) {
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const { data: items } = useQuery({ queryKey: ['menu-items'], queryFn: () => getMenuItems() });
  const { data: settings, isError: settingsError } = useQuery({ queryKey: SETTINGS_QUERY_KEY, queryFn: getSettings });
  const qc = useQueryClient();
  const { showToast } = useToast();

  const settingsMut = useMutation({
    mutationFn: updateSettings,
    onSuccess: (updated) => {
      qc.setQueryData(SETTINGS_QUERY_KEY, updated);
      showToast(updated.showImages ? 'Fotot shfaqen në meny' : 'Fotot u fshehën nga menyja');
    },
    onError: () => showToast('Gabim gjatë ruajtjes së cilësimit', 'error'),
  });
  // Optimistic: reflect the click immediately while the request is in flight.
  const showImages = settingsMut.isPending
    ? !!settingsMut.variables?.showImages
    : settings?.showImages ?? true;

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
        <h1 className="text-3xl font-bold text-[#1a1a1a]" style={{ fontFamily: '"Fraunces", Georgia, serif' }}>
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
                <p className="text-4xl font-bold mt-2" style={{ color: s.valueColor, fontFamily: '"Fraunces", Georgia, serif' }}>
                  {s.value}
                </p>
              </div>
              <span className="text-2xl">{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Menu settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
        <h2 className="text-base font-semibold text-[#1a1a1a] mb-4">Cilësimet e Menusë</h2>
        <div className="flex items-center justify-between gap-4">
          <div>
            <label htmlFor="toggle-show-images" className="text-sm font-medium text-[#1a1a1a] cursor-pointer">
              Shfaq fotot në meny
            </label>
            <p className="text-xs mt-0.5" style={{ color: settingsError ? '#CE2B37' : '#6b7280' }}>
              {settingsError
                ? 'Cilësimi nuk u ngarkua nga serveri. Rinisni backend-in dhe rifreskoni faqen.'
                : showImages
                  ? 'Klientët i shohin artikujt me foto.'
                  : 'Fotot janë të fshehura — menyja shfaqet vetëm me tekst. Fotot nuk fshihen nga sistemi.'}
            </p>
          </div>
          <button
            id="toggle-show-images"
            type="button"
            role="switch"
            aria-checked={showImages}
            disabled={!settings || settingsMut.isPending}
            onClick={() => settingsMut.mutate({ showImages: !showImages })}
            className="relative w-12 h-7 rounded-full transition-colors flex-shrink-0 disabled:cursor-not-allowed"
            style={{ backgroundColor: showImages ? '#006B3C' : '#d1d5db', opacity: settings ? 1 : 0.5 }}
          >
            <span
              className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform"
              style={{ transform: showImages ? 'translateX(20px)' : 'translateX(0)' }}
            />
          </button>
        </div>
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
