import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { RefreshCw, ClipboardList, MessageCircle } from 'lucide-react';

interface OrderRow {
  id: string; customer_name: string; phone_country: string; customer_phone: string;
  product_name: string; category: string | null; quantity: number; total_price: number;
  status: string; ff_player_id: string | null; ff_nickname: string | null; created_at: string;
}

export function AdminOrders() {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [exists, setExists] = useState(true);

  useEffect(() => { fetchRows(); }, []);

  async function fetchRows() {
    setLoading(true);
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(100);
    if (error) { setExists(false); setRows([]); } else { setExists(true); setRows((data as OrderRow[]) || []); }
    setLoading(false);
  }

  async function setStatus(id: string, status: string) {
    await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    fetchRows();
  }

  if (loading) return <div className="text-center py-16 text-gray-500">Cargando...</div>;

  if (!exists) {
    return (
      <div className="rounded-2xl border border-gold-500/10 bg-dark-800 p-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-2"><ClipboardList className="w-5 h-5 text-gold-400" /> Pedidos</h2>
        <p className="text-sm text-gray-400 max-w-2xl">
          El flujo actual no crea pedidos en base de datos: al pulsar "Pedir por WhatsApp" se guarda el cliente
          (nombre + número) y se abre WhatsApp con el pedido. Los clientes están en la sección <strong>Clientes</strong>.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2"><ClipboardList className="w-5 h-5 text-gold-400" /> Pedidos</h2>
        <button onClick={fetchRows} className="p-2 rounded-xl bg-dark-700 border border-gold-500/10 text-gold-400"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
      </div>
      {rows.length === 0 ? (
        <div className="text-center py-16 text-gray-500">Sin pedidos registrados todavía.</div>
      ) : (
        <div className="grid gap-2.5">
          {rows.map((o) => (
            <div key={o.id} className="p-4 rounded-xl border border-white/5 bg-dark-700/40">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-white">{o.product_name}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[11px] text-gray-400">
                    <span>{o.customer_name}</span>
                    <a href={`https://wa.me/${(o.phone_country + o.customer_phone).replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-400 flex items-center gap-1"><MessageCircle className="w-3 h-3" />{o.phone_country} {o.customer_phone}</a>
                    {o.ff_player_id && <span>ID: {o.ff_player_id} · {o.ff_nickname}</span>}
                    <span>×{o.quantity} · S/{Number(o.total_price).toFixed(2)}</span>
                    <span>{new Date(o.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className="px-3 py-1.5 rounded-lg bg-dark-700 border border-gold-500/10 text-white text-xs">
                  <option value="pending">Pendiente</option><option value="paid">Pagado</option><option value="delivered">Entregado</option><option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
