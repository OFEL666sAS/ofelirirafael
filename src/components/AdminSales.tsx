import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { TrendingUp, RefreshCw, ShoppingBag, Gamepad2 } from 'lucide-react';

interface OrderLite { id: string; total_price: number; status: string; created_at: string; }
interface FfSold { id: string; title: string; cost: number; sale_price: number | null; sold_at: string | null; }

export function AdminSales({ mode }: { mode: 'ventas' | 'ganancias' }) {
  const [orders, setOrders] = useState<OrderLite[]>([]);
  const [ffSold, setFfSold] = useState<FfSold[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersAvailable, setOrdersAvailable] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [o, f] = await Promise.all([
      supabase.from('orders').select('id, total_price, status, created_at').order('created_at', { ascending: false }).limit(200),
      supabase.from('free_fire_accounts').select('id, title, cost, sale_price, sold_at').eq('status', 'sold').order('sold_at', { ascending: false }),
    ]);
    setOrdersAvailable(!o.error);
    setOrders((o.data as OrderLite[] | null) || []);
    setFfSold((f.data as FfSold[] | null) || []);
    setLoading(false);
  }

  const confirmed = orders.filter((o) => o.status === 'paid' || o.status === 'delivered');
  const orderTotal = confirmed.reduce((s, o) => s + Number(o.total_price || 0), 0);
  const ffRevenue = ffSold.reduce((s, a) => s + Number(a.sale_price || 0), 0);
  const ffProfit = ffSold.reduce((s, a) => s + (Number(a.sale_price || 0) - Number(a.cost || 0)), 0);
  const revenue = orderTotal + ffRevenue;

  if (loading) return <div className="text-center py-16 text-gray-500">Cargando...</div>;

  const isProfits = mode === 'ganancias';
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2"><TrendingUp className="w-5 h-5 text-gold-400" /> {isProfits ? 'Ganancias' : 'Ventas'}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{isProfits ? 'Ganancia real calculada con costos internos de cuentas vendidas y pedidos confirmados.' : 'Ventas confirmadas: pedidos pagados/entregados + cuentas FF vendidas.'}</p>
        </div>
        <button onClick={load} className="p-2 rounded-xl bg-dark-700 border border-gold-500/10 text-gold-400"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-2xl bg-dark-800 border border-gold-500/10"><ShoppingBag className="w-4 h-4 text-gold-400 mb-2" /><p className="text-2xl font-black text-white">{confirmed.length + ffSold.length}</p><p className="text-xs text-gray-400 mt-1">Ventas confirmadas</p></div>
        <div className="p-4 rounded-2xl bg-dark-800 border border-gold-500/10"><TrendingUp className="w-4 h-4 text-gold-400 mb-2" /><p className="text-2xl font-black text-white">S/{revenue.toFixed(2)}</p><p className="text-xs text-gray-400 mt-1">Ingresos</p></div>
        <div className="p-4 rounded-2xl bg-dark-800 border border-gold-500/10"><Gamepad2 className="w-4 h-4 text-gold-400 mb-2" /><p className="text-2xl font-black text-white">{ffSold.length}</p><p className="text-xs text-gray-400 mt-1">Cuentas FF vendidas</p></div>
        <div className="p-4 rounded-2xl bg-dark-800 border border-gold-500/10"><TrendingUp className="w-4 h-4 text-green-400 mb-2" /><p className="text-2xl font-black text-green-400">S/{ffProfit.toFixed(2)}</p><p className="text-xs text-gray-400 mt-1">Ganancia cuentas FF</p></div>
      </div>

      {!ordersAvailable && <p className="text-xs text-amber-400 mb-3">La tabla orders existe pero el flujo actual no registra pedidos (solo guarda el cliente). Se muestran cuentas FF vendidas.</p>}

      {isProfits ? (
        <div className="grid gap-2">
          {ffSold.length === 0 ? <p className="text-center text-gray-500 py-12">Sin cuentas vendidas todavía.</p> : ffSold.map((a) => (
            <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-dark-700/40">
              <div className="flex-1 min-w-0"><h3 className="text-sm font-semibold text-white truncate">{a.title}</h3><p className="text-[11px] text-gray-500">{a.sold_at ? new Date(a.sold_at).toLocaleDateString('es-PE') : ''}</p></div>
              <div className="text-right text-xs"><p className="text-gray-400">Costo S/{Number(a.cost).toFixed(2)} → Venta S/{Number(a.sale_price || 0).toFixed(2)}</p><p className="font-bold text-green-400">+S/{(Number(a.sale_price || 0) - Number(a.cost || 0)).toFixed(2)}</p></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-2">
          {[...confirmed.map((o) => ({ id: o.id, label: `Pedido ${o.id.slice(0, 8)}`, amount: o.total_price, date: o.created_at, kind: 'pedido' })),
            ...ffSold.map((a) => ({ id: a.id, label: a.title, amount: a.sale_price || 0, date: a.sold_at || '', kind: 'cuenta FF' }))]
            .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
            .map((s) => (
              <div key={s.kind + s.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-dark-700/40">
                <span className="text-[10px] px-2 py-0.5 rounded bg-gold-500/10 text-gold-400 font-bold uppercase">{s.kind}</span>
                <div className="flex-1 min-w-0"><h3 className="text-sm font-semibold text-white truncate">{s.label}</h3><p className="text-[11px] text-gray-500">{s.date ? new Date(s.date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }) : '—'}</p></div>
                <p className="text-sm font-black text-white">S/{Number(s.amount).toFixed(2)}</p>
              </div>
            ))}
          {confirmed.length + ffSold.length === 0 && <p className="text-center text-gray-500 py-12">Sin ventas registradas todavía.</p>}
        </div>
      )}
    </div>
  );
}
