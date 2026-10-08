import { useState, useEffect } from 'react';
import { supabase, type PromoBanner } from '../lib/supabase';
import { Save, Trash2, Megaphone, Plus, Eye, EyeOff } from 'lucide-react';

interface BannerForm {
  message: string;
  cta_label: string;
  cta_link: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
}

const emptyForm: BannerForm = {
  message: '',
  cta_label: '',
  cta_link: '',
  starts_at: '',
  ends_at: '',
  is_active: true,
};

function toInputValue(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}

function toIso(value: string): string | null {
  if (!value) return null;
  return new Date(value).toISOString();
}

export function AdminBanner() {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<BannerForm>(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  async function fetchBanners() {
    setLoading(true);
    const { data } = await supabase
      .from('promo_banners')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setBanners(data as PromoBanner[]);
    setLoading(false);
  }

  useEffect(() => {
    fetchBanners();
  }, []);

  function openNew() {
    setForm(emptyForm);
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(b: PromoBanner) {
    setForm({
      message: b.message,
      cta_label: b.cta_label || '',
      cta_link: b.cta_link || '',
      starts_at: toInputValue(b.starts_at),
      ends_at: toInputValue(b.ends_at),
      is_active: b.is_active,
    });
    setEditing(b.id);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.message.trim()) return;
    setSaving(true);
    const payload = {
      message: form.message.trim(),
      cta_label: form.cta_label.trim() || null,
      cta_link: form.cta_link.trim() || null,
      starts_at: toIso(form.starts_at),
      ends_at: toIso(form.ends_at),
      is_active: form.is_active,
      updated_at: new Date().toISOString(),
    };
    if (editing) {
      await supabase.from('promo_banners').update(payload).eq('id', editing);
    } else {
      await supabase.from('promo_banners').insert(payload);
    }
    setSaving(false);
    setShowForm(false);
    setEditing(null);
    fetchBanners();
  }

  async function toggleActive(b: PromoBanner) {
    await supabase
      .from('promo_banners')
      .update({ is_active: !b.is_active, updated_at: new Date().toISOString() })
      .eq('id', b.id);
    fetchBanners();
  }

  async function handleDelete(id: string) {
    if (!confirm('Eliminar esta promoción?')) return;
    await supabase.from('promo_banners').delete().eq('id', id);
    fetchBanners();
  }

  function statusOf(b: PromoBanner): { label: string; color: string } {
    const now = Date.now();
    if (!b.is_active) return { label: 'INACTIVA', color: 'text-gray-500' };
    if (b.starts_at && new Date(b.starts_at).getTime() > now) return { label: 'PROGRAMADA', color: 'text-amber-400' };
    if (b.ends_at && new Date(b.ends_at).getTime() < now) return { label: 'EXPIRADA', color: 'text-red-400' };
    return { label: 'VIGENTE', color: 'text-green-400' };
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-500">Banner de promoción con fecha de inicio y fin. Solo se muestra al público mientras esté vigente.</p>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-xl btn-gold text-sm font-semibold">
          <Plus className="w-4 h-4" /> Nueva
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Cargando...</div>
      ) : banners.length === 0 ? (
        <div className="text-center py-16">
          <Megaphone className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No hay promociones.</p>
          <button onClick={openNew} className="px-6 py-3 rounded-xl bg-gold-500/20 text-gold-400 font-semibold border border-gold-500/30">
            Crear promoción
          </button>
        </div>
      ) : (
        <div className="grid gap-2.5">
          {banners.map((b) => {
            const st = statusOf(b);
            return (
              <div key={b.id} className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border bg-dark-700/40 border-white/5">
                <Megaphone className="w-5 h-5 text-gold-500/60 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{b.message}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-[10px] font-bold ${st.color}`}>{st.label}</span>
                    {b.starts_at && <span className="text-[10px] text-gray-500">Desde {new Date(b.starts_at).toLocaleString('es-PE')}</span>}
                    {b.ends_at && <span className="text-[10px] text-gray-500">Hasta {new Date(b.ends_at).toLocaleString('es-PE')}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleActive(b)}
                    className={`p-2 rounded-lg transition-colors ${b.is_active ? 'text-green-400 hover:bg-green-500/10' : 'text-gray-500 hover:bg-gray-500/10'}`}
                    title={b.is_active ? 'Desactivar' : 'Activar'}
                  >
                    {b.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => openEdit(b)} className="p-2 rounded-lg hover:bg-gold-500/10 text-gold-400 transition-colors">
                    <Save className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(b.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl bg-dark-800 rounded-2xl border border-gold-500/10 p-5 sm:p-6 mb-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">{editing ? 'Editar promoción' : 'Nueva promoción'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-dark-600 text-gray-400">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Mensaje *</label>
                <input
                  type="text"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Ej: 20% de descuento en diamantes este fin de semana"
                  className="w-full px-4 py-2.5 rounded-xl bg-dark-700 border border-gold-500/10 text-white text-sm focus:border-gold-500/50 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Texto del botón (opcional)</label>
                  <input
                    type="text"
                    value={form.cta_label}
                    onChange={(e) => setForm({ ...form, cta_label: e.target.value })}
                    placeholder="Ver ofertas"
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-700 border border-gold-500/10 text-white text-sm focus:border-gold-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Enlace del botón (opcional)</label>
                  <input
                    type="text"
                    value={form.cta_link}
                    onChange={(e) => setForm({ ...form, cta_link: e.target.value })}
                    placeholder="#/diamantes"
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-700 border border-gold-500/10 text-white text-sm focus:border-gold-500/50 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Inicio (opcional)</label>
                  <input
                    type="datetime-local"
                    value={form.starts_at}
                    onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold-500/10 text-white text-sm focus:border-gold-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Fin (opcional)</label>
                  <input
                    type="datetime-local"
                    value={form.ends_at}
                    onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold-500/10 text-white text-sm focus:border-gold-500/50 focus:outline-none"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 rounded bg-dark-700 border-white/20"
                />
                <span className="text-xs text-gray-300">Activa</span>
              </label>
              <button
                onClick={handleSave}
                disabled={saving || !form.message.trim()}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl btn-gold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear promoción'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
