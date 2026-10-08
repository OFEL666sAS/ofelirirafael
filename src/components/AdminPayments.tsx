import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Save, RefreshCw, WalletCards, Eye, EyeOff } from 'lucide-react';

interface PaymentMethod { id: string; name: string; details: string; is_active: boolean; sort_order: number; }

export function AdminPayments() {
  const [rows, setRows] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [exists, setExists] = useState(true);
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');

  useEffect(() => { fetchRows(); }, []);
  async function fetchRows() {
    setLoading(true);
    const { data, error } = await supabase.from('payment_methods').select('*').order('sort_order');
    if (error) { setExists(false); } else { setExists(true); setRows((data as PaymentMethod[]) || []); }
    setLoading(false);
  }
  async function add() {
    if (!name.trim()) return;
    await supabase.from('payment_methods').insert({ name: name.trim(), details: details.trim(), sort_order: rows.length });
    setName(''); setDetails(''); fetchRows();
  }
  async function toggle(r: PaymentMethod) { await supabase.from('payment_methods').update({ is_active: !r.is_active }).eq('id', r.id); fetchRows(); }
  async function remove(id: string) { if (!confirm('Eliminar método?')) return; await supabase.from('payment_methods').delete().eq('id', id); fetchRows(); }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div><h2 className="text-lg font-bold text-white flex items-center gap-2"><WalletCards className="w-5 h-5 text-gold-400" /> Pagos</h2><p className="text-xs text-gray-500 mt-0.5">Métodos de pago que aceptas (Yape, Plin, transferencia, etc.).</p></div>
        <button onClick={fetchRows} className="p-2 rounded-xl bg-dark-700 border border-gold-500/10 text-gold-400"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
      </div>
      {!exists ? (
        <p className="text-sm text-gray-500 py-8 text-center">Aplica la migración nueva para activar esta sección.</p>
      ) : (
        <>
          <div className="flex gap-2 mb-5 flex-wrap">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre (Ej: Yape)" className="input-field !w-auto flex-1 min-w-[140px]" />
            <input value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Datos (número / titular)" className="input-field !w-auto flex-[2] min-w-[180px]" />
            <button onClick={add} disabled={!name.trim()} className="flex items-center gap-2 px-4 py-2 rounded-xl btn-gold text-sm font-semibold disabled:opacity-50"><Plus className="w-4 h-4" /> <Save className="w-0 h-0 hidden" />Agregar</button>
          </div>
          {rows.length === 0 ? <div className="text-center py-12 text-gray-500">Sin métodos de pago.</div> : (
            <div className="grid gap-2">
              {rows.map((r) => (
                <div key={r.id} className={`flex items-center gap-3 p-3 rounded-xl border ${r.is_active ? 'bg-dark-700/40 border-white/5' : 'bg-dark-800/40 border-white/5 opacity-60'}`}>
                  <div className="flex-1 min-w-0"><h3 className="text-sm font-semibold text-white">{r.name}</h3><p className="text-xs text-gray-500">{r.details}</p></div>
                  <button onClick={() => toggle(r)} className="p-2 rounded-lg text-gray-400 hover:text-gold-400">{r.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</button>
                  <button onClick={() => remove(r.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
