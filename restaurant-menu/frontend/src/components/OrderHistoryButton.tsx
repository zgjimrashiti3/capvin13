import { useSessionOrders } from '../context/SessionOrdersContext';

interface Props {
  onClick: () => void;
}

export default function OrderHistoryButton({ onClick }: Props) {
  const { sessionOrders } = useSessionOrders();

  if (sessionOrders.length === 0) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-4 z-30 flex items-center gap-2 rounded-full shadow-xl transition-transform hover:scale-105 active:scale-95"
      style={{ backgroundColor: '#006B3C' }}
      title="Porositë e mia"
    >
      {/* Icon always visible */}
      <div className="relative p-3">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="M9 12h6M9 16h4" />
        </svg>
        <span
          className="absolute top-1 right-0.5 min-w-[16px] h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center px-1"
          style={{ backgroundColor: '#CE2B37' }}
        >
          {sessionOrders.length}
        </span>
      </div>

      {/* Label hidden on mobile, shown on sm+ */}
      <span className="hidden sm:block text-white font-semibold text-sm pr-4">
        Porositë e mia
      </span>
    </button>
  );
}
