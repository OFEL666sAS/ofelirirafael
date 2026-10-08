import { useEffect, useState } from 'react';
import { supabase, type Product } from '../lib/supabase';
import { Boxes, RefreshCw, Search, CheckCircle, XCircle } from 'lucide-react';

export function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => { fetchRows(); }, []);
  async function fetchRows() {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('sort_order');
    if (data) setProducts(data as Product[]);
    setLoading(false);
  }

  async function toggleStatus(p: Product) {
    const next = p.status === 'disponible' ? 'agotado' : 'disponible';
    await supabase.from('products').update({ status: next }).eq('id', p.id);
    setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, status: next as Product['status'] } : x));
  }

  const filtered = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
  const available = products.filter((p) => p.status === 'disponible').length;
  const soldOut = products.length - available;

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2"><Boxes className="w-5 h-5 text-gold-400" /> Inventario</h2>
          <p className="text-xs text-gray-500 mt-0.5">{available} disponibles · {soldOut} agotados</p>
        </div>
        <div className="flex gap-2">
          <div className="relative"><Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar producto" className="pl-9 pr-3 py-2 rounded-xl bg-dark-700 border border-gold-500/10 text-white text-sm w-48" /></div>
          <button onClick={fetchRows} className="p-2 rounded-xl bg-dark-700 border border-gold-500/10 text-gold-400"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
        </div>
      </div>
      {loading ? <div className="text-center py-16 text-gray-500">Cargando...</div> : (
        <div className="grid gap-2">
          {filtered.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-dark-700/40">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-dark-600 flex-shrink-0">{p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}</div>
              <div className="flex-1 min-w-0"><h3 className="text-sm font-semibold text-white truncate">{p.name}</h3><p className="text-[11px] text-gray-500">S/{Number(p.price).toFixed(2)} · {p.category} · min {p.min_quantity}{p.max_quantity ? ` / max ${p.max_quantity}` : ''}</p></div>
              <button onClick={() => toggleStatus(p)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${p.status === 'disponible' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {p.status === 'disponible' ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}{p.status === 'disponible' ? 'Disponible' : 'Agotado'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
