import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, createCategory, updateCategory, deleteCategory, toggleCategory } from '../../api/categories';
import { useToast } from '../../components/Toast';
import type { Category } from '../../types';

interface SectionProps {
  triggerAdd: boolean;
  onTriggerConsumed: () => void;
}

const INPUT_CLS =
  'w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#006B3C] focus:border-transparent transition-all';

function CategoryModal({
  initial,
  onSave,
  onClose,
}: {
  initial: Category | null;
  onSave: (data: Partial<Category>) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, description: description || undefined, sortOrder: Number(sortOrder) });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#1a1a1a]" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            {initial ? 'Ndrysho Kategori' : 'Shto Kategori të Re'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Emri *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={INPUT_CLS} placeholder="p.sh. Antipasti" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Përshkrimi</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`${INPUT_CLS} resize-none`}
              placeholder="Përshkrim i shkurtër..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Renditja</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className={INPUT_CLS}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Anulo
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: '#006B3C' }}
            >
              {initial ? 'Ruaj Ndryshimet' : 'Krijo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CategoriesSection({ triggerAdd, onTriggerConsumed }: SectionProps) {
  const qc = useQueryClient();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  useEffect(() => {
    if (triggerAdd) {
      setEditing(null);
      setModalOpen(true);
      onTriggerConsumed();
    }
  }, [triggerAdd, onTriggerConsumed]);

  const { data: categories, isLoading } = useQuery({ queryKey: ['categories'], queryFn: getCategories });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['categories'] });

  const createMut = useMutation({
    mutationFn: createCategory,
    onSuccess: () => { invalidate(); setModalOpen(false); showToast('Kategoria u krijua me sukses'); },
    onError: () => showToast('Gabim gjatë krijimit', 'error'),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) => updateCategory(id, data),
    onSuccess: () => { invalidate(); setModalOpen(false); showToast('Kategoria u përditësua'); },
    onError: () => showToast('Gabim gjatë përditësimit', 'error'),
  });
  const deleteMut = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => { invalidate(); showToast('Kategoria u fshi'); },
    onError: () => showToast('Gabim gjatë fshirjes', 'error'),
  });
  const toggleMut = useMutation({ mutationFn: toggleCategory, onSuccess: invalidate });

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (cat: Category) => { setEditing(cat); setModalOpen(true); };

  const handleSave = (data: Partial<Category>) => {
    if (editing) updateMut.mutate({ id: editing.id, data });
    else createMut.mutate(data);
  };

  const handleDelete = (cat: Category) => {
    if (confirm(`Fshi "${cat.name}"? Kjo do të fshijë gjithashtu të gjithë artikujt e saj.`)) {
      deleteMut.mutate(cat.id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a]" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            Kategoritë
          </h1>
          <p className="text-gray-500 text-sm mt-1">{categories?.length ?? 0} kategori gjithsej</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: '#006B3C' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Shto Kategori
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#006B3C] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: '#f8f8f8' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Emri</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Përshkrimi</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Renditja</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Statusi</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Veprimet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories?.map((cat) => (
                <tr key={cat.id} className="hover:bg-[#f8f8f8] transition-colors">
                  <td className="px-6 py-4 font-medium text-[#1a1a1a]">{cat.name}</td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate hidden md:table-cell">
                    {cat.description ?? <span className="text-gray-300 italic">—</span>}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-500">{cat.sortOrder}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleMut.mutate(cat.id)}
                      className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                      style={{
                        backgroundColor: cat.isActive ? 'rgba(0,107,60,0.1)' : 'rgba(0,0,0,0.06)',
                        color: cat.isActive ? '#006B3C' : '#9ca3af',
                      }}
                    >
                      {cat.isActive ? 'Aktive' : 'Joaktive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button
                      onClick={() => openEdit(cat)}
                      className="text-xs font-medium transition-colors"
                      style={{ color: '#006B3C' }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#004d2b')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#006B3C')}
                    >
                      Ndrysho
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="text-xs font-medium transition-colors"
                      style={{ color: '#CE2B37' }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#a01f29')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#CE2B37')}
                    >
                      Fshi
                    </button>
                  </td>
                </tr>
              ))}
              {categories?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-400 text-sm">
                    Asnjë kategori ende. Krijo të parën!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <CategoryModal
          initial={editing}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
