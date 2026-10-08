import { useState, useEffect } from 'react';
import { Menu, X, Search } from 'lucide-react';
import type { Product } from '../lib/supabase';
import { PAGE_CATEGORIES } from '../lib/supabase';
import { SearchOverlay } from './SearchOverlay';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onViewProduct: (product: Product) => void;
}

const NAV_LINKS = [
  { page: 'catalogo', label: 'Catálogo' },
  { page: 'diamantes', label: 'Diamantes FF' },
  { page: 'cuentas', label: 'Cuentas FF' },
  { page: 'streaming', label: 'Streaming' },
  { page: 'otros', label: 'Otros' },
  { page: 'referencias', label: 'Referencias' },
  { page: 'ayuda', label: 'Ayuda' },
];

export function Header({ currentPage, onNavigate, onViewProduct }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleNav(page: string) {
    onNavigate(page);
    setMenuOpen(false);
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-lg shadow-black/40' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          <button
            onClick={() => handleNav('inicio')}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(201,162,39,0.5)] transition-shadow bg-dark-900">
              <img src="/ofel-logo.webp" alt="OFELIRIRAFAEL" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-gaming font-bold text-xs sm:text-sm tracking-[0.2em] text-white">
                OFELIRIRAFAEL
              </span>
              <span className="text-[8px] sm:text-[9px] text-gray-500 tracking-wide hidden sm:block">
                Streaming · Cuentas FF · Diamantes · Métodos y más
              </span>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <button
                key={link.page}
                onClick={() => handleNav(link.page)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  currentPage === link.page
                    ? 'nav-link-active'
                    : 'text-gray-300 hover:text-gold-400 hover:bg-white/5'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg text-gray-300 hover:text-gold-400 hover:bg-white/5 transition-colors"
              aria-label="Buscar productos"
            >
              <Search className="w-5 h-5" />
            </button>
            <a
              href="https://wa.me/51943592821"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg btn-gold-outline text-sm"
            >
              WhatsApp
            </a>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Menú"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden glass border-t border-gold-500/10 animate-slide-up max-h-[75vh] overflow-y-auto">
          <div className="px-4 py-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => handleNav('catalogo')}
              className={`px-4 py-3 text-sm font-medium rounded-lg text-left transition-all ${
                currentPage === 'catalogo' ? 'nav-link-active' : 'text-gray-300 hover:text-gold-400 hover:bg-white/5'
              }`}
            >
              Catálogo
            </button>
            {PAGE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleNav(cat.page)}
                className={`px-4 py-3 text-sm font-medium rounded-lg text-left transition-all ${
                  currentPage === cat.page ? 'nav-link-active' : 'text-gray-300 hover:text-gold-400 hover:bg-white/5'
                }`}
              >
                {cat.name}
              </button>
            ))}
            <button
              onClick={() => handleNav('referencias')}
              className={`px-4 py-3 text-sm font-medium rounded-lg text-left transition-all ${
                currentPage === 'referencias' ? 'nav-link-active' : 'text-gray-300 hover:text-gold-400 hover:bg-white/5'
              }`}
            >
              Referencias
            </button>
            <button
              onClick={() => handleNav('ayuda')}
              className={`px-4 py-3 text-sm font-medium rounded-lg text-left transition-all ${
                currentPage === 'ayuda' ? 'nav-link-active' : 'text-gray-300 hover:text-gold-400 hover:bg-white/5'
              }`}
            >
              Ayuda
            </button>
            <a
              href="https://wa.me/51943592821"
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-2 px-4 py-3 rounded-lg btn-gold-outline text-sm text-center"
            >
              Comprar por WhatsApp
            </a>
          </div>
        </div>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} onViewProduct={onViewProduct} onNavigate={onNavigate} />
    </header>
  );
}
