import { useState } from 'react';
import type { MenuItem } from '../types';
import { useCart } from '../context/CartContext';

interface Props {
  item: MenuItem;
  onClose: () => void;
}

const KAFE_SIZES = ['E vogël', 'E mesme', 'E gjatë'];

export default function OrderModal({ item, onClose }: Props) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [size, setSize] = useState('');

  const catName = item.category?.name?.toUpperCase() ?? '';
  const isPije = catName.includes('PIJE');
  const isKafe = catName.includes('KAFE');
  const showNotes = !isPije && !isKafe;
  const canAdd = !isKafe || size !== '';

  const handleAdd = () => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: Number(item.price),
      imageUrl: item.imageUrl,
      quantity,
      notes: isKafe ? size : notes,
    });
    onClose();
  };

  const total = (Number(item.price) * quantity).toFixed(2);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl">
        {/* Item image or placeholder */}
        <div className="relative h-44 sm:h-52">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(0,107,60,0.08) 0%, rgba(206,43,55,0.08) 100%)' }}>
              <span className="text-6xl">🍽️</span>
            </div>
          )}
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

        <div className="px-6 py-5">
          <h3
            className="text-xl font-bold text-[#1a1a1a] mb-1"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
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

          {/* Kafe: size selector */}
          {isKafe && (
            <div className="mb-5">
              <label className="block text-xs text-gray-400 mb-2">Madhësia</label>
              <div className="flex gap-2">
                {KAFE_SIZES.map((s) => (
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
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Other categories: short notes input */}
          {showNotes && (
            <div className="mb-5">
              <label className="block text-xs text-gray-400 mb-1">Shënim</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="P.sh. pa qepë"
                maxLength={100}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
                onFocus={(e) => (e.currentTarget.style.borderColor = '#006B3C')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
              />
            </div>
          )}

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
