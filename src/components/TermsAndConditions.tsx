import { ArrowLeft, Shield, AlertTriangle, Clock, CreditCard, Ban, MessageCircle } from 'lucide-react';

export function TermsAndConditions({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-dark-900 pt-20 sm:pt-24 pb-12 sm:pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-gold-400 mb-6 sm:mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Volver a la tienda</span>
        </button>

        {/* Title */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-2 sm:mb-3">
            Terminos y <span className="gradient-text-gold">Condiciones</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">Ultima actualizacion: Julio 2026</p>
        </div>

        {/* Sections */}
        <div className="space-y-5 sm:space-y-8">
          {/* Section 1 */}
          <section className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-dark-800/50 border border-gold-500/10">
            <div className="flex items-start gap-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-400" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white pt-0.5 sm:pt-1">1. Generalidades</h2>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-gray-400 leading-relaxed pl-11 sm:pl-12">
              <p>
                Al realizar una compra en nuestra tienda, aceptas estos terminos y condiciones en su totalidad.
                Ofel_irirafael es una tienda de productos digitales que opera a traves de redes sociales y esta pagina web.
              </p>
              <p>
                Nos reservamos el derecho de modificar estos terminos en cualquier momento.
                Las modificaciones entraran en vigor desde el momento de su publicacion en esta pagina.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-dark-800/50 border border-gold-500/10">
            <div className="flex items-start gap-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-400" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white pt-0.5 sm:pt-1">2. Productos y Precios</h2>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-gray-400 leading-relaxed pl-11 sm:pl-12">
              <p>
                Todos los productos ofrecidos son digitales (diamantes, cuentas, suscripciones, etc.).
                Los precios estan expresados en Soles Peruanos (PEN) y Dolares Americanos (USD) como referencia.
              </p>
              <p>
                Los precios pueden variar sin previo aviso dependiendo de las fluctuaciones del mercado.
                El precio final sera el que se muestre al momento de realizar la compra.
              </p>
              <p>
                La disponibilidad de productos esta sujeta a stock. Los productos marcados como "agotado"
                no se pueden adquirir hasta nuevo aviso.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-dark-800/50 border border-gold-500/10">
            <div className="flex items-start gap-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-400" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white pt-0.5 sm:pt-1">3. Proceso de Compra</h2>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-gray-400 leading-relaxed pl-11 sm:pl-12">
              <p>
                Las compras se realizan a traves de WhatsApp. El proceso es el siguiente:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 sm:space-y-2">
                <li>Selecciona el producto que deseas y haz clic en "Comprar".</li>
                <li>Seras redirigido a WhatsApp para coordinar el pago.</li>
                <li>Realiza el pago por el metodo acordado (Yape, Plin, PayPal, Binance, Prex).</li>
                <li>Envia el comprobante de pago.</li>
                <li>Recibe tu producto digital una vez verificado el pago.</li>
              </ol>
              <p>
                La entrega se realiza de forma inmediata una vez confirmado el pago, salvo casos excepcionales
                que seran comunicados al cliente.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-dark-800/50 border border-gold-500/10">
            <div className="flex items-start gap-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white pt-0.5 sm:pt-1">4. Garantia y Soporte</h2>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-gray-400 leading-relaxed pl-11 sm:pl-12">
              <p>
                Cada producto incluye la garantia especificada en su descripcion.
                Si no se especifica, la garantia por defecto es de 24 horas desde la entrega.
              </p>
              <p>
                La garantia cubre unicamente problemas relacionados con el producto entregado
                (credenciales incorrectas, diamantes no acreditados, etc.).
                No cubre mal uso, cambio de contrasenas por parte del comprador, ni situaciones ajenas a nuestro control.
              </p>
              <p>
                Para hacer efectiva la garantia, debes comunicarte por WhatsApp dentro del periodo establecido
                con pruebas del problema (capturas de pantalla, etc.).
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-dark-800/50 border border-gold-500/10">
            <div className="flex items-start gap-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <Ban className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white pt-0.5 sm:pt-1">5. Politica de Reembolsos</h2>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-gray-400 leading-relaxed pl-11 sm:pl-12">
              <p>
                Debido a la naturaleza digital de nuestros productos, <strong className="text-white">no se aceptan devoluciones ni reembolsos</strong> una
                vez entregado el producto, salvo en los siguientes casos:
              </p>
              <ul className="list-disc list-inside space-y-1.5 sm:space-y-2">
                <li>El producto entregado no corresponde al solicitado.</li>
                <li>El producto presenta un defecto comprobable dentro del periodo de garantia.</li>
                <li>Error de nuestro lado en la entrega o acreditacion.</li>
              </ul>
              <p>
                En caso de aplicar reembolso, se realizara por el mismo metodo de pago utilizado
                en un plazo maximo de 48 horas.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-dark-800/50 border border-gold-500/10">
            <div className="flex items-start gap-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white pt-0.5 sm:pt-1">6. Responsabilidades del Comprador</h2>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-gray-400 leading-relaxed pl-11 sm:pl-12">
              <p>El comprador se compromete a:</p>
              <ul className="list-disc list-inside space-y-1.5 sm:space-y-2">
                <li>Proporcionar datos correctos y completos para la entrega del producto.</li>
                <li>No compartir, revender o distribuir los productos adquiridos sin autorizacion.</li>
                <li>No realizar contracargos o disputas maliciosas de pago.</li>
                <li>Usar los productos adquiridos de forma responsable y conforme a los terminos de cada plataforma.</li>
              </ul>
              <p>
                Ofel_irirafael no se hace responsable por baneos, suspensiones o penalizaciones en cuentas
                de juego o plataformas derivadas del uso de los productos adquiridos.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-dark-800/50 border border-gold-500/10">
            <div className="flex items-start gap-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-400" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white pt-0.5 sm:pt-1">7. Contacto</h2>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-gray-400 leading-relaxed pl-11 sm:pl-12">
              <p>
                Para cualquier consulta, reclamo o soporte, puedes comunicarte con nosotros a traves de:
              </p>
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-gold-400 font-medium">WhatsApp:</span>
                  <a href="https://wa.me/51943592821" target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:underline break-all">+51 943 592 821</a>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-gold-400 font-medium">Instagram:</span>
                  <a href="https://www.instagram.com/ofel_irirafael/" target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:underline break-all">@ofel_irirafael</a>
                </div>
              </div>
              <p>
                Horario de atencion: Todos los dias de 9:00 AM a 11:00 PM (hora Peru).
              </p>
            </div>
          </section>
        </div>

        {/* Footer note */}
        <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-gold-500/10 text-center">
          <p className="text-[11px] sm:text-xs text-gray-600">
            Al realizar una compra, confirmas que has leido y aceptado estos terminos y condiciones.
          </p>
        </div>
      </div>
    </div>
  );
}
