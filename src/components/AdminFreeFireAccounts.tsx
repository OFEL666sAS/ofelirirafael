import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Pencil, Trash2, Save, X, RefreshCw, Gamepad2, CheckCircle } from 'lucide-react';

interface FfAccount {
  id: string; title: string; status: 'available' | 'sold' | 'reserved';
  cost: number; sale_price: number | null; email: string | null; phone: string | null;
  links: string | null; notes: string | null; sold_at: string | null; created_at: string;
}

interface AccountForm {
  title: string; status: 'available' | 'sold' | 'reserved';
  cost: string; sale_price: string; email: string; phone: string; links: string; notes: string;
}

const emptyAccount: AccountForm = { title: '', status: 'available', cost: '', sale_price: '', email: '', phone: '', links: '', notes: '' };

export function AdminFreeFireAccounts() {
  const [rows, setRows] = useState<FfAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'available' | 'sold'>('available');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<AccountForm>(emptyAccount);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchRows(); }, []);

  async function fetchRows() {
    setLoading(true); setError(null);
    const { data, error: err } = await supabase.from('free_fire_accounts').select('*').order('created_at', { ascending: false });
    if (err) setError('No se pudo cargar. Aplica la migración de cuentas en Supabase.');
    else setRows((data as FfAccount[]) || []);
    setLoading(false);
  }

  const filtered = rows.filter((r) => tab === 'available' ? r.status !== 'sold' : r.status === 'sold');
  const profit = (r: FfAccount) => (r.sale_price ?? 0) - (r.cost ?? 0);

  function openNew() { setForm(emptyAccount); setEditing(null); setShowForm(true); }
  function openEdit(r: FfAccount) {
    setForm({ title: r.title, status: r.status, cost: String(r.cost || ''), sale_price: r.sale_price != null ? String(r.sale_price) : '', email: r.email || '', phone: r.phone || '', links: r.links || '', notes: r.notes || '' });
    setEditing(r.id); setShowForm(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    const payload = {
      title: form.title.trim(), status: form.status,
      cost: parseFloat(form.cost) || 0, sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
      email: form.email || null, phone: form.phone || null, links: form.links || null, notes: form.notes || null,
      sold_at: form.status === 'sold' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };
    const result = editing
      ? await supabase.from('free_fire_accounts').update(payload).eq('id', editing)
      : await supabase.from('free_fire_accounts').insert(payload);
    setSaving(false);
    if (result.error) { alert('Error: ' + result.error.message); return; }
    setShowForm(false); setEditing(null); fetchRows();
  }

  async function handleDelete(id: string) {
    if (!confirm('Eliminar esta cuenta?')) return;
    await supabase.from('free_fire_accounts').delete().eq('id', id);
    fetchRows();
  }

  async function markSold(r: FfAccount) {
    await supabase.from('free_fire_accounts').update({ status: 'sold', sold_at: new Date().toISOString() }).eq('id', r.id);
    fetchRows();
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2"><Gamepad2 className="w-5 h-5 text-gold-400" /> Cuentas Free Fire</h2>
          <p className="text-xs text-gray-500 mt-0.5">Datos internos (costo, correo, número, vinculaciones, ganancia). Nunca se muestran al público.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-dark-800 rounded-lg p-0.5 border border-gold-500/10">
            <button onClick={() => setTab('available')} className={`px-3 py-1.5 rounded-md text-xs font-medium ${tab === 'available' ? 'bg-gold-500/20 text-gold-400' : 'text-gray-400'}`}>Disponibles</button>
            <button onClick={() => setTab('sold')} className={`px-3 py-1.5 rounded-md text-xs font-medium ${tab === 'sold' ? 'bg-gold-500/20 text-gold-400' : 'text-gray-400'}`}>Vendidas</button>
          </div>
          <button onClick={fetchRows} className="p-2 rounded-xl bg-dark-700 border border-gold-500/10 text-gold-400"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-xl btn-gold text-sm font-semibold"><Plus className="w-4 h-4" /> Agregar Cuenta</button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Cargando...</div>
      ) : error ? (
        <div className="text-center py-16"><p className="text-red-400 mb-2">{error}</p><p className="text-xs text-gray-600">Archivo: supabase/migrations/20261007120000_add_admin_catalog_and_storefront.sql</p></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">{tab === 'available' ? 'No hay cuentas disponibles.' : 'No hay cuentas vendidas.'}</div>
      ) : (
        <div className="grid gap-2.5">
          {filtered.map((r) => (
            <div key={r.id} className="p-4 rounded-xl border border-white/5 bg-dark-700/40">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-white">{r.title}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-[11px] text-gray-400">
                    {r.email && <span>Correo: {r.email}</span>}
                    {r.phone && <span>Número: {r.phone}</span>}
                    {r.links && <span>Vinculaciones: {r.links}</span>}
                  </div>
                  <div className="flex gap-4 mt-2 text-[11px]">
                    <span className="text-gray-500">Costo: S/{Number(r.cost).toFixed(2)}</span>
                    {r.sale_price != null && <span className="text-gold-400">Venta: S/{Number(r.sale_price).toFixed(2)}</span>}
                    <span className={profit(r) >= 0 ? 'text-green-400' : 'text-red-400'}>Ganancia: S/{profit(r).toFixed(2)}</span>
                  </div>
                  {r.notes && <p className="text-[11px] text-gray-600 mt-1.5">{r.notes}</p>}
                </div>
                <div className="flex items-center gap-1">
                  {r.status !== 'sold' && (
                    <button onClick={() => markSold(r)} className="p-2 rounded-lg text-green-400 hover:bg-green-500/10" title="Marcar vendida"><CheckCircle className="w-4 h-4" /></button>
                  )}
                  <button onClick={() => openEdit(r)} className="p-2 rounded-lg hover:bg-gold-500/10 text-gold-400"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(r.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-dark-800 rounded-2xl border border-gold-500/10 p-5 sm:p-6 mb-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">{editing ? 'Editar cuenta' : 'Agregar cuenta'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-dark-600"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-xs font-medium text-gray-400 mb-1.5">Título *</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ej: Cuenta Lvl 65 - Sakura" className="input-field" /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs font-medium text-gray-400 mb-1.5">Estado</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AccountForm['status'] })} className="input-field">
                    <option value="available">Disponible</option><option value="reserved">Reservada</option><option value="sold">Vendida</option>
                  </select>
                </div>
                <div><label className="block text-xs font-medium text-gray-400 mb-1.5">Costo S/</label><input type="number" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} className="input-field" /></div>
                <div><label className="block text-xs font-medium text-gray-400 mb-1.5">Precio venta S/</label><input type="number" step="0.01" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} className="input-field" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-400 mb-1.5">Correo</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" /></div>
                <div><label className="block text-xs font-medium text-gray-400 mb-1.5">Número</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" /></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-400 mb-1.5">Vinculaciones</label><input value={form.links} onChange={(e) => setForm({ ...form, links: e.target.value })} placeholder="FB, Google, VK..." className="input-field" /></div>
              <div><label className="block text-xs font-medium text-gray-400 mb-1.5">Notas internas</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="input-field resize-none" /></div>
              <button onClick={handleSave} disabled={saving || !form.title.trim()} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl btn-gold text-sm disabled:opacity-50">
                <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
