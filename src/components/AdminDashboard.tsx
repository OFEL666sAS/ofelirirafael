import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, Package, Users, MessageSquare, Gamepad2, Eye, FolderTree } from 'lucide-react';

export function AdminDashboard({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [counts, setCounts] = useState({ products: 0, published: 0, customers: 0, testimonials: 0, categories: 0, ffAvailable: 0 });

  useEffect(() => {
    (async () => {
      const [p, c, t, cat, ff] = await Promise.all([
        supabase.from('products').select('id, is_published', { count: 'exact' }),
        supabase.from('customers').select('id', { count: 'exact', head: true }),
        supabase.from('testimonials').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('free_fire_accounts').select('id', { count: 'exact', head: true }).eq('status', 'available'),
      ]);
      const published = (p.data || []).filter((x: { is_published: boolean }) => x.is_published).length;
      setCounts({
        products: p.count ?? (p.data?.length || 0),
        published,
        customers: c.count ?? 0,
        testimonials: t.count ?? 0,
        categories: cat.error ? 0 : (cat.count ?? 0),
        ffAvailable: ff.error ? 0 : (ff.count ?? 0),
      });
    })();
  }, []);

  const cards = [
    { label: 'Productos', value: counts.products, sub: `${counts.published} publicados`, icon: Package, tab: 'productos' },
    { label: 'Categorías', value: counts.categories, sub: 'administrables', icon: FolderTree, tab: 'categorias' },
    { label: 'Clientes', value: counts.customers, sub: 'registrados', icon: Users, tab: 'clientes' },
    { label: 'Referencias', value: counts.testimonials, sub: 'testimonios', icon: MessageSquare, tab: 'referencias' },
    { label: 'Cuentas FF', value: counts.ffAvailable, sub: 'disponibles', icon: Gamepad2, tab: 'cuentas_ff' },
    { label: 'Estadísticas', value: '—', sub: 'ver analítica', icon: Eye, tab: 'estadisticas' },
  ];

  return (
    <div>
      <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1"><LayoutDashboard className="w-5 h-5 text-gold-400" /> Dashboard</h2>
      <p className="text-xs text-gray-500 mb-6">Resumen operativo de OFELIRIRAFAEL.</p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {cards.map(({ label, value, sub, icon: Icon, tab }) => (
          <button key={label} onClick={() => onNavigate(tab)} className="p-5 rounded-2xl bg-dark-800 border border-gold-500/10 text-left hover:border-gold-500/30 transition-colors">
            <Icon className="w-5 h-5 text-gold-400 mb-3" />
            <p className="text-3xl font-black text-white">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
            <p className="text-[10px] text-gray-600 mt-0.5">{sub}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
