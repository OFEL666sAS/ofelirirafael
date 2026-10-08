import { Smartphone, DollarSign, CreditCard, Wallet, Globe, Banknote, CircleDollarSign } from 'lucide-react';
import { FeaturedPayments } from './FeaturedPayments';

const methods = [
  {
    name: 'Yape',
    description: '943592821',
    icon: Smartphone,
    color: 'from-purple-500 to-purple-600',
  },
  {
    name: 'Plin',
    description: '943592821',
    icon: Smartphone,
    color: 'from-green-500 to-teal-500',
  },
  {
    name: 'PayPal',
    description: 'Internacional',
    icon: DollarSign,
    color: 'from-blue-500 to-blue-600',
  },
  {
    name: 'Binance',
    description: 'USDT / Cripto',
    icon: Wallet,
    color: 'from-yellow-500 to-yellow-600',
  },
  {
    name: 'Prex',
    description: 'Todos los paises',
    icon: Globe,
    color: 'from-cyan-500 to-blue-500',
  },
  {
    name: 'Mercado Pago',
    description: 'Peru / Latam',
    icon: CircleDollarSign,
    color: 'from-sky-400 to-blue-500',
  },
  {
    name: 'Nequi',
    description: 'Colombia',
    icon: Smartphone,
    color: 'from-indigo-500 to-purple-600',
  },
  {
    name: 'Daviplata',
    description: 'Colombia',
    icon: Banknote,
    color: 'from-red-500 to-red-600',
  },
  {
    name: 'Transferencia',
    description: 'BCP / Interbank',
    icon: CreditCard,
    color: 'from-orange-500 to-orange-600',
  },
  {
    name: 'Western Union',
    description: 'Global',
    icon: Globe,
    color: 'from-yellow-400 to-yellow-500',
  },
];

export function PaymentMethods() {
  return (
    <section className="py-12 sm:py-16 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,212,255,0.06),transparent_60%)]" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
            Metodos de <span className="gradient-text-blue">Pago</span>
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">
            Aceptamos todas las billeteras - Envios a todos los paises
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-8">
          <FeaturedPayments />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {methods.map((method) => {
            const Icon = method.icon;
            return (
              <div
                key={method.name}
                className="bg-dark-800/60 rounded-xl border border-white/5 p-4 text-center hover:border-neon-blue/20 transition-all duration-300 group"
              >
                <div className={`w-10 h-10 mx-auto rounded-lg bg-gradient-to-br ${method.color} flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white mb-0.5">{method.name}</h3>
                <p className="text-[10px] sm:text-xs text-gray-500">{method.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-700/50 border border-white/10">
            <CreditCard className="w-4 h-4 text-neon-blue" />
            <span className="text-xs sm:text-sm text-gray-300">Pagos verificados al instante - Consulta otros metodos por WhatsApp</span>
          </div>
        </div>
      </div>
    </section>
  );
}
