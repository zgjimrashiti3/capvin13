import { useState } from 'react';
import type { ItemSize, MenuItem } from '../types';
import { useCart } from '../context/CartContext';
import { ITEM_SIZES, sizeLabelsFor } from '../utils/sizes';
import { useShowImages } from '../hooks/useShowImages';

interface Props {
  item: MenuItem;
  onClose: () => void;
}

export default function OrderModal({ item, onClose }: Props) {
  const { addItem } = useCart();
  const showImages = useShowImages();
  const [imgError, setImgError] = useState(false);
  const hasPhoto = showImages && !!item.imageUrl && !imgError;
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [size, setSize] = useState<ItemSize | null>(null);

  // Only items marked "has sizes" (e.g. espresso) require a size choice.
  const sizePrices = item.hasSizes ? item.sizePrices : null;
  const canAdd = !sizePrices || size !== null;
  const sizeLabels = sizeLabelsFor(item);
  const unitPrice = sizePrices && size ? Number(sizePrices[size]) : Number(item.price);

  const handleAdd = () => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: unitPrice,
      imageUrl: item.imageUrl,
      quantity,
      notes,
      size: sizePrices ? size : null,
      sizeLabel: sizePrices && size ? sizeLabels[size] : null,
    });
    onClose();
  };

  const total = (unitPrice * quantity).toFixed(2);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl">
        {/* Item photo — skipped when photos are off or the item has none */}
        {hasPhoto ? (
          <div className="relative h-44 sm:h-52">
            <img
              src={item.imageUrl!}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors text-lg leading-none"
            >
              ×
            </button>
            <div
              className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-white text-sm font-bold shadow-md"
              style={{ backgroundColor: '#CE2B37' }}
            >
              €{total}
            </div>
          </div>
        ) : (
          <div className="flex justify-end px-3 pt-3 -mb-3">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors text-lg leading-none"
              aria-label="Mbyll"
            >
              ×
            </button>
          </div>
        )}

        <div className="px-6 py-5">
          <h3
            className="text-xl font-bold text-[#1a1a1a] mb-1"
            style={{ fontFamily: '"Fraunces", Georgia, serif' }}
          >
            {item.name}
          </h3>
          {item.description && (
            <p className="text-gray-500 text-sm mb-4 leading-relaxed">{item.description}</p>
          )}

          {/* Quantity selector */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm font-medium text-gray-600">Sasia</span>
            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 hover:border-gray-400 transition-colors disabled:opacity-40"
                disabled={quantity <= 1}
              >
                −
              </button>
              <span className="w-8 text-center font-bold text-lg text-[#1a1a1a]">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 hover:border-gray-400 transition-colors disabled:opacity-40"
                disabled={quantity >= 20}
              >
                +
              </button>
            </div>
          </div>

          {/* Size selector — only for items with sizes */}
          {sizePrices && (
            <div className="mb-5">
              <label className="block text-xs text-gray-400 mb-2">Madhësia</label>
              <div className="flex gap-2">
                {ITEM_SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className="flex-1 py-2 px-3 rounded-xl text-sm font-medium border-2 transition-colors"
                    style={{
                      backgroundColor: size === s ? '#006B3C' : 'white',
                      borderColor: '#006B3C',
                      color: size === s ? 'white' : '#006B3C',
                    }}
                  >
                    {sizeLabels[s]}
                    <span className="block text-xs opacity-80">€{Number(sizePrices[s]).toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Special request / notes — available for every product */}
          <div className="mb-5">
            <label className="block text-xs text-gray-400 mb-1">Diçka speciale? (opsionale)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={100}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
              onFocus={(e) => (e.currentTarget.style.borderColor = '#006B3C')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Anulo
            </button>
            <button
              onClick={handleAdd}
              disabled={!canAdd}
              className="flex-[2] py-3 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#006B3C' }}
            >
              Shto në porosi — €{total}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
