import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  SlidersHorizontal,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
} from 'lucide-react';
import {
  supabase,
  type Product,
  HIDDEN_CATEGORY_IDS,
  getCategoryForPage,
  getCategoryMeta,
  PAGE_CATEGORIES,
} from '../lib/supabase';
import { ProductCard } from './ProductCard';

interface CatalogPageProps {
  page: string;
  onViewProduct: (product: Product) => void;
  onNavigate: (page: string) => void;
}

const PRODUCTS_PER_PAGE_DESKTOP = 12;
const PRODUCTS_PER_PAGE_MOBILE = 6;

export function CatalogPage({ page, onViewProduct, onNavigate }: CatalogPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortFilter, setSortFilter] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);

  const categoryId = getCategoryForPage(page) ?? page;
  const [categoryRow, setCategoryRow] = useState<{ id: string; slug: string; name: string; description: string } | null>(null);
  const [linkedIds, setLinkedIds] = useState<string[] | null>(null);
  const categoryMeta = getCategoryMeta(page);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setCategoryRow(null);
      setLinkedIds(null);

      // Resolver la categoría por slug (administrable)
      const { data: catData } = await supabase
        .from('categories')
        .select('id, slug, name, description')
        .eq('slug', categoryId)
        .eq('is_active', true)
        .eq('is_visible', true)
        .maybeSingle();

      if (catData) {
        setCategoryRow(catData);
        // Productos vinculados por la tabla puente
        const { data: links } = await supabase
          .from('product_categories')
          .select('product_id')
          .eq('category_id', catData.id);
        setLinkedIds(links ? links.map((l: { product_id: string }) => l.product_id) : []);
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    }
    fetchProducts();
  }, [categoryId]);

  const categoryName = useMemo(() => {
    if (categoryRow) return categoryRow.name;
    if (HIDDEN_CATEGORY_IDS.includes(categoryId as typeof HIDDEN_CATEGORY_IDS[number])) {
      return 'Otros';
    }
    return categoryMeta.label || 'Catálogo';
  }, [categoryId, categoryMeta.label, categoryRow]);

  const categoryDescription = categoryRow?.description || categoryMeta.slogan;

  const filteredProducts = useMemo(() => {
    let result: Product[];
    if (linkedIds !== null) {
      // La categoría existe como tabla administrable: solo productos vinculados
      const ids = new Set(linkedIds);
      result = products.filter((p) => ids.has(p.id) || p.category === categoryId);
    } else if (categoryId === 'otros') {
      result = products.filter((p) => p.category === 'otros' || HIDDEN_CATEGORY_IDS.includes(p.category as typeof HIDDEN_CATEGORY_IDS[number]));
    } else {
      result = products.filter((p) => p.category === categoryId);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }

    if (sortFilter === 'price-low') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortFilter === 'price-high') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortFilter === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, categoryId, linkedIds, search, sortFilter]);

  const productsPerPage = typeof window !== 'undefined' && window.innerWidth < 768
    ? PRODUCTS_PER_PAGE_MOBILE
    : PRODUCTS_PER_PAGE_DESKTOP;

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
  const startIndex = (safeCurrentPage - 1) * productsPerPage;
  const visibleProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortFilter, page]);

  function handleViewProduct(product: Product) {
    onViewProduct(product);
  }

  function handlePageChange(newPage: number) {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const quickCategories = PAGE_CATEGORIES.filter((cat) => cat.page !== page && cat.page !== 'otros');

  return (
    <div className="page-transition pb-16 pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate('inicio')}
          className="mb-6 flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-gold-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </button>

        <div className="mb-8 overflow-hidden rounded-[28px] border border-gold-500/15 bg-[linear-gradient(135deg,rgba(201,162,39,0.12),rgba(15,15,15,0.96)_35%,rgba(26,24,18,0.92))] p-6 shadow-[0_25px_60px_rgba(201,162,39,0.08)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/10 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-gold-200">
                <Sparkles className="h-3.5 w-3.5" />
                {categoryMeta.badge}
              </div>

              <h1 className="mb-2 text-3xl font-black text-white sm:text-4xl lg:text-5xl">
                <span className="gradient-text-gold">{categoryName}</span>
              </h1>
              <p className="text-sm leading-relaxed text-gray-400">{categoryDescription}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {categoryMeta.benefits.map((benefit) => (
                  <span
                    key={benefit}
                    className="rounded-full border border-gold-500/15 bg-dark-950/40 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-gold-200"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center sm:min-w-[260px]">
              <div className="rounded-2xl border border-gold-500/10 bg-dark-950/40 px-3 py-2">
                <div className="text-lg font-black text-white">{filteredProducts.length}</div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-gray-500">Items</div>
              </div>
              <div className="rounded-2xl border border-gold-500/10 bg-dark-950/40 px-3 py-2">
                <div className="text-lg font-black text-gold-400">24/7</div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-gray-500">Soporte</div>
              </div>
              <div className="rounded-2xl border border-gold-500/10 bg-dark-950/40 px-3 py-2">
                <div className="text-lg font-black text-gold-400">VIP</div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-gray-500">Atención</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos..."
              className="input-field pl-11"
            />
          </div>

          <div className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <select
              value={sortFilter}
              onChange={(e) => setSortFilter(e.target.value)}
              className="input-field cursor-pointer pl-10 pr-8 appearance-none"
            >
              <option value="default">Destacados</option>
              <option value="price-low">Precio: menor a mayor</option>
              <option value="price-high">Precio: mayor a menor</option>
              <option value="name">Nombre: A-Z</option>
            </select>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          {quickCategories.slice(0, 6).map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigate(cat.page)}
              className="inline-flex items-center gap-2 rounded-full border border-gold-500/15 bg-dark-800 px-3 py-2 text-sm text-gray-300 transition-all hover:border-gold-500/30 hover:text-gold-300"
            >
              <span className="text-gold-400">•</span>
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gold-500/30 border-t-gold-500" />
            <p className="text-sm text-gray-500">Cargando productos...</p>
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="mb-2 text-lg text-gray-500">No se encontraron productos</p>
            <p className="text-sm text-gray-600">Intenta con otra búsqueda o categoría</p>
          </div>
        ) : (
          <>
            <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} onView={handleViewProduct} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(safeCurrentPage - 1)}
                  disabled={safeCurrentPage === 1}
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-all hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => {
                  if (
                    totalPages > 7 &&
                    num > 3 &&
                    num < totalPages - 1 &&
                    Math.abs(num - safeCurrentPage) > 1
                  ) {
                    if (num === 4 || num === totalPages - 2) {
                      return (
                        <span key={num} className="px-1 text-gray-600">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }
                  return (
                    <button
                      key={num}
                      onClick={() => handlePageChange(num)}
                      className={`h-9 w-9 rounded-lg text-sm font-semibold transition-all ${
                        safeCurrentPage === num
                          ? 'border border-gold-500/30 bg-gold-500/20 text-gold-400'
                          : 'text-gray-400 hover:bg-white/5 hover:text-gold-400'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(safeCurrentPage + 1)}
                  disabled={safeCurrentPage === totalPages}
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-all hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}

        <div className="mt-10 rounded-[24px] border border-gold-500/10 bg-dark-800 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-gold-300">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.18em]">Confianza</span>
              </div>
              <h3 className="text-2xl font-black text-white">Compra con seguridad y velocidad</h3>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/10 px-4 py-2 text-sm text-gold-300">
              <Zap className="h-4 w-4" />
              Entrega instantánea
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              'Asistencia directa por WhatsApp',
              'Entrega rápida y verificada',
              'Productos validados por categoría',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-gold-500/10 bg-dark-950/40 p-4 text-sm text-gray-300">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gold-500/20 bg-gold-500/10 text-gold-300">
                  <ArrowRight className="h-4 w-4" />
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
