import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { HomePage } from './components/HomePage';
import { CatalogPage } from './components/CatalogPage';
import { CatalogoPage } from './components/CatalogoPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CheckoutPage } from './components/CheckoutPage';
import { ReferenciasPage } from './components/ReferenciasPage';
import { AyudaPage } from './components/AyudaPage';
import { TermsAndConditions } from './components/TermsAndConditions';
import { useRouter } from './lib/router';
import { supabase, type Product, getCategoryForPage } from './lib/supabase';
import { trackEvent } from './lib/api';

const AdminPanel = lazy(() => import('./components/AdminPanel').then((m) => ({ default: m.AdminPanel })));
const AdminLogin = lazy(() => import('./components/AdminLogin').then((m) => ({ default: m.AdminLogin })));

const CATALOG_PAGES = ['streaming', 'diamantes', 'cuentas', 'ia', 'vpn', 'metodos', 'cursos', 'otros', 'fragmentos', 'aplicaciones', 'vk'];
const RESERVED_PAGES = new Set(['inicio', 'admin', 'terminos', 'referencias', 'ayuda', 'catalogo', 'producto', 'checkout']);

function AdminFallback() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
    </div>
  );
}

function App() {
  const { route, navigate } = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const lastTracked = useRef('');
  const lastProductTracked = useRef('');

  useEffect(() => {
    if (route.page === 'admin') return; // never count admin traffic
    const key = `${route.page}:${route.productId || ''}:${route.checkout?.productId || ''}`;
    if (lastTracked.current === key) return;
    lastTracked.current = key;
    const path = window.location.hash || '#/';
    trackEvent({ event_type: 'pageview', path });
    if (CATALOG_PAGES.includes(route.page)) {
      const cat = getCategoryForPage(route.page);
      if (cat) trackEvent({ event_type: 'category_view', path, category: cat });
    }
  }, [route.page, route.productId, route.checkout?.productId]);

  useEffect(() => {
    if (route.page === 'producto' && selectedProduct && selectedProduct.id === route.productId) {
      if (lastProductTracked.current !== selectedProduct.id) {
        lastProductTracked.current = selectedProduct.id;
        trackEvent({
          event_type: 'product_view',
          path: window.location.hash || '#/',
          product_id: selectedProduct.id,
          category: selectedProduct.category,
        });
      }
    }
  }, [route.page, route.productId, selectedProduct]);

  useEffect(() => {
    if (route.page === 'admin') {
      setCheckingAuth(true);
      supabase.auth.getSession().then(({ data: { session } }) => {
        setAdminAuthed(!!session);
        setCheckingAuth(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setAdminAuthed(!!session);
      });
      return () => subscription.unsubscribe();
    }
  }, [route.page]);

  useEffect(() => {
    if (route.page === 'producto' && route.productId) {
      if (!selectedProduct || selectedProduct.id !== route.productId) {
        setProductLoading(true);
        supabase
          .from('products')
          .select('*')
          .eq('id', route.productId)
          .single()
          .then(({ data }) => {
            if (data) setSelectedProduct(data as Product);
            setProductLoading(false);
          });
      }
    }
  }, [route.page, route.productId, selectedProduct]);

  function handleNavigate(page: string) {
    navigate(page);
  }

  function handleViewProduct(product: Product) {
    setSelectedProduct(product);
    navigate('producto', product.id);
  }

  function handleCheckout(productId: string, step: string) {
    navigate('checkout', productId, step);
  }

  function handleBackToStore() {
    navigate('inicio');
  }

  const currentPage = route.page;

  // Admin routes
  if (route.page === 'admin') {
    if (checkingAuth) return <AdminFallback />;
    if (!adminAuthed) {
      return (
        <Suspense fallback={<AdminFallback />}>
          <AdminLogin onSuccess={() => setAdminAuthed(true)} />
        </Suspense>
      );
    }
    return (
      <Suspense fallback={<AdminFallback />}>
        <AdminPanel onBack={handleBackToStore} />
      </Suspense>
    );
  }

  // Terms
  if (route.page === 'terminos') {
    return (
      <div className="min-h-screen bg-dark-900">
        <Header currentPage={currentPage} onNavigate={handleNavigate} onViewProduct={handleViewProduct} />
        <TermsAndConditions onBack={handleBackToStore} />
        <Footer onNavigate={handleNavigate} />
      </div>
    );
  }

  // Catálogo general (todas las categorías)
  if (currentPage === 'catalogo') {
    return (
      <div className="min-h-screen bg-dark-900">
        <Header currentPage={currentPage} onNavigate={handleNavigate} onViewProduct={handleViewProduct} />
        <CatalogoPage onNavigate={handleNavigate} onViewProduct={handleViewProduct} />
        <Footer onNavigate={handleNavigate} />
        <WhatsAppButton />
      </div>
    );
  }

  // Catalog pages (slugs conocidos o categorías administrables)
  if (CATALOG_PAGES.includes(currentPage) || (!RESERVED_PAGES.has(currentPage) && currentPage !== 'inicio' && currentPage !== 'producto' && currentPage !== 'checkout' && currentPage !== 'admin' && currentPage !== 'terminos' && currentPage !== 'referencias' && currentPage !== 'ayuda')) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Header currentPage={currentPage} onNavigate={handleNavigate} onViewProduct={handleViewProduct} />
        <CatalogPage page={currentPage} onViewProduct={handleViewProduct} onNavigate={handleNavigate} />
        <Footer onNavigate={handleNavigate} />
        <WhatsAppButton />
      </div>
    );
  }

  // Product detail
  if (currentPage === 'producto' && route.productId) {
    if (productLoading || !selectedProduct) {
      return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
        </div>
      );
    }

    const productCategoryPage = selectedProduct.category || 'otros';

    return (
      <div className="min-h-screen bg-dark-900">
        <Header currentPage={productCategoryPage} onNavigate={handleNavigate} onViewProduct={handleViewProduct} />
        <ProductDetailPage
          product={selectedProduct}
          onBack={() => navigate(productCategoryPage)}
          onContinue={(p) => handleCheckout(p.id, 'datos')}
          onViewProduct={handleViewProduct}
        />
        <Footer onNavigate={handleNavigate} />
      </div>
    );
  }

  // Checkout
  if (currentPage === 'checkout' && route.checkout) {
    const { productId } = route.checkout;
    if (!selectedProduct || selectedProduct.id !== productId) {
      return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-dark-900">
        <Header currentPage="inicio" onNavigate={handleNavigate} onViewProduct={handleViewProduct} />
        <CheckoutPage
          product={selectedProduct}
          onBack={() => navigate('producto', productId)}
        />
        <Footer onNavigate={handleNavigate} />
      </div>
    );
  }

  // Referencias
  if (currentPage === 'referencias') {
    return (
      <div className="min-h-screen bg-dark-900">
        <Header currentPage={currentPage} onNavigate={handleNavigate} onViewProduct={handleViewProduct} />
        <ReferenciasPage onNavigate={handleNavigate} />
        <Footer onNavigate={handleNavigate} />
        <WhatsAppButton />
      </div>
    );
  }

  // Ayuda
  if (currentPage === 'ayuda') {
    return (
      <div className="min-h-screen bg-dark-900">
        <Header currentPage={currentPage} onNavigate={handleNavigate} onViewProduct={handleViewProduct} />
        <AyudaPage onNavigate={handleNavigate} />
        <Footer onNavigate={handleNavigate} />
        <WhatsAppButton />
      </div>
    );
  }

  // Inicio (default)
  return (
    <div className="min-h-screen bg-dark-900">
      <Header currentPage="inicio" onNavigate={handleNavigate} onViewProduct={handleViewProduct} />
      <HomePage onNavigate={handleNavigate} onViewProduct={handleViewProduct} />
      <Footer onNavigate={handleNavigate} />
      <WhatsAppButton />
    </div>
  );
}

export default App;
