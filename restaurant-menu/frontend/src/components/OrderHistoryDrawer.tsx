import { useSessionOrders, type SessionOrder } from '../context/SessionOrdersContext';
import { useCart } from '../context/CartContext';
import type { OrderStatus } from '../types';

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Në pritje',
  CONFIRMED: 'Konfirmuar ✅',
  READY: 'Gati 🍽️',
  DELIVERED: 'Dorëzuar',
  CANCELLED: 'Anuluar',
};

const STATUS_COLORS: Record<OrderStatus, { bg: string; color: string }> = {
  PENDING:   { bg: 'rgba(107,114,128,0.1)', color: '#6b7280' },
  CONFIRMED: { bg: 'rgba(0,107,60,0.12)',   color: '#006B3C' },
  READY:     { bg: 'rgba(217,119,6,0.12)',  color: '#d97706' },
  DELIVERED: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
  CANCELLED: { bg: 'rgba(206,43,55,0.12)',  color: '#CE2B37' },
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' });
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function OrderHistoryDrawer({ open, onClose }: Props) {
  const { sessionOrders, clearHistory } = useSessionOrders();
  const { addItem } = useCart();

  const hasReady = sessionOrders.some((o) => o.status === 'READY');

  const handleReorder = (order: SessionOrder) => {
    order.items.forEach((item) => addItem({ ...item }));
    onClose();
  };

  const handleClear = () => {
    clearHistory();
    onClose();
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />}

      <div
        className="fixed top-0 left-0 h-full w-full sm:w-[400px] z-50 flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out"
        style={{ transform: open ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0" style={{ backgroundColor: '#006B3C' }}>
          <div className="flex items-center gap-2.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 12h6M9 16h4" />
            </svg>
            <h2 className="text-white font-semibold text-base">
              Porositë e mia ({sessionOrders.length})
            </h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors text-2xl leading-none">×</button>
        </div>

        {/* READY alert banner */}
        {hasReady && (
          <div className="flex items-center gap-3 px-5 py-3 flex-shrink-0" style={{ backgroundColor: 'rgba(217,119,6,0.1)', borderBottom: '1px solid rgba(217,119,6,0.2)' }}>
            <span className="text-xl animate-pulse">🍽️</span>
            <p className="text-sm font-semibold" style={{ color: '#d97706' }}>
              Porosia juaj është gati! Kamarieri po vjen.
            </p>
          </div>
        )}

        {/* Orders */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {sessionOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <span className="text-4xl mb-3">📋</span>
              <p className="text-gray-400 font-medium">Nuk ka porosi ende</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessionOrders.map((order) => {
                const { bg, color } = STATUS_COLORS[order.status];
                return (
                  <div key={order.id} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                    {/* Order header row */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <div>
                        <p
                          className="font-bold text-sm text-[#1a1a1a]"
                          style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                        >
                          Porosia #{order.orderNumber}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Tavolina {order.tableNumber} · {formatTime(order.sentAt)}
                        </p>
                      </div>
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                        style={{ backgroundColor: bg, color }}
                      >
                        {STATUS_LABELS[order.status]}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="px-4 py-3 space-y-1">
                      {order.items.map((item) => (
                        <div key={item.menuItemId} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            {item.quantity}× {item.name}
                            {item.notes && (
                              <span className="text-xs text-gray-400 italic ml-1">({item.notes})</span>
                            )}
                          </span>
                          <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                            €{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      <div className="pt-2 mt-1 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-400">Totali</span>
                        <span className="text-sm font-bold" style={{ color: '#CE2B37' }}>
                          €{Number(order.totalPrice).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Reorder */}
                    <div className="px-4 py-2.5 border-t border-gray-100">
                      <button
                        onClick={() => handleReorder(order)}
                        className="text-xs font-semibold transition-colors"
                        style={{ color: '#006B3C' }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.75')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
                      >
                        + Porosit përsëri
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer — clear history */}
        {sessionOrders.length > 0 && (
          <div className="px-5 py-4 border-t flex-shrink-0 text-center">
            <button
              onClick={handleClear}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Fshi historinë e sesionit
            </button>
          </div>
        )}
      </div>
    </>
  );
}
