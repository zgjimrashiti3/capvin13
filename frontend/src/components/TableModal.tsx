import { useState } from 'react';
import { useCart } from '../context/CartContext';

interface Props {
  onDone: () => void;
}

export default function TableModal({ onDone }: Props) {
  const { tableNumber, setTableNumber } = useCart();
  const [value, setValue] = useState(tableNumber ? String(tableNumber) : '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(value, 10);
    if (!value || isNaN(n) || n < 1) {
      setError('Ju lutem shkruani një numër tavoline të vlefshëm.');
      return;
    }
    setTableNumber(n);
    onDone();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="px-8 py-8 text-center" style={{ backgroundColor: '#006B3C' }}>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            {tableNumber ? 'Ndrysho tavolinën' : 'Mirë se vini në Capvin13'}
          </h1>
          <p className="text-white/70 text-sm mt-1.5">Sapori autentici di Napoli</p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-7">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Numri i tavolinës
          </label>
          <input
            type="number"
            min={1}
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(''); }}
            placeholder="p.sh. 1"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg text-center font-semibold focus:outline-none transition-colors"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#006B3C')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
            autoFocus
          />
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

          <button
            type="submit"
            className="mt-5 w-full py-3.5 rounded-xl text-white font-semibold text-base transition-opacity hover:opacity-90 active:scale-95"
            style={{ backgroundColor: '#006B3C', fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            {tableNumber ? 'Ruaj ndryshimin' : 'Shko te menuja →'}
          </button>
        </form>
      </div>
    </div>
  );
}
