import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMenuGrouped } from '../api/menuItems';
import ItemCard, { InstagramIcon } from '../components/ItemCard';
import CategoryNav from '../components/CategoryNav';
import TableModal from '../components/TableModal';
import OrderModal from '../components/OrderModal';
import CartDrawer from '../components/CartDrawer';
import FloatingCartButton from '../components/FloatingCartButton';
import OrderHistoryButton from '../components/OrderHistoryButton';
import OrderHistoryDrawer from '../components/OrderHistoryDrawer';
import ScrollToTopButton from '../components/ScrollToTopButton';
import { useCart } from '../context/CartContext';
import { useSessionOrders } from '../context/SessionOrdersContext';
import { useToast } from '../components/Toast';
import { useOrderStatusPolling } from '../hooks/useOrderStatusPolling';
import type { MenuItem } from '../types';

export default function MenuPage() {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['menu-grouped'],
    queryFn: getMenuGrouped,
  });

  const { tableNumber, items: cartItems, addItem } = useCart();
  const { sessionOrders, updateSessionOrderStatus } = useSessionOrders();
  const { showToast } = useToast();
  const [orderingItem, setOrderingItem] = useState<MenuItem | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  useOrderStatusPolling(sessionOrders, updateSessionOrderStatus, showToast);

  const getCartQty = (menuItemId: string) =>
    cartItems.find((i) => i.menuItemId === menuItemId)?.quantity ?? 0;

  const handleAddOne = (menuItem: MenuItem) => {
    addItem({
      menuItemId: menuItem.id,
      name: menuItem.name,
      price: Number(menuItem.price),
      imageUrl: menuItem.imageUrl,
      quantity: 1,
      notes: '',
    });
  };
  const [cartOpen, setCartOpen] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement>>({});

  const FOOD_CATS = new Set(['Antipasti', 'Pica Innovative', 'Pica Tradizionale', 'Pasta & Calzone']);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#006B3C' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/80 text-base">Caricamento menù...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8]">
        <div className="text-center px-4">
          <p className="text-[#CE2B37] text-lg font-medium">Impossibile caricare il menù. Riprova.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8f8f8', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Table number modal — shown until table is set */}
      {!tableNumber && <TableModal onDone={() => {}} />}

      {/* ── Top Navbar ── */}
      <header style={{ backgroundColor: '#006B3C' }}>
        <div className="max-w-3xl mx-auto px-4 py-2 lg:py-3 flex items-center justify-between">
          <img
            src="/capvin.jpg"
            alt="Capvin13"
            className="h-12 lg:h-14 w-auto object-contain"
            style={{ mixBlendMode: 'multiply' }}
          />
          <div className="flex items-center gap-3">
            {tableNumber && (
              <span className="text-white/80 text-xs lg:text-sm font-medium">
                Tavolina #{tableNumber}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ── Sticky category nav ── */}
      {categories && categories.length > 0 && (
        <CategoryNav categories={categories} sectionRefs={sectionRefs} />
      )}

      {/* ── Categories & items ── */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-3 lg:px-4 pb-28">
        {categories?.map((cat) => (
          <section
            key={cat.id}
            ref={(el) => { if (el) sectionRefs.current[cat.id] = el; }}
            className="pt-8"
          >
            <div className="mb-4">
              <h2
                className="text-xl lg:text-2xl font-bold text-[#1a1a1a]"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              >
                {cat.name}
              </h2>
              {cat.description && (
                <p className="text-gray-500 text-sm mt-1">{cat.description}</p>
              )}
              <div className="mt-2 h-0.5 w-10 rounded-full" style={{ backgroundColor: '#CE2B37' }} />
            </div>

            {cat.items.length === 0 ? (
              <p className="text-gray-400 text-sm italic">Nessun articolo in questa categoria.</p>
            ) : FOOD_CATS.has(cat.name) ? (
              /* Food: horizontal scroll + snap on mobile, 2-col md, 3-col lg */
              <div className="-mx-3 px-3 scroll-pl-3 overflow-x-auto snap-x snap-mandatory pb-3 md:overflow-visible md:mx-0 md:px-0 md:scroll-pl-0 md:pb-0">
                <div className="flex gap-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
                  {cat.items.map((item) => (
                    <div key={item.id} className="snap-start shrink-0 w-[82%] md:w-full">
                      <ItemCard
                        item={item}
                        cartQuantity={tableNumber ? getCartQty(item.id) : 0}
                        onOrder={tableNumber ? (i) => setOrderingItem({ ...i, category: cat }) : undefined}
                        onAddOne={tableNumber ? handleAddOne : undefined}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Kafe / Pije: 2-col on mobile, 2-col md, 3-col lg */
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                {cat.items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    cartQuantity={tableNumber ? getCartQty(item.id) : 0}
                    onOrder={tableNumber ? (i) => setOrderingItem({ ...i, category: cat }) : undefined}
                    onAddOne={tableNumber ? handleAddOne : undefined}
                  />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      {/* ── Footer ── */}
      <footer style={{ backgroundColor: '#004d2b' }}>
        <div className="max-w-3xl mx-auto px-4 py-10 text-center">
          <a
            href="https://instagram.com/capvin13"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 text-white/80 hover:text-white transition-all duration-200 hover:scale-105 group text-sm mb-5"
            style={{ display: 'inline-flex' }}
          >
            <span className="transition-colors duration-200" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <InstagramIcon />
            </span>
            <span className="font-medium group-hover:text-white">
              Seguici su Instagram <span style={{ color: '#CE2B37' }}>@capvin13</span>
            </span>
          </a>
          <div className="border-t border-white/10 my-5" />
          <p className="text-white text-lg font-bold mb-1" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            🇮🇹 Capvin13 — Napoli, Italia
          </p>
          <p className="text-white/50 text-xs mt-2">
            © {new Date().getFullYear()} Capvin13. Tutti i diritti riservati.
          </p>
        </div>
      </footer>

      {/* ── Order modal ── */}
      {orderingItem && (
        <OrderModal item={orderingItem} onClose={() => setOrderingItem(null)} />
      )}

      {/* ── Floating cart button ── */}
      <FloatingCartButton onClick={() => setCartOpen(true)} />

      {/* ── Order history button + drawer ── */}
      <OrderHistoryButton onClick={() => setHistoryOpen(true)} />
      <OrderHistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} />

      {/* ── Scroll to top ── */}
      <ScrollToTopButton />

      {/* ── Cart drawer ── */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
