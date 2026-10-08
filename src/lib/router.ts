import { useState, useEffect, useCallback } from 'react';

export type Route = {
  page: string;
  productId?: string;
  checkout?: { productId: string; step: string };
};

function parseHash(): Route {
  const hash = window.location.hash.slice(1) || '/';
  const parts = hash.split('/').filter(Boolean);

  if (parts.length === 0) return { page: 'inicio' };
  if (parts[0] === 'admin') return { page: 'admin' };
  if (parts[0] === 'terminos') return { page: 'terminos' };
  if (parts[0] === 'referencias') return { page: 'referencias' };
  if (parts[0] === 'ayuda') return { page: 'ayuda' };
  if (parts[0] === 'catalogo') return { page: 'catalogo' };
  if (parts[0] === 'streaming') return { page: 'streaming' };
  if (parts[0] === 'diamantes') return { page: 'diamantes' };
  if (parts[0] === 'cuentas') return { page: 'cuentas' };
  if (parts[0] === 'ia') return { page: 'ia' };
  if (parts[0] === 'vpn') return { page: 'vpn' };
  if (parts[0] === 'metodos') return { page: 'metodos' };
  if (parts[0] === 'cursos') return { page: 'cursos' };
  if (parts[0] === 'otros') return { page: 'otros' };
  if (parts[0] === 'producto' && parts[1]) return { page: 'producto', productId: parts[1] };
  if (parts[0] === 'checkout' && parts[1] && parts[2]) {
    return { page: 'checkout', checkout: { productId: parts[1], step: parts[2] } };
  }
  // Cualquier otro slug de una palabra puede ser una categoría administrable
  if (parts.length === 1 && /^[a-z0-9-]+$/.test(parts[0])) return { page: parts[0] };
  return { page: 'inicio' };
}

export function buildHash(page: string, productId?: string, step?: string): string {
  if (page === 'inicio') return '#/';
  if (page === 'producto' && productId) return `#/producto/${productId}`;
  if (page === 'checkout' && productId && step) return `#/checkout/${productId}/${step}`;
  return `#/${page}`;
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(parseHash());

  useEffect(() => {
    function handleHashChange() {
      setRoute(parseHash());
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useCallback((page: string, productId?: string, step?: string) => {
    window.location.hash = buildHash(page, productId, step);
  }, []);

  const back = useCallback(() => {
    window.history.back();
  }, []);

  return { route, navigate, back };
}
