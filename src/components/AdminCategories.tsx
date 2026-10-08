import { useEffect, useState } from 'react';
import { supabase, type StoreCategory } from '../lib/supabase';
import { Plus, Pencil, Trash2, Save, X, Eye, EyeOff, RefreshCw, FolderTree } from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

const ICON_OPTIONS = ['Package', 'Diamond', 'UserCheck', 'Sparkles', 'Tv', 'Brain', 'Shield', 'BookOpen', 'GraduationCap', 'MonitorSmartphone', 'Zap'];

interface CategoryForm {
  name: string; slug: string; description: string; icon: string; keywords: string;
  sort_order: string; is_active: boolean; is_visible: boolean; is_free_fire: boolean;
}

const emptyCategory: CategoryForm = {
  name: '', slug: '', description: '', icon: 'Package', keywords: '', sort_order: '0',
  is_active: true, is_visible: true, is_free_fire: false,
};

function slugify(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function AdminCategories() {
  const [rows, setRows] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyCategory);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCategories(); }, []);

  async function fetchCategories() {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
    if (data) setRows(data as StoreCategory[]);
    setLoading(false);
  }

  function openNew() { setForm(emptyCategory); setEditing(null); setShowForm(true); }

  function openEdit(c: StoreCategory) {
    setForm({
      name: c.name, slug: c.slug, description: c.description || '', icon: c.icon || 'Package',
      keywords: c.keywords || '', sort_order: String(c.sort_order), is_active: c.is_active,
      is_visible: c.is_visible, is_free_fire: c.is_free_fire,
    });
    setEditing(c.id); setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    const slug = form.slug.trim() || slugify(form.name);
    if (!slug) { alert('La categoría necesita un slug válido.'); return; }
    setSaving(true);
    const payload = {
      name: form.name.trim(), slug, description: form.description.trim(), icon: form.icon,
      keywords: form.keywords.trim(), sort_order: parseInt(form.sort_order) || 0,
      is_active: form.is_active, is_visible: form.is_visible, is_free_fire: form.is_free_fire,
      updated_at: new Date().toISOString(),
    };
    const result = editing
      ? await supabase.from('categories').update(payload).eq('id', editing)
      : await supabase.from('categories').insert(payload);
    setSaving(false);
    if (result.error) { alert('Error: ' + result.error.message); return; }
    setShowForm(false); setEditing(null); fetchCategories();
  }

  async function handleDelete(c: StoreCategory) {
    if (!confirm(`Eliminar "${c.name}"? Los productos asignados se quitarán de esta categoría.`)) return;
    const { error } = await supabase.from('categories').delete().eq('id', c.id);
    if (error) { alert('No se pudo eliminar: ' + error.message); return; }
    fetchCategories();
  }

  async function toggle(c: StoreCategory, field: 'is_active' | 'is_visible') {
    await supabase.from('categories').update({ [field]: !c[field] }).eq('id', c.id);
    fetchCategories();
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2"><FolderTree className="w-5 h-5 text-gold-400" /> Categorías</h2>
          <p className="text-xs text-gray-500 mt-0.5">Cada categoría activa y visible aparece como pantalla propia en el catálogo.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchCategories} className="p-2 rounded-xl bg-dark-700 border border-gold-500/10 text-gold-400 hover:bg-dark-600"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-xl btn-gold text-sm font-semibold"><Plus className="w-4 h-4" /> Nueva categoría</button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Cargando...</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No hay categorías. Crea la primera.</div>
      ) : (
        <div className="grid gap-2.5">
          {rows.map((c) => (
            <div key={c.id} className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border transition-all ${c.is_active && c.is_visible ? 'bg-dark-700/40 border-green-500/10' : 'bg-dark-800/40 border-white/5 opacity-70'}`}>
              <div className="w-11 h-11 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400 flex-shrink-0">
                <CategoryIcon icon={c.icon} className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white truncate">{c.name}</h3>
                  <span className="text-[10px] text-gray-500 font-mono">/{c.slug}</span>
                  {c.is_free_fire && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/15 text-red-400">FF</span>}
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">{c.description}</p>
                <div className="flex gap-2 mt-1 text-[10px]">
                  {c.is_visible ? <span className="text-green-400">VISIBLE</span> : <span className="text-gray-600">OCULTA</span>}
                  {c.is_active ? <span className="text-green-400">ACTIVA</span> : <span className="text-red-400">INACTIVA</span>}
                  <span className="text-gray-600">orden {c.sort_order}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggle(c, 'is_visible')} className="p-2 rounded-lg text-gray-400 hover:bg-gold-500/10 hover:text-gold-400" title={c.is_visible ? 'Ocultar' : 'Mostrar'}>
                  {c.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => toggle(c, 'is_active')} className={`p-2 rounded-lg ${c.is_active ? 'text-green-400 hover:bg-green-500/10' : 'text-red-400 hover:bg-red-500/10'}`} title={c.is_active ? 'Desactivar' : 'Activar'}>
                  {c.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-gold-500/10 text-gold-400"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(c)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-dark-800 rounded-2xl border border-gold-500/10 p-5 sm:p-6 mb-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">{editing ? 'Editar categoría' : 'Nueva categoría'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-dark-600"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Nombre *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })} placeholder="Ej: Fragmentos" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Slug (ruta)</label>
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} placeholder="fragmentos" className="input-field font-mono text-xs" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Descripción</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Texto corto bajo el nombre" className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Icono</label>
                  <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="input-field">
                    {ICON_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Orden</label>
                  <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Palabras clave (para el buscador)</label>
                <input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder="netflix, streaming, peru" className="input-field" />
              </div>
              <div className="flex gap-4 flex-wrap">
                {([['is_active', 'Activa'], ['is_visible', 'Visible en catálogo'], ['is_free_fire', 'Pide ID + apodo (Free Fire)']] as const).map(([field, label]) => (
                  <label key={field} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.checked })} className="w-4 h-4 rounded bg-dark-700 border-white/20" />
                    <span className="text-xs text-gray-300">{label}</span>
                  </label>
                ))}
              </div>
              <button onClick={handleSave} disabled={saving || !form.name.trim()} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl btn-gold text-sm disabled:opacity-50">
                <Save className="w-4 h-4" /> {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear categoría'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
