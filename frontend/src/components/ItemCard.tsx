import { useState } from 'react';
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

export { InstagramIcon };

interface Props {
  item: MenuItem;
  cartQuantity?: number;
  onOrder?: (item: MenuItem) => void;
  onAddOne?: (item: MenuItem) => void;
}

export default function ItemCard({ item, cartQuantity = 0, onOrder, onAddOne }: Props) {
  const [imgError, setImgError] = useState(false);
  const inCart = cartQuantity > 0;
  const canInteract = item.isAvailable && (onOrder || onAddOne);

  const Placeholder = () => (
    <div
      className="flex items-center justify-center w-full h-full"
      style={{ backgroundColor: '#f3f4f6' }}
    >
      <span style={{ fontSize: 24 }}>🍕</span>
    </div>
  );

  return (
    <div
      className={`bg-white rounded-xl overflow-hidden transition-shadow duration-200 hover:shadow-md ${!item.isAvailable ? 'opacity-70' : ''}`}
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
    >
      {/* ── Mobile: horizontal layout ── Desktop: vertical layout ── */}

      {/* MOBILE horizontal row */}
      <div className="flex lg:hidden">
        {/* Square image */}
        <div className="relative flex-shrink-0 w-24 h-24 m-3 rounded-xl overflow-hidden">
          {item.imageUrl && !imgError ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <Placeholder />
          )}
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black/30" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 py-3 pr-3 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-1">
              <h3
                className="font-semibold text-[#1a1a1a] text-sm leading-tight line-clamp-1"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              >
                {item.name}
              </h3>
              <span
                className="flex-shrink-0 px-2 py-0.5 rounded-lg text-white text-xs font-bold ml-1"
                style={{ backgroundColor: '#CE2B37' }}
              >
                €{Number(item.price).toFixed(2)}
              </span>
            </div>
            {item.description && (
              <p className="text-gray-400 text-xs mt-0.5 leading-relaxed line-clamp-2">{item.description}</p>
            )}
          </div>

          {canInteract && (
            <div className="mt-2">
              {inCart ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onAddOne?.(item)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-white text-xs font-semibold transition-opacity hover:opacity-90 active:scale-95"
                    style={{ backgroundColor: '#006B3C' }}
                  >
                    <span className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center text-[10px] font-bold">
                      {cartQuantity}
                    </span>
                    Shto përsëri
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </button>
                  {onOrder && (
                    <button
                      onClick={() => onOrder(item)}
                      className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors flex-shrink-0"
                    >
                      Personalizo
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => onOrder?.(item)}
                  className="w-full py-1.5 rounded-lg text-white text-xs font-semibold transition-opacity hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: '#CE2B37' }}
                >
                  Porosit
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* DESKTOP vertical layout */}
      <div className="hidden lg:block">
        <div className="relative">
          {item.imageUrl && !imgError ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-48 object-cover"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-48">
              <Placeholder />
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

          <div
            className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-white text-sm font-bold shadow-md"
            style={{ backgroundColor: '#CE2B37' }}
          >
            €{Number(item.price).toFixed(2)}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3
              className="font-semibold text-[#1a1a1a] text-base leading-tight"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
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

          {canInteract && (
            <div className="mt-3">
              {inCart ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onAddOne?.(item)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90 active:scale-95"
                    style={{ backgroundColor: '#006B3C' }}
                  >
                    <span className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center text-xs font-bold">
                      {cartQuantity}
                    </span>
                    Shto përsëri
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </button>
                  {onOrder && (
                    <button
                      onClick={() => onOrder(item)}
                      className="px-3 py-2 rounded-lg text-xs font-medium border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors flex-shrink-0"
                    >
                      Personalizo
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => onOrder?.(item)}
                  className="w-full py-2 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: '#CE2B37' }}
                >
                  Porosit
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
