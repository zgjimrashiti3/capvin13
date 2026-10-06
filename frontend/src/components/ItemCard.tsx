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
  // false = compact text-only row (admin turned menu photos off)
  showImage?: boolean;
}

const CARD_SHADOW = { boxShadow: '0 1px 4px rgba(0,0,0,0.08)' };

export default function ItemCard({ item, cartQuantity = 0, onOrder, onAddOne, showImage = true }: Props) {
  const [imgError, setImgError] = useState(false);
  const inCart = cartQuantity > 0;
  const canInteract = item.isAvailable && (onOrder || onAddOne);
  const priceLabel = `${item.hasSizes ? 'nga ' : ''}€${Number(item.price).toFixed(2)}`;

  if (!showImage) {
    return (
      <div
        className={`bg-white rounded-xl px-4 py-3 flex items-center gap-3 h-full ${!item.isAvailable ? 'opacity-70' : ''}`}
        style={CARD_SHADOW}
      >
        <div className="flex-1 min-w-0">
          <h3
            className="font-normal text-[#1a1a1a] text-sm md:text-base leading-tight"
            style={{ fontFamily: '"Fraunces", Georgia, serif' }}
          >
            {item.name}
          </h3>
          {item.description && (
            <p className="text-gray-500 text-xs md:text-sm mt-0.5 leading-relaxed line-clamp-2">
              {item.description}
            </p>
          )}
          <p className="text-sm font-bold mt-1" style={{ color: '#CE2B37' }}>{priceLabel}</p>
        </div>

        {!item.isAvailable ? (
          <span
            className="flex-shrink-0 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
            style={{ backgroundColor: '#CE2B37' }}
          >
            Non disponibile
          </span>
        ) : canInteract && (
          <div className="flex-shrink-0 w-28 flex flex-col gap-1">
            {inCart ? (
              <>
                <button
                  onClick={() => onAddOne?.(item)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-white text-xs font-semibold transition-opacity hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: '#006B3C' }}
                >
                  <span className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center text-[10px] font-bold">
                    {cartQuantity}
                  </span>
                  Shto përsëri
                </button>
                {onOrder && (
                  <button
                    onClick={() => onOrder(item)}
                    className="w-full py-1 rounded-lg text-[10px] font-medium border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    Personalizo
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => onOrder?.(item)}
                className="w-full py-1.5 rounded-lg text-white text-xs font-normal transition-opacity hover:opacity-90 active:scale-95"
                style={{ backgroundColor: '#CE2B37' }}
              >
                Porosit
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl overflow-hidden transition-shadow duration-200 hover:shadow-md flex flex-col h-full ${!item.isAvailable ? 'opacity-70' : ''}`}
      style={CARD_SHADOW}
    >
      {/* Image */}
      <div className="relative h-40 md:h-48 flex-shrink-0">
        {item.imageUrl && !imgError ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          // No photo (or it failed to load): branded tile with the item's initial.
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(0,107,60,0.10) 0%, rgba(206,43,55,0.10) 100%)' }}
            aria-hidden="true"
          >
            <span
              className="text-5xl md:text-6xl"
              style={{ fontFamily: '"Fraunces", Georgia, serif', color: 'rgba(0,107,60,0.35)' }}
            >
              {item.name.trim().charAt(0).toUpperCase()}
            </span>
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
          className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg text-white text-xs font-bold shadow-md"
          style={{ backgroundColor: '#CE2B37' }}
        >
          {priceLabel}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 md:p-4 flex flex-col flex-1">
        <h3
          className="font-normal text-[#1a1a1a] text-sm md:text-base leading-tight"
          style={{ fontFamily: '"Fraunces", Georgia, serif' }}
        >
          {item.name}
        </h3>

        {item.description && (
          <p className="text-gray-500 text-xs md:text-sm mt-1 leading-relaxed line-clamp-2 flex-1">
            {item.description}
          </p>
        )}

        {canInteract && (
          <div className="mt-2 md:mt-3">
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
                    className="px-2 py-1.5 rounded-lg text-[10px] font-medium border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors flex-shrink-0"
                  >
                    Personalizo
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => onOrder?.(item)}
                className="w-full py-1.5 rounded-lg text-white text-xs font-normal transition-opacity hover:opacity-90 active:scale-95"
                style={{ backgroundColor: '#CE2B37' }}
              >
                Porosit
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
