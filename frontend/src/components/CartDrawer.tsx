import { useState, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useSessionOrders } from '../context/SessionOrdersContext';
import { useToast } from './Toast';
import { createOrder } from '../api/orders';
import type { CartItem } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
}

function QuantityRow({ item, onQty }: { item: CartItem; onQty: (id: string, qty: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onQty(item.menuItemId, item.quantity - 1)}
          className="w-8 h-8 rounded-full bg-white border border-gray-200 text-sm font-bold text-gray-500 hover:border-gray-400 transition-colors flex items-center justify-center"
          title={item.quantity === 1 ? 'Hiq nga shporta' : ''}
        >
          −
        </button>
        <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
        <button
          onClick={() => onQty(item.menuItemId, item.quantity + 1)}
          disabled={item.quantity >= 20}
          className="w-8 h-8 rounded-full bg-white border border-gray-200 text-sm font-bold text-gray-500 hover:border-gray-400 disabled:opacity-30 transition-colors flex items-center justify-center"
        >
          +
        </button>
      </div>
      <span className="text-sm font-bold" style={{ color: '#CE2B37' }}>
        €{(item.price * item.quantity).toFixed(2)}
      </span>
    </div>
  );
}

export default function CartDrawer({ open, onClose }: Props) {
  const { items, tableNumber, removeItem, updateQuantity, updateNotes, clearCart, totalPrice, totalItems } = useCart();
  const { addSessionOrder } = useSessionOrders();
  const { showToast } = useToast();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteValue, setEditingNoteValue] = useState('');
  const noteInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!tableNumber || items.length === 0) return;
    setSending(true);
    setError('');
    // Snapshot before clearing
    const snapshot = items.map((i) => ({ ...i }));
    try {
      const created = await createOrder({
        tableNumber,
        items: snapshot.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity, notes: i.notes })),
      });
      addSessionOrder({
        id: created.id,
        tableNumber,
        items: snapshot,
        totalPrice: Number(created.totalPrice),
        sentAt: new Date().toISOString(),
        status: 'PENDING',
      });
      clearCart();
      showToast('Porosia u dërgua! 🎉 Kamarieri do t\'ju shërbejë së shpejti.', 'success');
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Ndodhi një gabim. Provo sërish.');
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setError('');
    setEditingNoteId(null);
    onClose();
  };

  const startEditNote = (menuItemId: string, currentNotes: string) => {
    setEditingNoteId(menuItemId);
    setEditingNoteValue(currentNotes);
    setTimeout(() => noteInputRef.current?.focus(), 0);
  };

  const commitNote = (menuItemId: string) => {
    updateNotes(menuItemId, editingNoteValue.trim());
    setEditingNoteId(null);
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/40" onClick={handleClose} />}

      <div
        className="fixed top-0 right-0 h-full w-full sm:w-[400px] z-50 flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out"
        style={{ transform: open ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0" style={{ backgroundColor: '#006B3C' }}>
          <div className="flex items-center gap-2.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <h2 className="text-white font-semibold text-base">Shporta ({totalItems})</h2>
          </div>
          <button onClick={handleClose} className="text-white/80 hover:text-white transition-colors text-2xl leading-none p-2 -m-2">×</button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <span className="text-5xl mb-4">🛒</span>
              <p className="text-gray-400 font-medium">Shporta është bosh</p>
              <p className="text-gray-300 text-sm mt-1">Shtoni artikuj nga menuja</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.menuItemId} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl" style={{ background: 'linear-gradient(135deg, rgba(0,107,60,0.1) 0%, rgba(206,43,55,0.1) 100%)' }}>
                          🍽️
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm text-[#1a1a1a] leading-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                          {item.name}
                        </p>
                        <button
                          onClick={() => removeItem(item.menuItemId)}
                          className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 text-lg leading-none p-1 -m-1"
                        >
                          ×
                        </button>
                      </div>
                      <div className="mt-2">
                        <QuantityRow item={item} onQty={updateQuantity} />
                      </div>
                    </div>
                  </div>

                  {/* Inline note editor */}
                  {editingNoteId === item.menuItemId ? (
                    <input
                      ref={noteInputRef}
                      type="text"
                      value={editingNoteValue}
                      onChange={(e) => setEditingNoteValue(e.target.value)}
                      onBlur={() => commitNote(item.menuItemId)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitNote(item.menuItemId);
                        if (e.key === 'Escape') setEditingNoteId(null);
                      }}
                      placeholder="P.sh. pa kripë, pa qepë..."
                      className="mt-2 w-full text-xs border rounded-lg px-2.5 py-1.5 focus:outline-none bg-white"
                      style={{ borderColor: '#006B3C' }}
                    />
                  ) : (
                    <div className="mt-1.5">
                      {item.notes ? (
                        <button
                          onClick={() => startEditNote(item.menuItemId, item.notes)}
                          className="text-xs text-gray-400 italic hover:text-gray-600 transition-colors text-left w-full truncate"
                        >
                          📝 {item.notes}
                        </button>
                      ) : (
                        <button
                          onClick={() => startEditNote(item.menuItemId, '')}
                          className="text-xs text-gray-300 hover:text-gray-500 transition-colors"
                        >
                          + Shto shënim
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t bg-white flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-500 text-sm">Totali</span>
              <span className="text-xl font-bold text-[#1a1a1a]">€{totalPrice.toFixed(2)}</span>
            </div>
            {error && <p className="text-red-500 text-xs mb-3 text-center">{error}</p>}
            <button
              onClick={handleSend}
              disabled={sending}
              className="w-full py-3.5 rounded-xl text-white font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#006B3C' }}
            >
              {sending ? 'Duke dërguar...' : 'Dërgo porosinë →'}
            </button>
            <button
              onClick={handleClose}
              className="w-full mt-2 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Vazhdo blerjen
            </button>
          </div>
        )}
      </div>
    </>
  );
}
