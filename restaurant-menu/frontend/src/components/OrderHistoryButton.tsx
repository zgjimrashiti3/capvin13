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
      className="fixed bottom-6 left-5 z-30 flex items-center gap-2.5 pl-3.5 pr-4 py-3.5 rounded-full shadow-xl transition-transform hover:scale-105 active:scale-95"
      style={{ backgroundColor: '#006B3C' }}
    >
      <div className="relative flex-shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="M9 12h6M9 16h4" />
        </svg>
        <span
          className="absolute -top-2 -right-2.5 min-w-[18px] h-[18px] rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1"
          style={{ backgroundColor: '#CE2B37' }}
        >
          {sessionOrders.length}
        </span>
      </div>
      <span className="text-white font-semibold text-sm">Porositë e mia</span>
    </button>
  );
}
