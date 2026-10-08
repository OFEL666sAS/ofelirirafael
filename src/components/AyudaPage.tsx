import { useState } from 'react';
import { ArrowLeft, ChevronDown, Smartphone, DollarSign, Wallet, Globe, CreditCard, MessageCircle } from 'lucide-react';
import { STORE_INFO } from '../lib/storeInfo';
import { FeaturedPayments } from './FeaturedPayments';

interface AyudaPageProps {
  onNavigate: (page: string) => void;
}

const faqs = [
  { question: '¿Cómo es el proceso de compra?', answer: 'Selecciona el producto que deseas, completa tus datos en el formulario de pedido y confirma. Te enviaremos por WhatsApp el resumen de tu compra con las instrucciones de pago. La entrega es inmediata tras confirmar el pago.' },
  { question: '¿Cuánto tiempo tarda la entrega?', answer: 'La entrega es instantánea. Una vez confirmado el pago, recibes tu producto en menos de 5 minutos. Atendemos 24/7.' },
  { question: '¿Qué métodos de pago aceptan?', answer: 'Aceptamos Yape, Plin, PayPal, Binance (cripto), Prex, Mercado Pago, Nequi, Daviplata, transferencias bancarias y Western Union. Pagos verificados al instante.' },
  { question: '¿Los productos tienen garantía?', answer: 'Sí, todos nuestros productos cuentan con garantía. El tiempo de garantía se especifica en cada producto. Si hay algún problema, te lo reemplazamos.' },
  { question: '¿Es seguro comprar aquí?', answer: 'Totalmente. Tenemos más de 5 años de experiencia y miles de clientes satisfechos. Puedes ver nuestras referencias en Instagram @ofel_irirafael y en nuestro canal de WhatsApp.' },
  { question: '¿Hacen envíos internacionales?', answer: 'Sí, al ser productos digitales no hay envío físico. Atendemos a cualquier país del mundo. Para pagos internacionales usamos PayPal, Binance o Prex.' },
];

const paymentMethods = [
  { name: 'Yape', desc: '943592821', icon: Smartphone, color: 'from-purple-500 to-purple-600' },
  { name: 'Plin', desc: '943592821', icon: Smartphone, color: 'from-green-500 to-teal-500' },
  { name: 'PayPal', desc: 'Internacional', icon: DollarSign, color: 'from-blue-500 to-blue-600' },
  { name: 'Binance', desc: 'USDT / Cripto', icon: Wallet, color: 'from-yellow-500 to-yellow-600' },
  { name: 'Prex', desc: 'Todos los países', icon: Globe, color: 'from-cyan-500 to-blue-500' },
  { name: 'Transferencia', desc: 'BCP / Interbank', icon: CreditCard, color: 'from-orange-500 to-orange-600' },
];

export function AyudaPage({ onNavigate }: AyudaPageProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="pt-20 pb-16 page-transition">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <span className="gradient-text-gold">Ayuda</span>
          </h1>
          <p className="text-gray-500 text-sm">Resuelve tus dudas antes de comprar</p>
        </div>

        {/* FAQ */}
        <div className="space-y-2.5 mb-12">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-dark-800 rounded-xl border border-gold-500/10 overflow-hidden transition-all duration-300 hover:border-gold-500/20"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex items-center justify-between w-full px-5 sm:px-6 py-4 text-left"
              >
                <span className="text-sm font-semibold text-white pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gold-400 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-48 pb-5' : 'max-h-0'
                }`}
              >
                <p className="px-5 sm:px-6 text-sm text-gray-400 leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Métodos de pago */}
        <h2 className="text-xl font-bold text-white mb-4">Métodos de pago</h2>
        <div className="mb-4">
          <FeaturedPayments />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <div
                key={method.name}
                className="bg-dark-800 rounded-xl border border-gold-500/10 p-4 text-center hover:border-gold-500/20 transition-all duration-300 group"
              >
                <div className={`w-10 h-10 mx-auto rounded-lg bg-gradient-to-br ${method.color} flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white mb-0.5">{method.name}</h3>
                <p className="text-[10px] sm:text-xs text-gray-500">{method.desc}</p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center py-8">
          <p className="text-sm text-gray-400 mb-4">¿Necesitas más ayuda? Escríbenos por WhatsApp</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`https://wa.me/${STORE_INFO.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl btn-gold-outline text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Contactar a Soporte 1
            </a>
            <a
              href={`https://wa.me/${STORE_INFO.whatsappNumber2}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl btn-gold-outline text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Contactar a Soporte 2
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
