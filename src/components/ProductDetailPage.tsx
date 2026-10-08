import { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft, ArrowRight, Shield, Clock, CheckCircle, ChevronLeft, ChevronRight,
  Package, FileText, Settings, MessageCircle
} from 'lucide-react';
import { supabase, type Product, priceToUsd, getQuantityBounds, getStoreConfig, EXCHANGE_RATE } from '../lib/supabase';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onContinue: (product: Product) => void;
  onViewProduct: (product: Product) => void;
}

type Tab = 'descripcion' | 'instrucciones' | 'condiciones';

export function ProductDetailPage({ product, onBack, onContinue, onViewProduct }: ProductDetailPageProps) {
  const allImages = [product.image, ...(product.gallery || [])].filter(Boolean) as string[];
  const [activeImage, setActiveImage] = useState(0);
  const bounds = useMemo(() => getQuantityBounds(product), [product]);
  const [quantity, setQuantity] = useState(bounds.min);
  const [qtyInput, setQtyInput] = useState(String(bounds.min));
  const [activeTab, setActiveTab] = useState<Tab>('descripcion');
  const [variants, setVariants] = useState<Product[]>([]);
  const [exchangeRate, setExchangeRate] = useState(EXCHANGE_RATE);

  useEffect(() => {
    getStoreConfig().then((c) => setExchangeRate(c.exchange_rate));
  }, []);

  useEffect(() => {
    setQuantity(bounds.min);
    setQtyInput(String(bounds.min));
  }, [bounds.min, bounds.max, product.id]);

  const isOutOfStock = product.status === 'agotado';
  const unitPrice = Number(product.price);
  const totalPrice = unitPrice * quantity;
  const usdPrice = product.price_usd ? Number(product.price_usd) : priceToUsd(unitPrice, exchangeRate);
  const originalPrice = product.original_price ? Number(product.original_price) : null;
  const quantityValid = Number.isInteger(quantity) && quantity >= bounds.min && quantity <= bounds.max;

  function setQty(next: number) {
    const clamped = Math.min(bounds.max, Math.max(bounds.min, next));
    setQuantity(clamped);
    setQtyInput(String(clamped));
  }

  function handleQtyInput(raw: string) {
    const digits = raw.replace(/[^0-9]/g, '');
    setQtyInput(digits);
    const n = parseInt(digits, 10);
    if (!isNaN(n)) setQuantity(n);
  }

  function commitQtyInput() {
    const n = parseInt(qtyInput, 10);
    setQty(isNaN(n) ? bounds.min : n);
  }

  function handleContinue(p: Product) {
    try {
      const key = `ofel_checkout_${p.id}`;
      const raw = sessionStorage.getItem(key);
      const prev = raw ? JSON.parse(raw) : {};
      sessionStorage.setItem(key, JSON.stringify({ ...prev, quantity }));
    } catch { /* ignore */ }
    onContinue(p);
  }

  useEffect(() => {
    if (product.service_name) {
      supabase
        .from('products')
        .select('*')
        .eq('service_name', product.service_name)
        .eq('is_active', true)
        .eq('is_published', true)
        .order('display_order', { ascending: true })
        .then(({ data }) => {
          if (data) setVariants(data as Product[]);
        });
    }
  }, [product.service_name]);

  const hasVariants = variants.length > 1;

  const parsedDetails = useMemo(() => {
    if (!product.details) return null;
    return product.details;
  }, [product.details]);

  function nextImage() {
    setActiveImage((prev) => (prev + 1) % allImages.length);
  }

  function prevImage() {
    setActiveImage((prev) => (prev - 1 + allImages.length) % allImages.length);
  }

  const tabs: { id: Tab; label: string; icon: typeof FileText }[] = [
    { id: 'descripcion', label: 'Descripción', icon: FileText },
    { id: 'instrucciones', label: 'Instrucciones', icon: Settings },
    { id: 'condiciones', label: 'Condiciones', icon: Shield },
  ];

  return (
    <div className="pt-20 pb-28 lg:pb-16 page-transition">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navegación */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-gold-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Volver al catálogo</span>
          </button>
          {!isOutOfStock && (
            <button
              onClick={() => handleContinue(product)}
              disabled={!quantityValid}
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-gold-400 hover:text-gold-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continuar con mi pedido
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Galería */}
          <div className="space-y-3">
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-dark-800 border border-gold-500/10">
              {allImages.length > 0 ? (
                <img
                  src={allImages[activeImage]}
                  alt={product.name}
                  decoding="async"
                  className="w-full h-full object-contain bg-dark-800"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-750 to-dark-800">
                  <Package className="w-12 h-12 text-gold-500/30" />
                </div>
              )}

              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-dark-900/80 backdrop-blur-sm border border-gold-500/10 flex items-center justify-center text-white hover:bg-dark-700 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-dark-900/80 backdrop-blur-sm border border-gold-500/10 flex items-center justify-center text-white hover:bg-dark-700 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {isOutOfStock && (
                <div className="absolute top-4 left-4 px-4 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-bold">
                  AGOTADO
                </div>
              )}

              {product.badge && !isOutOfStock && (
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full gradient-gold text-xs font-bold text-dark-900">
                  {product.badge}
                </div>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                      activeImage === i
                        ? 'border-gold-500 shadow-[0_0_10px_rgba(201,162,39,0.3)]'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info del producto */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-dark-700 text-xs font-medium text-gold-400 capitalize">
                  {product.category}
                </span>
                {product.duration && (
                  <span className="px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-xs font-medium text-gold-300 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {product.duration}
                  </span>
                )}
                {product.discount > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-xs font-bold text-red-400">
                    -{product.discount}% OFF
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{product.name}</h1>
            </div>

            {/* Variantes (diferentes duraciones del mismo servicio) */}
            {hasVariants && (
              <div>
                <h3 className="text-sm font-semibold text-gold-400 mb-2">Duraciones disponibles</h3>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => {
                    const isActive = v.id === product.id;
                    const vPrice = Number(v.price);
                    return (
                      <button
                        key={v.id}
                        onClick={() => !isActive && onViewProduct(v)}
                        className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                          isActive
                            ? 'border-gold-500 bg-gold-500/10 text-gold-400'
                            : v.status === 'agotado'
                              ? 'border-white/5 text-gray-600 cursor-not-allowed opacity-50'
                              : 'border-gold-500/10 text-gray-300 hover:border-gold-500/30 hover:text-gold-400'
                        }`}
                        disabled={v.status === 'agotado'}
                      >
                        <span className="block text-xs text-gray-500 mb-0.5">{v.duration || v.name}</span>
                        <span className="font-bold">S/{vPrice.toFixed(2)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Precio */}
            <div className="p-5 rounded-xl bg-dark-800/60 border border-gold-500/10">
              <div className="flex items-end gap-3">
                <span className="text-3xl sm:text-4xl font-black text-white">
                  S/{unitPrice.toFixed(2)}
                </span>
                {originalPrice && originalPrice > unitPrice && (
                  <span className="text-lg text-gray-600 line-through mb-1">
                    S/{originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-gold-400 mt-1">
                ${usdPrice.toFixed(2)} USD
              </p>

              {!isOutOfStock && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm text-gray-400">Cantidad:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQty(quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-dark-700 border border-gold-500/10 text-gold-400 font-bold hover:bg-dark-600 transition-colors disabled:opacity-40"
                        disabled={quantity <= bounds.min}
                      >
                        -
                      </button>
                      {bounds.allowManual ? (
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={qtyInput}
                          onChange={(e) => handleQtyInput(e.target.value)}
                          onBlur={commitQtyInput}
                          className="w-20 text-center text-sm font-bold text-white bg-dark-700 border border-gold-500/10 rounded-lg py-1.5 focus:border-gold-500/50 focus:outline-none"
                          aria-label="Cantidad"
                        />
                      ) : (
                        <span className="w-10 text-center text-sm font-bold text-white">{quantity}</span>
                      )}
                      <button
                        onClick={() => setQty(quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-dark-700 border border-gold-500/10 text-gold-400 font-bold hover:bg-dark-600 transition-colors disabled:opacity-40"
                        disabled={quantity >= bounds.max}
                      >
                        +
                      </button>
                    </div>
                    <span className="ml-auto text-sm text-gray-400">
                      Total: <span className="font-bold text-white">S/{totalPrice.toFixed(2)}</span>
                    </span>
                  </div>
                  {!quantityValid && (
                    <p className="text-xs text-red-400 mt-2">
                      Ingresa una cantidad entre {bounds.min} y {bounds.max === Number.MAX_SAFE_INTEGER ? 'el disponible' : bounds.max}.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Pestañas: Descripción / Instrucciones / Condiciones */}
            <div>
              <div className="flex gap-1 border-b border-gold-500/10 mb-4">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all -mb-px ${
                        activeTab === tab.id
                          ? 'border-gold-500 text-gold-400'
                          : 'border-transparent text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="text-sm text-gray-400 leading-relaxed min-h-[100px]">
                {activeTab === 'descripcion' && (
                  <div className="space-y-2 animate-fade-in">
                    {product.description ? (
                      <p className="whitespace-pre-line">{product.description}</p>
                    ) : (
                      <p className="text-gray-600">Sin descripción disponible.</p>
                    )}
                  </div>
                )}

                {activeTab === 'instrucciones' && (
                  <div className="space-y-2 animate-fade-in">
                    {parsedDetails ? (
                      <p className="whitespace-pre-line">{parsedDetails}</p>
                    ) : (
                      <div className="space-y-1.5">
                        <p>1. Realiza tu compra y completa tus datos</p>
                        <p>2. Envíanos la información necesaria por WhatsApp</p>
                        <p>3. Procesamos tu pedido y realizamos la activación</p>
                        <p>4. Recibes tu producto y la confirmación</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'condiciones' && (
                  <div className="space-y-3 animate-fade-in">
                    {product.warranty && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gold-500/5 border border-gold-500/20">
                        <Shield className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-semibold text-gold-400 mb-1">Garantía</h4>
                          <p className="text-xs text-gray-400">{product.warranty}</p>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-dark-800/40 border border-gold-500/5">
                        <Clock className="w-3.5 h-3.5 text-gold-400" />
                        <span className="text-xs text-gray-300">Entrega inmediata</span>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-dark-800/40 border border-gold-500/5">
                        <CheckCircle className="w-3.5 h-3.5 text-gold-400" />
                        <span className="text-xs text-gray-300">100% seguro</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">
                      Al realizar tu compra, aceptas nuestros términos y condiciones. Los productos son digitales y no admiten devoluciones una vez entregados.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="flex items-center justify-center gap-2 flex-1 py-4 rounded-xl bg-dark-700 border border-gold-500/10 text-gray-300 font-semibold text-sm hover:text-gold-400 hover:border-gold-500/30 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </button>
              {!isOutOfStock ? (
                <button
                  onClick={() => handleContinue(product)}
                  disabled={!quantityValid}
                  className="flex items-center justify-center gap-2 flex-[2] py-4 rounded-xl btn-gold text-base hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  Continuar con mi pedido
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 flex-[2] py-4 rounded-xl bg-dark-700 border border-white/10 text-gray-500 font-bold text-base cursor-not-allowed">
                  Producto agotado
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {!isOutOfStock && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-gold-500/20 px-4 py-3 flex items-center gap-4">
          <div className="flex flex-col leading-none">
            <span className="text-[11px] text-gray-400">Total</span>
            <span className="text-lg font-black text-white">S/{totalPrice.toFixed(2)}</span>
          </div>
          <button
            onClick={() => handleContinue(product)}
            disabled={!quantityValid}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl btn-gold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <MessageCircle className="w-4 h-4" />
            Pedir por WhatsApp
          </button>
        </div>
      )}
    </div>
  );
}
