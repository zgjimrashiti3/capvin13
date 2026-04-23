import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import DashboardSection from '../pages/admin/DashboardPage';
import CategoriesSection from '../pages/admin/CategoriesPage';
import ItemsSection from '../pages/admin/ItemsPage';
import QRSection from '../pages/admin/QRCodePage';
import OrdersSection from '../pages/admin/OrdersPage';
import { getOrders } from '../api/orders';

export type AdminSection = 'dashboard' | 'categories' | 'items' | 'qr' | 'orders';

const navItems: { id: AdminSection; label: string; icon: React.ReactElement; badge?: boolean }[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    id: 'orders',
    label: 'Porositë',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    ),
    badge: true,
  },
  {
    id: 'categories',
    label: 'Kategoritë',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: 'items',
    label: 'Artikujt',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18M3 12h18M3 18h18" />
      </svg>
    ),
  },
  {
    id: 'qr',
    label: 'QR Kodi',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <path d="M14 14h.01M14 18h.01M18 14h.01M18 18h.01M14 21h7M21 14v7" />
      </svg>
    ),
  },
];

const sectionTitles: Record<AdminSection, string> = {
  dashboard: 'Dashboard',
  categories: 'Kategoritë',
  items: 'Artikujt',
  qr: 'QR Kodi',
  orders: 'Porositë',
};

export default function AdminLayout() {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingAdd, setPendingAdd] = useState<null | 'categories' | 'items'>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: pendingOrders = [] } = useQuery({
    queryKey: ['orders-pending-count'],
    queryFn: () => getOrders('PENDING'),
    refetchInterval: 15000,
  });

  const pendingCount = pendingOrders.length;

  useEffect(() => {
    if (pendingCount > 0) {
      document.title = `🔴 (${pendingCount}) Porosi të reja — Capvin13`;
    } else {
      document.title = 'Capvin13 — Admin';
    }
    return () => { document.title = 'Capvin13'; };
  }, [pendingCount]);

  const handleNavClick = (section: AdminSection) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  const handleQuickAdd = (section: 'categories' | 'items') => {
    setActiveSection(section);
    setPendingAdd(section);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-[#f8f8f8]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-[240px] z-40 flex flex-col
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
        style={{ backgroundColor: '#006B3C' }}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/10">
          <h1
            className="text-2xl font-bold text-white tracking-tight"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            Capvin13
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Panel i Adminit
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ id, label, icon, badge }) => {
            const isActive = activeSection === id;
            const showBadge = badge && pendingCount > 0;
            return (
              <button
                key={id}
                onClick={() => handleNavClick(id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? '#006B3C' : 'rgba(255,255,255,0.85)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.12)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                }}
              >
                <span className={isActive ? 'text-[#006B3C]' : 'text-white/70'}>{icon}</span>
                <span className="flex-1 text-left">{label}</span>
                {showBadge && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ backgroundColor: '#CE2B37' }}
                    />
                    <span
                      className="relative inline-flex rounded-full h-2.5 w-2.5"
                      style={{ backgroundColor: '#CE2B37' }}
                    />
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User + logout */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              {user?.username?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <span className="text-sm text-white/80 truncate">{user?.username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-xs rounded-lg transition-colors duration-200 text-white/60 hover:text-white"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(206,43,55,0.3)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
          >
            ⎋ Dil (Logout)
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col md:ml-[240px] min-w-0">

        {/* Mobile top bar */}
        <header
          className="md:hidden flex items-center gap-3 px-4 py-3 sticky top-0 z-20 shadow-md"
          style={{ backgroundColor: '#006B3C' }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white p-1 rounded-md transition-colors hover:bg-white/10 relative"
            aria-label="Toggle menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
            {pendingCount > 0 && (
              <span
                className="absolute top-0 right-0 w-2 h-2 rounded-full"
                style={{ backgroundColor: '#CE2B37' }}
              />
            )}
          </button>
          <span
            className="text-lg font-bold text-white"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            {sectionTitles[activeSection]}
          </span>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {activeSection === 'dashboard' && (
            <DashboardSection onQuickAdd={handleQuickAdd} />
          )}
          {activeSection === 'orders' && <OrdersSection />}
          {activeSection === 'categories' && (
            <CategoriesSection
              triggerAdd={pendingAdd === 'categories'}
              onTriggerConsumed={() => setPendingAdd(null)}
            />
          )}
          {activeSection === 'items' && (
            <ItemsSection
              triggerAdd={pendingAdd === 'items'}
              onTriggerConsumed={() => setPendingAdd(null)}
            />
          )}
          {activeSection === 'qr' && <QRSection />}
        </main>
      </div>
    </div>
  );
}
