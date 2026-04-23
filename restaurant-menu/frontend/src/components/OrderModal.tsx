import { useState } from 'react';
import type { MenuItem } from '../types';
import { useCart } from '../context/CartContext';

interface Props {
  item: MenuItem;
  onClose: () => void;
}

export default function OrderModal({ item, onClose }: Props) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const handleAdd = () => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: Number(item.price),
      imageUrl: item.imageUrl,
      quantity,
      notes,
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

          {/* Notes */}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Shënime të veçanta: p.sh. pa kripë, pa qepë..."
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none transition-colors mb-5"
            onFocus={(e) => (e.currentTarget.style.borderColor = '#006B3C')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
          />

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
              className="flex-[2] py-3 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
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
