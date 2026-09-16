import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrders, updateOrderStatus } from '../../api/orders';
import type { Order, OrderStatus } from '../../types';
import { useToast } from '../../components/Toast';

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Në pritje',
  CONFIRMED: 'Konfirmuar',
  READY: 'Gati',
  DELIVERED: 'Dorëzuar',
  CANCELLED: 'Anuluar',
};

const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  PENDING: { bg: 'rgba(206,43,55,0.12)', text: '#CE2B37' },
  CONFIRMED: { bg: 'rgba(217,119,6,0.12)', text: '#d97706' },
  READY: { bg: 'rgba(0,107,60,0.12)', text: '#006B3C' },
  DELIVERED: { bg: 'rgba(59,130,246,0.12)', text: '#3b82f6' },
  CANCELLED: { bg: 'rgba(107,114,128,0.12)', text: '#6b7280' },
};

type FilterTab = 'ALL' | OrderStatus;

const TABS: { id: FilterTab; label: string }[] = [
  { id: 'ALL', label: 'Të gjitha' },
  { id: 'PENDING', label: 'Në pritje' },
  { id: 'CONFIRMED', label: 'Konfirmuara' },
  { id: 'READY', label: 'Gati' },
  { id: 'DELIVERED', label: 'Dorëzuara' },
];

function shortId(id: string) {
  return id.slice(0, 6).toUpperCase();
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' });
}

function itemsSummary(order: Order) {
  return order.items
    .map((i) => `${i.quantity}× ${i.menuItem?.name ?? 'Artikull'}`)
    .join(', ');
}

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
  updating: boolean;
}

function OrderDetailModal({ order, onClose, onStatusChange, updating }: OrderDetailModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h3 className="font-bold text-[#1a1a1a] text-lg" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
              Porosia #{shortId(order.id)}
            </h3>
            <p className="text-sm text-gray-400">Tavolina {order.tableNumber} • {formatTime(order.createdAt)}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-2 -m-2">×</button>
        </div>

        <div className="px-6 py-5 space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-3 items-start">
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                {item.menuItem?.imageUrl ? (
                  <img src={item.menuItem.imageUrl} alt={item.menuItem.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl" style={{ background: 'rgba(0,107,60,0.08)' }}>🍽️</div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-[#1a1a1a]" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                  {item.menuItem?.name ?? 'Artikull i fshirë'}
                </p>
                {item.notes && <p className="text-xs text-gray-400 italic mt-0.5">{item.notes}</p>}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">{item.quantity}× €{Number(item.unitPrice).toFixed(2)}</span>
                  <span className="text-sm font-bold" style={{ color: '#CE2B37' }}>€{(item.quantity * Number(item.unitPrice)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t flex items-center justify-between">
          <span className="text-gray-500 text-sm">Totali</span>
          <span className="text-xl font-bold text-[#1a1a1a]">€{Number(order.totalPrice).toFixed(2)}</span>
        </div>

        {/* Status actions */}
        <div className="px-6 py-4 border-t flex flex-wrap gap-2">
          {order.status === 'PENDING' && (
            <>
              <button onClick={() => onStatusChange(order.id, 'CONFIRMED')} disabled={updating} className="px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-60 transition-opacity hover:opacity-90" style={{ backgroundColor: '#006B3C' }}>Konfirmo</button>
              <button onClick={() => onStatusChange(order.id, 'CANCELLED')} disabled={updating} className="px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-60 transition-opacity hover:opacity-90" style={{ backgroundColor: '#CE2B37' }}>Anulo</button>
            </>
          )}
          {order.status === 'CONFIRMED' && (
            <button onClick={() => onStatusChange(order.id, 'READY')} disabled={updating} className="px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-60 transition-opacity hover:opacity-90" style={{ backgroundColor: '#d97706' }}>Shëno Gati</button>
          )}
          {order.status === 'READY' && (
            <button onClick={() => onStatusChange(order.id, 'DELIVERED')} disabled={updating} className="px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-60 transition-opacity hover:opacity-90" style={{ backgroundColor: '#3b82f6' }}>Shëno Dorëzuar</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', activeTab],
    queryFn: () => getOrders(activeTab === 'ALL' ? undefined : activeTab),
    refetchInterval: 15000,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => updateOrderStatus(id, status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders-pending-count'] });
      setSelectedOrder(updated);
      showToast('Statusi u përditësua.', 'success');
    },
    onError: () => showToast('Gabim gjatë përditësimit.', 'error'),
  });

  const pending = orders.filter((o) => o.status === 'PENDING').length;
  const confirmed = orders.filter((o) => o.status === 'CONFIRMED').length;
  const ready = orders.filter((o) => o.status === 'READY').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1a1a1a]" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            Porositë
          </h2>
          <p className="text-gray-400 text-sm mt-0.5">Menaxho porositë e klientëve</p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border-l-4 shadow-sm" style={{ borderColor: '#CE2B37' }}>
          <p className="text-2xl font-bold text-[#1a1a1a]">{pending}</p>
          <p className="text-xs text-gray-400 mt-0.5">Në pritje</p>
        </div>
        <div className="bg-white rounded-xl p-4 border-l-4 shadow-sm" style={{ borderColor: '#d97706' }}>
          <p className="text-2xl font-bold text-[#1a1a1a]">{confirmed}</p>
          <p className="text-xs text-gray-400 mt-0.5">Konfirmuara</p>
        </div>
        <div className="bg-white rounded-xl p-4 border-l-4 shadow-sm" style={{ borderColor: '#006B3C' }}>
          <p className="text-2xl font-bold text-[#1a1a1a]">{ready}</p>
          <p className="text-xs text-gray-400 mt-0.5">Gati</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-100">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-shrink-0 px-5 py-3.5 text-sm font-medium transition-colors relative"
              style={{ color: activeTab === tab.id ? '#006B3C' : '#6b7280' }}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: '#006B3C' }} />
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin mx-auto" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-400 text-sm">Nuk ka porosi.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Order #</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tavolina</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Artikujt</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Totali</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Koha</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Statusi</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Veprimet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => {
                  const colors = STATUS_COLORS[order.status];
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-500">#{shortId(order.id)}</td>
                      <td className="px-5 py-3.5 font-semibold text-[#1a1a1a]">{order.tableNumber}</td>
                      <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell max-w-[200px] truncate">{itemsSummary(order)}</td>
                      <td className="px-5 py-3.5 font-semibold" style={{ color: '#CE2B37' }}>€{Number(order.totalPrice).toFixed(2)}</td>
                      <td className="px-5 py-3.5 text-gray-400 hidden sm:table-cell">{formatTime(order.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: colors.bg, color: colors.text }}
                        >
                          {STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1.5">
                          {order.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => mutation.mutate({ id: order.id, status: 'CONFIRMED' })}
                                disabled={mutation.isPending}
                                className="px-2.5 py-1 rounded-lg text-white text-xs font-medium disabled:opacity-60 transition-opacity hover:opacity-90"
                                style={{ backgroundColor: '#006B3C' }}
                              >
                                Konfirmo
                              </button>
                              <button
                                onClick={() => mutation.mutate({ id: order.id, status: 'CANCELLED' })}
                                disabled={mutation.isPending}
                                className="px-2.5 py-1 rounded-lg text-white text-xs font-medium disabled:opacity-60 transition-opacity hover:opacity-90"
                                style={{ backgroundColor: '#CE2B37' }}
                              >
                                Anulo
                              </button>
                            </>
                          )}
                          {order.status === 'CONFIRMED' && (
                            <button
                              onClick={() => mutation.mutate({ id: order.id, status: 'READY' })}
                              disabled={mutation.isPending}
                              className="px-2.5 py-1 rounded-lg text-white text-xs font-medium disabled:opacity-60 transition-opacity hover:opacity-90"
                              style={{ backgroundColor: '#d97706' }}
                            >
                              Gati
                            </button>
                          )}
                          {order.status === 'READY' && (
                            <button
                              onClick={() => mutation.mutate({ id: order.id, status: 'DELIVERED' })}
                              disabled={mutation.isPending}
                              className="px-2.5 py-1 rounded-lg text-white text-xs font-medium disabled:opacity-60 transition-opacity hover:opacity-90"
                              style={{ backgroundColor: '#3b82f6' }}
                            >
                              Dorëzuar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={(id, status) => mutation.mutate({ id, status })}
          updating={mutation.isPending}
        />
      )}
    </div>
  );
}
