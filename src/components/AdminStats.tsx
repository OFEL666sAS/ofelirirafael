import { useEffect, useState, useCallback } from 'react';
import {
  Eye, Users, Radio, RefreshCw,
  TrendingUp, Package, Layers, Globe, Info,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Stats {
  analytics_start_date: string;
  visits_today: number;
  visits_7d: number;
  visits_30d: number;
  unique_today: number;
  unique_7d: number;
  unique_30d: number;
  active_now: number;
  pageviews_total: number;
  top_products: { product_id: string; name: string; views: number }[];
  top_categories: { category: string; views: number }[];
  sources: { source: string; visits: number }[];
  daily: { day: string; views: number; uniques: number }[];
  orders_total: number;
  orders_pending: number;
  orders_by_status: Record<string, number>;
  sales_confirmed_count: number;
  sales_confirmed_amount: number;
}

export function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publicEnabled, setPublicEnabled] = useState(false);
  const [savingToggle, setSavingToggle] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_admin_stats');
    if (error || !data) {
      setError('No se pudieron cargar las estadísticas.');
    } else {
      setStats(data as Stats);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    supabase.from('app_config').select('public_counter_enabled').eq('id', 1).maybeSingle()
      .then(({ data }) => { if (data) setPublicEnabled(data.public_counter_enabled); });
    const interval = setInterval(load, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [load]);

  async function togglePublicCounter() {
    setSavingToggle(true);
    const next = !publicEnabled;
    const { error } = await supabase.from('app_config').update({ public_counter_enabled: next, updated_at: new Date().toISOString() }).eq('id', 1);
    if (!error) setPublicEnabled(next);
    setSavingToggle(false);
  }

  if (loading) {
    return <div className="text-center py-16 text-gray-500">Cargando estadísticas...</div>;
  }
  if (error || !stats) {
    return (
      <div className="text-center py-16">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={load} className="px-4 py-2 rounded-lg bg-gold-500/20 text-gold-400 text-sm font-medium">Reintentar</button>
      </div>
    );
  }

  const startDate = new Date(stats.analytics_start_date).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
  const maxDaily = Math.max(1, ...stats.daily.map((d) => d.views));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Info className="w-3.5 h-3.5" />
          Contando desde el {startDate}
        </div>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-700 border border-gold-500/10 text-gray-400 text-xs hover:text-gold-400 transition-all">
          <RefreshCw className="w-3.5 h-3.5" /> Actualizar
        </button>
      </div>

      {/* Visitantes activos */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-500/5 border border-green-500/20">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
        </span>
        <Radio className="w-5 h-5 text-green-400" />
        <div>
          <p className="text-2xl font-black text-white leading-none">{stats.active_now}</p>
          <p className="text-xs text-gray-400 mt-1">Visitantes activos (últimos 5 min)</p>
        </div>
      </div>

      {/* Tarjetas de visitas */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard icon={Eye} color="text-gold-400" label="Visitas hoy" value={stats.visits_today} sub={`${stats.unique_today} únicos`} />
        <StatCard icon={Eye} color="text-gold-400" label="Visitas 7 días" value={stats.visits_7d} sub={`${stats.unique_7d} únicos`} />
        <StatCard icon={Eye} color="text-gold-400" label="Visitas 30 días" value={stats.visits_30d} sub={`${stats.unique_30d} únicos`} />
        <StatCard icon={Users} color="text-blue-400" label="Páginas vistas totales" value={stats.pageviews_total} />
      </div>

      {/* Gráfica por fecha */}
      <div className="p-5 rounded-2xl bg-dark-800 border border-gold-500/10">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-gold-400" />
          <h3 className="text-sm font-bold text-white">Visitas por día (últimos 30 días)</h3>
        </div>
        <div className="flex items-end gap-1 h-40">
          {stats.daily.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center justify-end group relative">
              <div
                className="w-full rounded-t bg-gradient-to-t from-gold-600/40 to-gold-400 transition-all hover:from-gold-500 hover:to-gold-300"
                style={{ height: `${Math.max(2, (d.views / maxDaily) * 100)}%` }}
              />
              <div className="absolute bottom-full mb-1 hidden group-hover:block whitespace-nowrap bg-dark-900 border border-gold-500/20 rounded px-2 py-1 text-[10px] text-white z-10">
                {new Date(d.day + 'T00:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}: {d.views} vistas, {d.uniques} únicos
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Listas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ListCard icon={Package} title="Productos más vistos" empty="Aún no hay vistas de productos.">
          {stats.top_products.map((p) => (
            <ListRow key={p.product_id} label={p.name} value={`${p.views}`} />
          ))}
        </ListCard>
        <ListCard icon={Layers} title="Categorías más vistas" empty="Aún no hay vistas de categorías.">
          {stats.top_categories.map((c) => (
            <ListRow key={c.category} label={c.category} value={`${c.views}`} capitalize />
          ))}
        </ListCard>
        <ListCard icon={Globe} title="Origen de las visitas" empty="Sin datos de origen todavía.">
          {stats.sources.map((s) => (
            <ListRow key={s.source} label={s.source} value={`${s.visits}`} />
          ))}
        </ListCard>
      </div>

      {/* Contador público */}
      <div className="p-5 rounded-2xl bg-dark-800 border border-gold-500/10 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-sm font-bold text-white mb-1">Contador público de visitas</h3>
          <p className="text-xs text-gray-500 max-w-md">
            Muestra únicamente un total agregado de visitas en la página pública. No expone datos de clientes. Desactivado por defecto.
          </p>
        </div>
        <button
          onClick={togglePublicCounter}
          disabled={savingToggle}
          className={`relative w-14 h-7 rounded-full transition-colors flex-shrink-0 ${publicEnabled ? 'bg-green-500' : 'bg-dark-600'} disabled:opacity-50`}
        >
          <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${publicEnabled ? 'translate-x-7' : ''}`} />
        </button>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, color, label, value, sub }: { icon: typeof Eye; color: string; label: string; value: number; sub?: string }) {
  return (
    <div className="p-4 rounded-2xl bg-dark-800 border border-gold-500/10">
      <Icon className={`w-4 h-4 ${color} mb-2`} />
      <p className="text-2xl font-black text-white leading-none">{value.toLocaleString('es-PE')}</p>
      <p className="text-xs text-gray-400 mt-1.5">{label}</p>
      {sub && <p className="text-[11px] text-gray-600 mt-0.5">{sub}</p>}
    </div>
  );
}

function ListCard({ icon: Icon, title, empty, children }: { icon: typeof Eye; title: string; empty: string; children: React.ReactNode }) {
  const items = Array.isArray(children) ? children : [children];
  const isEmpty = items.filter(Boolean).length === 0;
  return (
    <div className="p-5 rounded-2xl bg-dark-800 border border-gold-500/10">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-gold-400" />
        <h3 className="text-sm font-bold text-white">{title}</h3>
      </div>
      {isEmpty ? <p className="text-xs text-gray-600 py-4 text-center">{empty}</p> : <div className="space-y-1">{children}</div>}
    </div>
  );
}

function ListRow({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-white/5 last:border-0">
      <span className={`text-xs text-gray-300 truncate ${capitalize ? 'capitalize' : ''}`}>{label}</span>
      <span className="text-xs font-bold text-gold-400 flex-shrink-0">{value}</span>
    </div>
  );
}
