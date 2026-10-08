import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Search, Package, Sparkles } from 'lucide-react';
import { type Product, type StoreCategory, getStoreCategories, PAGE_CATEGORIES } from '../lib/supabase';
import { CategoryIcon } from './CategoryIcon';
import { SearchOverlay } from './SearchOverlay';

interface CatalogoPageProps { onNavigate: (page: string) => void; onViewProduct: (product: Product) => void; }

export function CatalogoPage({ onNavigate, onViewProduct }: CatalogoPageProps) {
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStoreCategories().then((rows) => { setCategories(rows); setLoading(false); });
  }, []);

  const visibleCategories = useMemo(() => categories.length ? categories : PAGE_CATEGORIES.map((cat, index) => ({
    id: cat.id, slug: cat.page, name: cat.name, description: cat.desc, icon: cat.icon, keywords: '', sort_order: index,
    is_active: true, is_visible: true, is_free_fire: cat.page === 'diamantes' || cat.page === 'cuentas',
  })), [categories]);

  return (
    <main className="catalog-screen page-transition">
      <div className="catalog-frame">
        <button onClick={() => onNavigate('inicio')} className="back-link"><ArrowLeft size={15} /> Volver al inicio</button>
        <div className="catalog-heading"><div><span className="catalog-eyebrow"><Sparkles size={13} /> OFEL / CATÁLOGO</span><h1>Elige tu categoría</h1><p>Entra a una sección para ver únicamente sus productos.</p></div><span className="catalog-count">{visibleCategories.length} secciones</span></div>
        <button onClick={() => setSearchOpen(true)} className="catalog-search"><Search size={17} /><span>Buscar productos o categorías...</span><kbd>⌘ K</kbd></button>
        {loading ? <div className="catalog-loading">Cargando categorías...</div> : <div className="category-grid">{visibleCategories.map((cat, index) => <button key={cat.slug} onClick={() => onNavigate(cat.slug)} className="category-tile" style={{ animationDelay: `${index * 65}ms` }}><span className="category-index">0{index + 1}</span><span className="category-icon"><CategoryIcon icon={cat.icon} className="w-6 h-6" /></span><span className="category-body"><strong>{cat.name}</strong><small>{cat.description}</small></span><ArrowRight className="category-arrow" size={18} /></button>)}</div>}
        <div className="catalog-help"><Package size={16} /><span>¿No encuentras algo?</span><a href="https://wa.me/51943592821" target="_blank" rel="noopener noreferrer">Consúltanos por WhatsApp</a></div>
      </div>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} onViewProduct={onViewProduct} onNavigate={onNavigate} />
    </main>
  );
}
