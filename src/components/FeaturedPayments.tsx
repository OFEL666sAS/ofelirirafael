import { Smartphone, Wallet } from 'lucide-react';
import { STORE_INFO } from '../lib/storeInfo';
import { CopyButton } from './CopyButton';

export function FeaturedPayments() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-dark-800 rounded-xl border border-gold-500/20 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Yape</h3>
            <p className="text-xs text-gray-500">Pago inmediato</p>
          </div>
        </div>
        <p className="text-lg font-black gradient-text-gold">{STORE_INFO.yape.display}</p>
        <p className="text-xs text-gray-400 mb-4">Titular: {STORE_INFO.yape.holder}</p>
        <CopyButton value={STORE_INFO.yape.number} label="Copiar número" />
      </div>

      <div className="bg-dark-800 rounded-xl border border-gold-500/20 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center flex-shrink-0">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Binance</h3>
            <p className="text-xs text-gray-500">USDT / Cripto</p>
          </div>
        </div>
        <p className="text-lg font-black gradient-text-gold">ID: {STORE_INFO.binance.id}</p>
        <p className="text-xs text-gray-400 mb-4">Envía a este ID de Binance</p>
        <CopyButton value={STORE_INFO.binance.id} label="Copiar ID" />
      </div>
    </div>
  );
}
