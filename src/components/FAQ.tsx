import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: 'Como es el proceso de compra?',
    answer: 'Selecciona el producto que deseas, haz clic en "Comprar por WhatsApp" y te atenderemos al instante. Te daremos las instrucciones de pago y la entrega es inmediata.',
  },
  {
    question: 'Cuanto tiempo tarda la entrega?',
    answer: 'La entrega es instantanea. Una vez confirmado el pago, recibes tu producto en menos de 5 minutos. Atendemos 24/7.',
  },
  {
    question: 'Que metodos de pago aceptan?',
    answer: 'Aceptamos Yape, Plin, PayPal, Binance (cripto) y Prex. Pagos verificados al instante.',
  },
  {
    question: 'Los productos tienen garantia?',
    answer: 'Si, todos nuestros productos cuentan con garantia. El tiempo de garantia se especifica en cada producto. Si hay algun problema, te lo reemplazamos.',
  },
  {
    question: 'Es seguro comprar aqui?',
    answer: 'Totalmente. Tenemos mas de 5 anos de experiencia y miles de clientes satisfechos. Puedes ver nuestras referencias en Instagram y el canal de WhatsApp.',
  },
  {
    question: 'Hacen envios internacionales?',
    answer: 'Si, al ser productos digitales no hay envio fisico. Atiendemos a cualquier pais del mundo. Para pagos internacionales usamos PayPal, Binance o Prex.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-14 sm:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            Preguntas <span className="gradient-text-blue">Frecuentes</span>
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">
            Resuelve tus dudas antes de comprar
          </p>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-dark-800/60 rounded-xl border border-white/5 overflow-hidden transition-all duration-300 hover:border-neon-blue/15"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex items-center justify-between w-full px-5 sm:px-6 py-4 text-left"
              >
                <span className="text-sm font-semibold text-white pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-neon-blue flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-48 pb-5' : 'max-h-0'
                }`}
              >
                <p className="px-5 sm:px-6 text-sm text-gray-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
