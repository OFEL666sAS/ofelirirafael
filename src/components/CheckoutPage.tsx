import { useState, useEffect } from 'react';
import {
  ArrowLeft, User, Phone, MessageCircle, Gamepad2, Search, Loader2, CheckCircle, Info,
} from 'lucide-react';
import type { Product } from '../lib/supabase';
import { EXCHANGE_RATE, getQuantityBounds, getStoreConfig } from '../lib/supabase';
import {
  COUNTRY_CODES, isValidPhone, isValidPlayerId, saveCustomer, lookupFreeFireNickname,
} from '../lib/api';

interface CheckoutPageProps {
  product: Product;
  onBack: () => void;
}

interface OrderForm {
  name: string;
  phoneCountry: string;
  phone: string;
  quantity: number;
  ffPlayerId: string;
  ffNickname: string;
}

const WHATSAPP_NUMBER = '51943592821';

function storageKey(productId: string) {
  return `ofel_checkout_${productId}`;
}

function loadForm(productId: string, minQty: number): OrderForm {
  const fallback: OrderForm = {
    name: '', phoneCountry: '+51', phone: '', quantity: minQty, ffPlayerId: '', ffNickname: '',
  };
  try {
    const raw = sessionStorage.getItem(storageKey(productId));
    if (raw) return { ...fallback, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return fallback;
}

export function CheckoutPage({ product, onBack }: CheckoutPageProps) {
  const bounds = getQuantityBounds(product);
  const [form, setForm] = useState<OrderForm>(() => {
    const loaded = loadForm(product.id, bounds.min);
    const clamped = Math.min(bounds.max, Math.max(bounds.min, Math.floor(loaded.quantity) || bounds.min));
    return { ...loaded, quantity: clamped };
  });
  const [qtyInput, setQtyInput] = useState(() => String(form.quantity));
  const [ffLoading, setFfLoading] = useState(false);
  const [ffStatus, setFfStatus] = useState<'idle' | 'ok' | 'invalid' | 'not_found' | 'unavailable'>('idle');
  const [ffMessage, setFfMessage] = useState('');
  const [ffVerified, setFfVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(EXCHANGE_RATE);

  useEffect(() => {
    getStoreConfig().then((config) => setExchangeRate(config.exchange_rate));
  }, []);

  const isFreeFire = product.category === 'diamantes' || product.category === 'cuentas' || product.category === 'fragmentos';
  const unitPrice = Number(product.price);
  const totalPrice = unitPrice * form.quantity;
  const totalUsd = totalPrice / exchangeRate;
  const quantityValid = Number.isInteger(form.quantity) && form.quantity >= bounds.min && form.quantity <= bounds.max;

  function setQty(next: number) {
    const clamped = Math.min(bounds.max, Math.max(bounds.min, next));
    update({ quantity: clamped });
    setQtyInput(String(clamped));
  }

  function handleQtyInput(raw: string) {
    const digits = raw.replace(/[^0-9]/g, '');
    setQtyInput(digits);
    const n = parseInt(digits, 10);
    if (!isNaN(n)) update({ quantity: n });
  }

  function commitQtyInput() {
    const n = parseInt(qtyInput, 10);
    setQty(isNaN(n) ? bounds.min : n);
  }

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey(product.id), JSON.stringify(form));
    } catch { /* ignore */ }
  }, [form, product.id]);

  function update(patch: Partial<OrderForm>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  async function handleLookup() {
    setFfLoading(true);
    const result = await lookupFreeFireNickname(form.ffPlayerId);
    if (result.status === 'ok' && result.nickname) {
      update({ ffNickname: result.nickname });
      setFfVerified(true);
      setFfStatus('ok');
      setFfMessage('');
    } else {
      setFfVerified(false);
      setFfStatus(result.status);
      setFfMessage(result.message);
    }
    setFfLoading(false);
  }

  const phoneValid = isValidPhone(form.phone);
  const ffReady = !isFreeFire
    || (isValidPlayerId(form.ffPlayerId) && form.ffNickname.trim().length > 0);
  const canSubmit = form.name.trim().length >= 2 && phoneValid && ffReady && quantityValid && !submitting;

  function buildWhatsAppMessage(): string {
    const lines = [
      'Hola OFELIRIRAFAEL! Quiero confirmar mi pedido:',
      `Producto: ${product.name}`,
      `Cantidad: ${form.quantity}`,
      `Total: S/ ${totalPrice.toFixed(2)} ($${totalUsd.toFixed(2)} USD)`,
      `Nombre: ${form.name.trim()}`,
      `WhatsApp: ${form.phoneCountry} ${form.phone.trim()}`,
    ];
    if (isFreeFire) {
      lines.push(`ID de jugador: ${form.ffPlayerId.trim()}`);
      const apodo = ffVerified
        ? form.ffNickname.trim()
        : `${form.ffNickname.trim()} (ingresado por el cliente)`;
      lines.push(`Apodo: ${apodo}`);
    }
    return encodeURIComponent(lines.join('\n'));
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitError(null);
    setSubmitting(true);

    const { ok, error } = await saveCustomer({
      name: form.name.trim(),
      phone_country: form.phoneCountry,
      phone: form.phone.trim(),
    });

    setSubmitting(false);

    if (!ok) {
      setSubmitError(error || 'No se pudo guardar tus datos. Intenta de nuevo.');
      return;
    }

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMessage()}`, '_blank');
  }

  return (
    <div
      className="pt-20 pb-28 lg:pb-16 page-transition"
      onFocusCapture={(e) => {
        const t = e.target as HTMLElement;
        if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') setTyping(true);
      }}
      onBlurCapture={(e) => {
        const t = e.target as HTMLElement;
        if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') setTyping(false);
      }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-gold-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Volver al producto</span>
        </button>

        {/* Resumen del producto */}
        <div className="bg-dark-800 rounded-2xl border border-gold-500/10 p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-dark-700 flex-shrink-0">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gold-500/40">
                  <Gamepad2 className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white truncate">{product.name}</h3>
              <p className="text-xs text-gray-500 capitalize">{product.category}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-white">S/ {totalPrice.toFixed(2)}</p>
              <p className="text-xs text-gold-400">${totalUsd.toFixed(2)} USD</p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-dark-800 rounded-2xl border border-gold-500/10 p-6 space-y-4 animate-fade-in">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Datos del pedido</h2>
            <p className="text-sm text-gray-500">Coordinamos todo por WhatsApp. Solo pedimos lo esencial.</p>
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-xs font-medium text-gold-400 mb-2">Cantidad</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQty(form.quantity - 1)}
                disabled={form.quantity <= bounds.min}
                className="w-9 h-9 rounded-lg bg-dark-700 border border-gold-500/10 text-gold-400 font-bold hover:bg-dark-600 transition-colors disabled:opacity-40"
              >-</button>
              {bounds.allowManual ? (
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={qtyInput}
                  onChange={(e) => handleQtyInput(e.target.value)}
                  onBlur={commitQtyInput}
                  className="w-24 text-center text-sm font-bold text-white bg-dark-700 border border-gold-500/10 rounded-lg py-2 focus:border-gold-500/50 focus:outline-none"
                  aria-label="Cantidad"
                />
              ) : (
                <span className="w-12 text-center text-sm font-bold text-white">{form.quantity}</span>
              )}
              <button
                onClick={() => setQty(form.quantity + 1)}
                disabled={form.quantity >= bounds.max}
                className="w-9 h-9 rounded-lg bg-dark-700 border border-gold-500/10 text-gold-400 font-bold hover:bg-dark-600 transition-colors disabled:opacity-40"
              >+</button>
            </div>
            {!quantityValid && (
              <p className="text-xs text-red-400 mt-1.5">
                Ingresa una cantidad entre {bounds.min} y {bounds.max === Number.MAX_SAFE_INTEGER ? 'el disponible' : bounds.max}.
              </p>
            )}
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-xs font-medium text-gold-400 mb-2">
              <User className="w-3.5 h-3.5 inline mr-1" />
              Nombre del cliente *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="Tu nombre"
              className="input-field"
            />
          </div>

          {/* Teléfono con prefijo */}
          <div>
            <label className="block text-xs font-medium text-gold-400 mb-2">
              <Phone className="w-3.5 h-3.5 inline mr-1" />
              Teléfono / WhatsApp *
            </label>
            <div className="flex gap-2">
              <select
                value={form.phoneCountry}
                onChange={(e) => update({ phoneCountry: e.target.value })}
                className="w-28 px-2 py-3 rounded-xl bg-dark-700 border border-gold-500/10 text-white text-sm focus:border-gold-500/50 focus:outline-none"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                ))}
              </select>
              <input
                type="tel"
                inputMode="numeric"
                value={form.phone}
                onChange={(e) => update({ phone: e.target.value })}
                placeholder="999 999 999"
                className="input-field flex-1"
              />
            </div>
            {form.phone.length > 0 && !phoneValid && (
              <p className="text-xs text-red-400 mt-1.5">Ingresa un número válido (solo dígitos).</p>
            )}
            <p className="text-xs text-gray-600 mt-1.5">Es tu número; lo usamos para coordinar el pedido.</p>
          </div>

          {/* Free Fire: ID + apodo */}
          {isFreeFire && (
            <div className="p-4 rounded-xl bg-dark-900/60 border border-gold-500/10 space-y-3">
              <div className="flex items-center gap-2 text-gold-400">
                <Gamepad2 className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wide">Recarga Free Fire</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">ID de jugador *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.ffPlayerId}
                    onChange={(e) => {
                      update({ ffPlayerId: e.target.value.replace(/[^0-9]/g, '') });
                      setFfVerified(false);
                      setFfStatus('idle');
                      setFfMessage('');
                    }}
                    placeholder="Ej: 150271602"
                    className="input-field flex-1"
                  />
                  <button
                    onClick={handleLookup}
                    disabled={ffLoading || !isValidPlayerId(form.ffPlayerId)}
                    className="flex items-center gap-1.5 px-4 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-400 text-sm font-medium hover:bg-gold-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {ffLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Consultar
                  </button>
                </div>
                {ffStatus === 'invalid' && (
                  <p className="text-xs text-red-400 mt-1.5">{ffMessage}</p>
                )}
                {ffStatus === 'not_found' && (
                  <p className="text-xs text-red-400 mt-1.5">{ffMessage}</p>
                )}
                {ffStatus === 'unavailable' && (
                  <p className="text-xs text-amber-400 mt-1.5 flex items-start gap-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> {ffMessage}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Apodo del jugador *</label>
                <input
                  type="text"
                  value={form.ffNickname}
                  onChange={(e) => { update({ ffNickname: e.target.value }); setFfVerified(false); }}
                  placeholder="Apodo del jugador"
                  className="input-field"
                />
                {ffVerified ? (
                  <p className="text-xs text-green-400 mt-1.5 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Apodo confirmado con el ID.
                  </p>
                ) : form.ffNickname.trim().length > 0 ? (
                  <p className="text-xs text-gray-500 mt-1.5">Apodo ingresado por el cliente (sin verificar).</p>
                ) : null}
              </div>
            </div>
          )}

          {submitError && (
            <p className="text-sm text-red-400 text-center">{submitError}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="hidden lg:flex items-center justify-center gap-2 w-full py-3.5 rounded-xl btn-gold text-sm hover:-translate-y-0.5 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Preparando...</>
            ) : (
              <><MessageCircle className="w-4 h-4" /> Pedir por WhatsApp</>
            )}
          </button>
          <p className="text-xs text-gray-600 text-center">
            Se abrirá WhatsApp con tu pedido listo para enviar al número de OFELIRIRAFAEL.
          </p>
        </div>
      </div>

      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-gold-500/20 px-4 py-3 flex items-center gap-4 transition-transform duration-200 ${
          typing ? 'translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="flex flex-col leading-none">
          <span className="text-[11px] text-gray-400">Total</span>
          <span className="text-lg font-black text-white">S/{totalPrice.toFixed(2)}</span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl btn-gold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Preparando...</>
          ) : (
            <><MessageCircle className="w-4 h-4" /> Pedir por WhatsApp</>
          )}
        </button>
      </div>
    </div>
  );
}
