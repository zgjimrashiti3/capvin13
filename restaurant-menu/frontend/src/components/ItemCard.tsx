import type { MenuItem } from '../types';

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Export for use in footer
export { InstagramIcon };

interface Props {
  item: MenuItem;
}

export default function ItemCard({ item }: Props) {
  return (
    <div
      className={`bg-white rounded-xl overflow-hidden transition-shadow duration-200 hover:shadow-md ${!item.isAvailable ? 'opacity-70' : ''}`}
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
    >
      <div className="relative">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-48 object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-44 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(0,107,60,0.06) 0%, rgba(206,43,55,0.06) 100%)' }}
          >
            <span className="text-5xl">🍽️</span>
          </div>
        )}

        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
            <span
              className="text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider"
              style={{ backgroundColor: '#CE2B37' }}
            >
              Non disponibile
            </span>
          </div>
        )}

        {/* Price badge */}
        <div
          className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-white text-sm font-bold shadow-md"
          style={{ backgroundColor: '#CE2B37' }}
        >
          €{Number(item.price).toFixed(2)}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[#1a1a1a] text-base leading-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            {item.name}
          </h3>
          {item.isAvailable && (
            <span
              className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5"
              style={{ backgroundColor: '#006B3C' }}
              title="Disponibile"
            />
          )}
        </div>
        {item.description && (
          <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">{item.description}</p>
        )}
      </div>
    </div>
  );
}
