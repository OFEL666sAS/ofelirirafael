import { Crown, Instagram, MessageCircle, Users, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getPublicVisitCount } from '../lib/api';
import { TikTokIcon } from './TikTokIcon';
import { CopyButton } from './CopyButton';
import { STORE_INFO } from '../lib/storeInfo';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const [visitCount, setVisitCount] = useState<number | null>(null);

  useEffect(() => {
    getPublicVisitCount().then(setVisitCount);
  }, []);

  return (
    <footer className="py-12 sm:py-16 border-t border-gold-500/10 bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg gradient-gold flex items-center justify-center">
                <Crown className="w-4 h-4 text-dark-900" />
              </div>
              <span className="text-lg font-bold gradient-text-gold">OFELIRIRAFAEL</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Tu tienda digital de confianza. Diamantes Free Fire, streaming, cuentas premium y mucho más al mejor precio.
            </p>
            <div className="flex gap-3">
              <a
                href="https://wa.me/51943592821"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-dark-700 flex items-center justify-center text-gray-400 hover:text-green-400 hover:bg-green-400/10 transition-all duration-200"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/ofel_irirafael/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-dark-700 flex items-center justify-center text-gray-400 hover:text-pink-400 hover:bg-pink-400/10 transition-all duration-200"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.tiktok.com/@ofel_irirafael_"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-dark-700 flex items-center justify-center text-gray-400 hover:text-gold-400 hover:bg-gold-400/10 transition-all duration-200"
                aria-label="TikTok @ofel_irirafael_"
              >
                <TikTokIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.tiktok.com/@ofel_irirafael"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-dark-700 flex items-center justify-center text-gray-400 hover:text-gold-400 hover:bg-gold-400/10 transition-all duration-200"
                aria-label="TikTok @ofel_irirafael"
              >
                <TikTokIcon className="w-4 h-4" />
              </a>
              <a
                href="https://whatsapp.com/channel/0029VavgyI284Om9V918ar0y"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-dark-700 flex items-center justify-center text-gray-400 hover:text-green-400 hover:bg-green-400/10 transition-all duration-200"
                aria-label="Canal de WhatsApp"
              >
                <Users className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gold-400 uppercase tracking-wider mb-4">Categorías</h4>
            <ul className="space-y-2.5">
              <li><button onClick={() => onNavigate('streaming')} className="text-sm text-gray-400 hover:text-gold-400 transition-colors">Streaming</button></li>
              <li><button onClick={() => onNavigate('diamantes')} className="text-sm text-gray-400 hover:text-gold-400 transition-colors">Diamantes FF</button></li>
              <li><button onClick={() => onNavigate('metodos')} className="text-sm text-gray-400 hover:text-gold-400 transition-colors">Métodos</button></li>
              <li><button onClick={() => onNavigate('cursos')} className="text-sm text-gray-400 hover:text-gold-400 transition-colors">Cursos</button></li>
              <li><button onClick={() => onNavigate('otros')} className="text-sm text-gray-400 hover:text-gold-400 transition-colors">Otros</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gold-400 uppercase tracking-wider mb-4">Información</h4>
            <ul className="space-y-2.5">
              <li><button onClick={() => onNavigate('referencias')} className="text-sm text-gray-400 hover:text-gold-400 transition-colors">Referencias</button></li>
              <li><button onClick={() => onNavigate('ayuda')} className="text-sm text-gray-400 hover:text-gold-400 transition-colors">Ayuda / FAQ</button></li>
              <li>
                <a href="https://www.instagram.com/ofel_irirafael/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-gold-400 transition-colors">
                  @ofel_irirafael
                </a>
              </li>
              <li>
                <a href="https://www.tiktok.com/@ofel_irirafael_" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-gold-400 transition-colors">
                  <TikTokIcon className="w-3.5 h-3.5" /> TikTok @ofel_irirafael_
                </a>
              </li>
              <li>
                <a href="https://www.tiktok.com/@ofel_irirafael" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-gold-400 transition-colors">
                  <TikTokIcon className="w-3.5 h-3.5" /> TikTok @ofel_irirafael
                </a>
              </li>
              <li>
                <a href={`https://wa.me/${STORE_INFO.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-gold-400 transition-colors">
                  <MessageCircle className="w-3.5 h-3.5" /> Soporte 1: {STORE_INFO.supportDisplay1}
                </a>
              </li>
              <li>
                <a href={`https://wa.me/${STORE_INFO.whatsappNumber2}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-gold-400 transition-colors">
                  <MessageCircle className="w-3.5 h-3.5" /> Soporte 2: {STORE_INFO.supportDisplay2}
                </a>
              </li>
              <li>
                <a href="https://whatsapp.com/channel/0029VavgyI284Om9V918ar0y" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-gold-400 transition-colors">
                  Canal de WhatsApp
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gold-400 uppercase tracking-wider mb-4">Pagos</h4>
            <ul className="space-y-3">
              <li className="text-sm text-gray-400">
                <div className="flex items-center gap-2 flex-wrap">
                  <span>Yape: {STORE_INFO.yape.display}</span>
                  <CopyButton value={STORE_INFO.yape.number} label="Copiar número" />
                </div>
                <span className="block text-xs text-gray-500 mt-1">Titular: {STORE_INFO.yape.holder}</span>
              </li>
              <li className="text-sm text-gray-400">
                <div className="flex items-center gap-2 flex-wrap">
                  <span>Binance ID: {STORE_INFO.binance.id}</span>
                  <CopyButton value={STORE_INFO.binance.id} label="Copiar ID" />
                </div>
              </li>
              <li className="text-sm text-gray-400">Plin: 943592821</li>
              <li className="text-sm text-gray-400">PayPal disponible</li>
              <li className="text-sm text-gray-400">Prex (Internacional)</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 sm:mt-12 pt-6 border-t border-gold-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <p className="text-xs text-gray-500">
              &copy; 2026 OFELIRIRAFAEL · @ofel_irirafael
            </p>
            <a
              href="#/terminos"
              className="text-xs text-gray-500 hover:text-gold-400 transition-colors"
            >
              Términos y Condiciones
            </a>
          </div>
          <div className="flex items-center gap-3">
            {visitCount !== null && (
              <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <Eye className="w-3.5 h-3.5 text-gold-500/60" />
                {visitCount.toLocaleString('es-PE')} visitas
              </span>
            )}
            <a
              href="#/admin"
              className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors"
            >
              Admin
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
