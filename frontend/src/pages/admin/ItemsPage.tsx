import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMenuItems, createMenuItem, updateMenuItem,
  deleteMenuItem, toggleMenuItem, uploadImage,
} from '../../api/menuItems';
import { getCategories } from '../../api/categories';
import { useToast } from '../../components/Toast';
import type { MenuItem, Category } from '../../types';

interface SectionProps {
  triggerAdd: boolean;
  onTriggerConsumed: () => void;
}

const INPUT_CLS =
  'w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#006B3C] focus:border-transparent transition-all';

function ItemModal({
  initial,
  categories,
  onSave,
  onClose,
}: {
  initial: MenuItem | null;
  categories: Category[];
  onSave: (data: Partial<MenuItem>) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(String(initial?.price ?? ''));
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? (categories[0]?.id ?? ''));
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '');
  const [imagePreview, setImagePreview] = useState(initial?.imageUrl ?? '');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      setImageUrl(url);
    } catch (err) {
      setImageUrl('');
      setImagePreview('');
      if (fileRef.current) fileRef.current.value = '';
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      showToast(message || 'Ngarkimi i imazhit dështoi', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      description: description || undefined,
      price: parseFloat(price),
      categoryId,
      sortOrder: Number(sortOrder),
      imageUrl: imageUrl || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 my-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#1a1a1a]" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            {initial ? 'Ndrysho Artikullin' : 'Shto Artikull të Ri'}
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
            <input value={name} onChange={(e) => setName(e.target.value)} className={INPUT_CLS} placeholder="p.sh. Bruschetta al Pomodoro" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Kategoria *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={INPUT_CLS}
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Çmimi (€) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={`${INPUT_CLS} pl-7`}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Përshkrimi</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`${INPUT_CLS} resize-none`}
              placeholder="Përshkrim i shkurtër i artikullit..."
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

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Imazhi</label>
            {imagePreview && (
              <img src={imagePreview} alt="preview" className="w-full h-40 object-cover rounded-lg mb-3 border border-gray-100" />
            )}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {uploading ? 'Duke ngarkuar...' : 'Zgjidh Imazh'}
              </button>
              <input type="file" ref={fileRef} accept="image/*" onChange={handleFileChange} className="hidden" />
              {imageUrl && !uploading && (
                <span className="text-xs font-medium" style={{ color: '#006B3C' }}>✓ Ngarkuar</span>
              )}
            </div>
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
              disabled={uploading}
              className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              style={{ backgroundColor: '#CE2B37' }}
            >
              {initial ? 'Ruaj Ndryshimet' : 'Krijo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ItemsSection({ triggerAdd, onTriggerConsumed }: SectionProps) {
  const qc = useQueryClient();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    if (triggerAdd) {
      setEditing(null);
      setModalOpen(true);
      onTriggerConsumed();
    }
  }, [triggerAdd, onTriggerConsumed]);

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const { data: items, isLoading } = useQuery({ queryKey: ['menu-items'], queryFn: () => getMenuItems() });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['menu-items'] });

  const createMut = useMutation({
    mutationFn: createMenuItem,
    onSuccess: () => { invalidate(); setModalOpen(false); showToast('Artikulli u krijua me sukses'); },
    onError: () => showToast('Gabim gjatë krijimit', 'error'),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MenuItem> }) => updateMenuItem(id, data),
    onSuccess: () => { invalidate(); setModalOpen(false); showToast('Artikulli u përditësua'); },
    onError: () => showToast('Gabim gjatë përditësimit', 'error'),
  });
  const deleteMut = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => { invalidate(); showToast('Artikulli u fshi'); },
    onError: () => showToast('Gabim gjatë fshirjes', 'error'),
  });
  const toggleMut = useMutation({ mutationFn: toggleMenuItem, onSuccess: invalidate });

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (item: MenuItem) => { setEditing(item); setModalOpen(true); };

  const handleSave = (data: Partial<MenuItem>) => {
    if (editing) updateMut.mutate({ id: editing.id, data });
    else createMut.mutate(data);
  };

  const filtered = filterCategory ? items?.filter((i) => i.categoryId === filterCategory) : items;
  const getCategoryName = (id: string) => categories?.find((c) => c.id === id)?.name ?? '—';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a]" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            Artikujt
          </h1>
          <p className="text-gray-500 text-sm mt-1">{filtered?.length ?? 0} artikuj</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: '#CE2B37' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Shto Artikull
        </button>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#006B3C] bg-white"
        >
          <option value="">Të gjitha kategoritë</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Artikulli</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Kategoria</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Çmimi</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Disponueshëm</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Veprimet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered?.map((item) => (
                <tr key={item.id} className="hover:bg-[#f8f8f8] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                          style={{ backgroundColor: 'rgba(0,107,60,0.08)' }}
                        >
                          🍽️
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-[#1a1a1a]">{item.name}</p>
                        {item.description && (
                          <p className="text-gray-400 text-xs truncate max-w-[200px]">{item.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 hidden md:table-cell">{getCategoryName(item.categoryId)}</td>
                  <td className="px-6 py-4 text-right font-semibold text-[#1a1a1a]">
                    €{Number(item.price).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleMut.mutate(item.id)}
                      className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                      style={{
                        backgroundColor: item.isAvailable ? 'rgba(0,107,60,0.1)' : 'rgba(206,43,55,0.1)',
                        color: item.isAvailable ? '#006B3C' : '#CE2B37',
                      }}
                    >
                      {item.isAvailable ? 'Po' : 'Jo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button
                      onClick={() => openEdit(item)}
                      className="text-xs font-medium transition-colors"
                      style={{ color: '#006B3C' }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#004d2b')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#006B3C')}
                    >
                      Ndrysho
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Fshi "${item.name}"?`)) deleteMut.mutate(item.id);
                      }}
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
              {filtered?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-400 text-sm">
                    Nuk u gjetën artikuj.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && categories && (
        <ItemModal
          initial={editing}
          categories={categories}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
