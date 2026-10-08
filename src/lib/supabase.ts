import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  price_usd: number | null;
  original_price: number | null;
  discount: number;
  image: string | null;
  gallery: string[];
  category: string;
  category_ids?: string[];
  badge: string | null;
  details: string | null;
  warranty: string | null;
  status: 'disponible' | 'agotado';
  is_active: boolean;
  is_published: boolean;
  is_featured: boolean;
  featured_order: number;
  sort_order: number;
  service_name: string | null;
  duration: string | null;
  display_order: number;
  min_quantity: number;
  max_quantity: number | null;
  allow_manual_quantity: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  keywords: string;
  sort_order: number;
  is_active: boolean;
  is_visible: boolean;
  is_free_fire: boolean;
}

export interface AppConfig {
  exchange_rate: number;
  whatsapp_number: string;
  delivery_text: string;
}

// Límites de cantidad efectivos de un producto, listos para usar en la UI.
export function getQuantityBounds(product: {
  min_quantity?: number | null;
  max_quantity?: number | null;
  allow_manual_quantity?: boolean | null;
}): { min: number; max: number; allowManual: boolean } {
  const min = Math.max(1, Math.floor(product.min_quantity ?? 1));
  const allowManual = product.allow_manual_quantity ?? false;
  const rawMax = product.max_quantity ?? null;
  const fallbackMax = allowManual ? Number.MAX_SAFE_INTEGER : 99;
  const max = rawMax != null ? Math.max(min, Math.floor(rawMax)) : fallbackMax;
  return { min, max, allowManual };
}

export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  comment: string;
  image_url: string | null;
  watermark: string;
  is_published: boolean;
  sort_order: number;
  created_at: string;
}

export interface PromoBanner {
  id: string;
  message: string;
  cta_label: string | null;
  cta_link: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const CATEGORIES = [
  { id: 'diamantes', name: 'Diamantes FF', icon: 'Diamond' },
  { id: 'streaming', name: 'Streaming', icon: 'Tv' },
  { id: 'metodos', name: 'Métodos', icon: 'BookOpen' },
  { id: 'cursos', name: 'Cursos', icon: 'GraduationCap' },
  { id: 'otros', name: 'Otros', icon: 'Package' },
  { id: 'ia', name: 'IA y Software', icon: 'Brain' },
  { id: 'vpn', name: 'VPN', icon: 'Shield' },
  { id: 'cuentas', name: 'Cuentas', icon: 'UserCheck' },
  { id: 'vk', name: 'VK / SuperGrok', icon: 'Zap' },
] as const;

export const PAGE_CATEGORIES = [
  { id: 'diamantes', name: 'Diamantes Free Fire', icon: 'Diamond', page: 'diamantes', desc: 'Recargas de diamantes al instante' },
  { id: 'cuentas', name: 'Cuentas Free Fire', icon: 'UserCheck', page: 'cuentas', desc: 'Cuentas de Free Fire verificadas' },
  { id: 'streaming', name: 'Streaming', icon: 'Tv', page: 'streaming', desc: 'Netflix, Spotify, Disney+, HBO y más' },
  { id: 'ia', name: 'IA y herramientas', icon: 'Brain', page: 'ia', desc: 'ChatGPT, Canva Pro y software premium' },
  { id: 'vpn', name: 'VPN y licencias', icon: 'Shield', page: 'vpn', desc: 'VPN y licencias originales' },
  { id: 'metodos', name: 'Métodos', icon: 'BookOpen', page: 'metodos', desc: 'Métodos exclusivos y actualizados' },
  { id: 'cursos', name: 'Cursos', icon: 'GraduationCap', page: 'cursos', desc: 'Cursos premium y educativos' },
  { id: 'otros', name: 'Otros', icon: 'Package', page: 'otros', desc: 'Más productos digitales' },
] as const;

// Categorías sin página propia: se muestran dentro de "Otros".
export const HIDDEN_CATEGORY_IDS = ['vk'] as const;

export function getCategoryForPage(page: string): string | null {
  const cat = PAGE_CATEGORIES.find((c) => c.page === page);
  return cat ? cat.id : null;
}

export const CATEGORY_META: Record<string, { label: string; slogan: string; badge: string; benefits: string[] }> = {
  diamantes: {
    label: 'Diamantes FF',
    slogan: 'Recargas rápidas, seguridad y acceso premium para tus partidas.',
    badge: 'FF Elite',
    benefits: ['Entrega instantánea', 'Atención expert a', 'Soporte 24/7'],
  },
  cuentas: {
    label: 'Cuentas FF',
    slogan: 'Accede a cuentas verificadas con un proceso claro y seguro.',
    badge: 'Cuenta premium',
    benefits: ['Verificación', 'Asesoría', 'Entrega clara'],
  },
  streaming: {
    label: 'Streaming',
    slogan: 'Disfruta contenido premium con acceso sin complicaciones.',
    badge: 'Premium+',
    benefits: ['Cuenta activa', 'Soporte rápido', 'Múltiples servicios'],
  },
  ia: {
    label: 'IA y software',
    slogan: 'Herramientas inteligentes para trabajo, creatividad y productividad.',
    badge: 'Tech stack',
    benefits: ['Licencias', 'Rendimiento', 'Soporte'],
  },
  vpn: {
    label: 'VPN y licencias',
    slogan: 'Privacidad y acceso confiable para tu día a día digital.',
    badge: 'Secure',
    benefits: ['Privacidad', 'Velocidad', 'Confianza'],
  },
  metodos: {
    label: 'Métodos',
    slogan: 'Soluciones especializadas y activaciones con seguimiento claro.',
    badge: 'Método vivo',
    benefits: ['Actualizado', 'Verificado', 'Guía paso a paso'],
  },
  cursos: {
    label: 'Cursos',
    slogan: 'Aprendizaje premium con contenidos enfocados en resultados reales.',
    badge: 'Academia',
    benefits: ['Acceso rápido', 'Contenido útil', 'Soporte'],
  },
  otros: {
    label: 'Otros',
    slogan: 'Más soluciones digitales y experiencias premium dentro de OFELIRIRAFAEL.',
    badge: 'Extras',
    benefits: ['Más opciones', 'Atención flexible', 'Validado'],
  },
};

export function getCategoryMeta(page: string): typeof CATEGORY_META[keyof typeof CATEGORY_META] {
  const categoryId = getCategoryForPage(page) ?? page;
  return CATEGORY_META[categoryId] ?? CATEGORY_META.otros;
}

// Modalidad legible según la categoría del producto.
const MODALITY_BY_CATEGORY: Record<string, string> = {
  diamantes: 'Recarga',
  cuentas: 'Cuenta completa',
  streaming: 'Perfil / Cuenta',
  ia: 'Licencia',
  vpn: 'Licencia',
  metodos: 'Activación',
  cursos: 'Acceso',
};

export function getModality(product: { category: string }): string | null {
  return MODALITY_BY_CATEGORY[product.category] || null;
}

export const EXCHANGE_RATE = 3.45;

export function priceToUsd(price: number, exchangeRate = EXCHANGE_RATE): number {
  return Number((price / (exchangeRate > 0 ? exchangeRate : EXCHANGE_RATE)).toFixed(2));
}

export async function getStoreConfig(): Promise<AppConfig> {
  const fallback: AppConfig = { exchange_rate: EXCHANGE_RATE, whatsapp_number: '51943592821', delivery_text: 'Entrega aproximada de 5 a 30 minutos' };
  const { data } = await supabase.from('app_config').select('exchange_rate, whatsapp_number, delivery_text').eq('id', 1).maybeSingle();
  return data ? { ...fallback, ...data, exchange_rate: Number(data.exchange_rate) || fallback.exchange_rate } : fallback;
}

export async function getStoreCategories(): Promise<StoreCategory[]> {
  const { data } = await supabase.from('categories').select('*').eq('is_active', true).eq('is_visible', true).order('sort_order', { ascending: true });
  return (data as StoreCategory[] | null) || [];
}

export function calcDiscount(price: number, originalPrice: number | null): number {
  if (!originalPrice || originalPrice <= 0 || price <= 0) return 0;
  return Math.round((1 - price / originalPrice) * 100);
}
