import { useCart } from '../context/CartContext';

interface Props {
  onClick: () => void;
}

export default function FloatingCartButton({ onClick }: Props) {
  const { totalItems, totalPrice } = useCart();

  if (totalItems === 0) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-5 z-30 flex items-center gap-3 pl-4 pr-5 py-3.5 rounded-full shadow-xl transition-transform hover:scale-105 active:scale-95"
      style={{ backgroundColor: '#006B3C' }}
    >
      {/* Cart icon */}
      <div className="relative">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        {/* Red badge */}
        <span
          className="absolute -top-2 -right-2.5 min-w-[18px] h-[18px] rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1"
          style={{ backgroundColor: '#CE2B37' }}
        >
          {totalItems}
        </span>
      </div>

      <span className="text-white font-semibold text-sm">
        €{totalPrice.toFixed(2)}
      </span>
    </button>
  );
}
