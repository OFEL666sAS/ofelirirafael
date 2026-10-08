import { useState, useEffect } from 'react';
import { ArrowLeft, Instagram, Users, Star, MessageCircle, X, Image as ImageIcon, ShoppingBag, Clock, Truck } from 'lucide-react';
import { supabase, type Testimonial } from '../lib/supabase';
import { STORE_INFO, HOW_TO_BUY } from '../lib/storeInfo';
import { TikTokIcon } from './TikTokIcon';

interface ReferenciasPageProps {
  onNavigate: (page: string) => void;
}

export function ReferenciasPage({ onNavigate }: ReferenciasPageProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('testimonials')
      .select('*')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (data) setTestimonials(data as Testimonial[]);
        setLoading(false);
      });
  }, []);

  const withImages = testimonials.filter((t) => t.image_url);

  return (
    <div className="pt-20 pb-16 page-transition">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate('inicio')}
          className="flex items-center gap-2 text-gray-400 hover:text-gold-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Volver al inicio</span>
        </button>

        <div className="mb-10">
          <div className="gold-divider mb-4" />
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            <span className="gradient-text-gold">Referencias</span>
          </h1>
          <p className="text-gray-500 text-sm">Clientes satisfechos y evidencias de entregas reales</p>
        </div>

        {/* Redes sociales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <a
            href="https://www.instagram.com/ofel_irirafael/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-5 py-4 rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Instagram className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">@ofel_irirafael</p>
              <p className="text-xs text-gray-400">Síguenos en Instagram</p>
            </div>
          </a>

          <a
            href="https://whatsapp.com/channel/0029VavgyI284Om9V918ar0y"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-5 py-4 rounded-xl bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">Canal de WhatsApp</p>
              <p className="text-xs text-gray-400">Únete para ver referencias</p>
            </div>
          </a>

          <a
            href="https://www.tiktok.com/@ofel_irirafael_"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-5 py-4 rounded-xl bg-gradient-to-r from-gold-500/10 to-gold-400/5 border border-gold-500/20 hover:border-gold-500/40 transition-all duration-300 group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-dark-800 to-black flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <TikTokIcon className="w-5 h-5 text-gold-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">@ofel_irirafael_</p>
              <p className="text-xs text-gray-400">Síguenos en TikTok</p>
            </div>
          </a>

          <a
            href="https://www.tiktok.com/@ofel_irirafael"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-5 py-4 rounded-xl bg-gradient-to-r from-gold-500/10 to-gold-400/5 border border-gold-500/20 hover:border-gold-500/40 transition-all duration-300 group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-dark-800 to-black flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <TikTokIcon className="w-5 h-5 text-gold-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">@ofel_irirafael</p>
              <p className="text-xs text-gray-400">Síguenos en TikTok</p>
            </div>
          </a>
        </div>

        {/* Cómo comprar */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gold-400" />
            Cómo comprar
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {HOW_TO_BUY.map((step, i) => (
              <div
                key={step.title}
                className="relative bg-dark-800 rounded-xl border border-gold-500/10 p-5"
              >
                <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center text-dark-900 text-sm font-black mb-3">
                  {i + 1}
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{step.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Horarios y entregas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <div className="bg-dark-800 rounded-xl border border-gold-500/10 p-5">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold-400" />
              Horario de atención
            </h3>
            <ul className="space-y-2">
              {STORE_INFO.hours.map((h) => (
                <li key={h.label} className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-gray-400">{h.label}</span>
                  <span className="text-gold-300 font-medium text-right">{h.value}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-dark-800 rounded-xl border border-gold-500/10 p-5">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-gold-400" />
              Tiempos de entrega
            </h3>
            <ul className="space-y-2">
              {STORE_INFO.delivery.map((d) => (
                <li key={d.label} className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-gray-400">{d.label}</span>
                  <span className="text-gold-300 font-medium text-right">{d.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Galería de capturas */}
        {withImages.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-white mb-4">Evidencias de entrega</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {withImages.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setLightbox(t.image_url!)}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-dark-800 border border-gold-500/10 hover:border-gold-500/30 transition-all"
                >
                  <img
                    src={t.image_url!}
                    alt={`Referencia de ${t.name}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-dark-900/90 to-transparent p-2">
                    <p className="text-[10px] text-gold-300/80 font-medium">{t.watermark}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Testimonios */}
        <h2 className="text-xl font-bold text-white mb-4">Lo que dicen nuestros clientes</h2>
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto" />
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12 bg-dark-800/40 rounded-xl border border-gold-500/5">
            <ImageIcon className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Próximamente más referencias</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-dark-800 rounded-xl border border-gold-500/10 p-5 hover:border-gold-500/20 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full gradient-gold flex items-center justify-center text-dark-900 text-xs font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-gold-400 text-gold-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">"{t.comment}"</p>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center py-8">
          <a
            href="https://wa.me/51943592821"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-gold-outline text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            Contactar por WhatsApp
          </a>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[60] bg-dark-950/95 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-dark-800 border border-gold-500/20 flex items-center justify-center text-gray-400 hover:text-gold-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightbox}
            alt="Referencia ampliada"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gold-300/60">@ofel_irirafael</p>
        </div>
      )}
    </div>
  );
}
