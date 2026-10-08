import { supabase } from './supabase';

const FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const baseHeaders = {
  Authorization: `Bearer ${ANON_KEY}`,
  'Content-Type': 'application/json',
};

export interface CountryCode {
  code: string;
  name: string;
  flag: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: '+51', name: 'Perú', flag: '🇵🇪' },
  { code: '+52', name: 'México', flag: '🇲🇽' },
  { code: '+57', name: 'Colombia', flag: '🇨🇴' },
  { code: '+56', name: 'Chile', flag: '🇨🇱' },
  { code: '+54', name: 'Argentina', flag: '🇦🇷' },
  { code: '+593', name: 'Ecuador', flag: '🇪🇨' },
  { code: '+58', name: 'Venezuela', flag: '🇻🇪' },
  { code: '+591', name: 'Bolivia', flag: '🇧🇴' },
  { code: '+595', name: 'Paraguay', flag: '🇵🇾' },
  { code: '+598', name: 'Uruguay', flag: '🇺🇾' },
  { code: '+34', name: 'España', flag: '🇪🇸' },
  { code: '+1', name: 'USA / Canadá', flag: '🇺🇸' },
  { code: '+507', name: 'Panamá', flag: '🇵🇦' },
  { code: '+506', name: 'Costa Rica', flag: '🇨🇷' },
  { code: '+502', name: 'Guatemala', flag: '🇬🇹' },
];

export function isValidPhone(raw: string): boolean {
  const digits = (raw || '').replace(/[^0-9]/g, '');
  return digits.length >= 6 && digits.length <= 15;
}

// ---- Customer (guest checkout) --------------------------------------------

export interface SaveCustomerInput {
  name: string;
  phone_country: string;
  phone: string;
}

export async function saveCustomer(
  input: SaveCustomerInput,
): Promise<{ ok: boolean; error: string | null }> {
  try {
    const res = await fetch(`${FUNCTIONS_BASE}/save-customer`, {
      method: 'POST',
      headers: baseHeaders,
      body: JSON.stringify(input),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok || !body || body.error || body.ok !== true) {
      return { ok: false, error: (body && body.error) || 'No se pudo guardar tus datos.' };
    }
    return { ok: true, error: null };
  } catch {
    return { ok: false, error: 'No se pudo conectar. Revisa tu conexión.' };
  }
}

// ---- Free Fire nickname lookup --------------------------------------------

export type FfLookupStatus = 'ok' | 'invalid' | 'not_found' | 'unavailable';

export interface FfLookupResult {
  nickname: string | null;
  status: FfLookupStatus;
  message: string;
}

// A well-formed Free Fire player ID is only digits, roughly 4-15 long.
export function isValidPlayerId(raw: string): boolean {
  const id = (raw || '').replace(/[^0-9]/g, '');
  return /^\d{4,15}$/.test(id);
}

export async function lookupFreeFireNickname(playerId: string): Promise<FfLookupResult> {
  const id = (playerId || '').replace(/[^0-9]/g, '');
  if (!isValidPlayerId(id)) {
    return {
      nickname: null,
      status: 'invalid',
      message: 'El ID debe tener solo números (entre 4 y 15 dígitos).',
    };
  }
  try {
    const res = await fetch(`${FUNCTIONS_BASE}/ff-player-lookup`, {
      method: 'POST',
      headers: baseHeaders,
      body: JSON.stringify({ player_id: id, id, playerId: id, uid: id }),
    });
    const body = await res.json().catch(() => null);
    const nick = body && (
      body.nickname || body.nick || body.username || body.name ||
      (body.data && (body.data.nickname || body.data.nick || body.data.username || body.data.name))
    );
    if (res.ok && nick) {
      return { nickname: String(nick), status: 'ok', message: '' };
    }
    // The provider signalled the player does not exist.
    const notFound =
      (body && body.found === false) ||
      (body && typeof body.error === 'string' && /no.*(existe|encontrad)/i.test(body.error));
    if (notFound) {
      return {
        nickname: null,
        status: 'not_found',
        message: 'No encontramos un jugador con ese ID. Revisa el número o escribe el apodo.',
      };
    }
    // Any other response means the lookup service isn't answering reliably.
    return {
      nickname: null,
      status: 'unavailable',
      message: 'La consulta no está disponible ahora. Escribe el apodo y continúa.',
    };
  } catch {
    return {
      nickname: null,
      status: 'unavailable',
      message: 'La consulta no está disponible ahora. Escribe el apodo y continúa.',
    };
  }
}

// ---- Analytics -------------------------------------------------------------

function getVisitorId(): string {
  try {
    let id = localStorage.getItem('ofel_vid');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('ofel_vid', id);
    }
    return id;
  } catch {
    return 'anon';
  }
}

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem('ofel_sid');
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem('ofel_sid', id);
    }
    return id;
  } catch {
    return 'anon';
  }
}

interface TrackInput {
  event_type: 'pageview' | 'product_view' | 'category_view';
  path?: string;
  product_id?: string;
  category?: string;
}

export function trackEvent(input: TrackInput): void {
  // Fire-and-forget; never block the UI or throw.
  try {
    const payload = {
      ...input,
      visitor_id: getVisitorId(),
      session_id: getSessionId(),
      referrer: document.referrer || null,
    };
    fetch(`${FUNCTIONS_BASE}/track-event`, {
      method: 'POST',
      headers: baseHeaders,
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // ignore
  }
}

export async function getPublicVisitCount(): Promise<number | null> {
  const { data, error } = await supabase.rpc('get_public_visit_count');
  if (error || data === null || data === undefined) return null;
  return Number(data);
}
