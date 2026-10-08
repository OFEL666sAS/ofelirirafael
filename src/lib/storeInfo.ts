// Información de la tienda, fácil de editar en un solo lugar.
// Cambia estos valores para actualizar horarios, tiempos de entrega y contacto.

export const STORE_INFO = {
  // Soporte 1 / destino de los pedidos por WhatsApp
  whatsappNumber: '51943592821',
  supportName1: 'Soporte 1',
  supportDisplay1: '+51 943 592 821',
  // Soporte 2
  whatsappNumber2: '51971357264',
  supportName2: 'Soporte 2',
  supportDisplay2: '+51 971 357 264',
  instagram: '@ofel_irirafael',
  // Medios de pago destacados
  yape: {
    number: '943592821',
    display: '+51 943 592 821',
    holder: 'OFEL IRIGOIN RAFAEL',
  },
  binance: {
    id: '895732732',
  },
  // Horario de atención (texto libre, se muestra tal cual)
  hours: [
    { label: 'Lunes a Sábado', value: '9:00 a. m. – 10:00 p. m.' },
    { label: 'Domingos y feriados', value: '10:00 a. m. – 8:00 p. m.' },
  ],
  // Plazos de entrega según el tipo de producto
  delivery: [
    { label: 'Diamantes Free Fire', value: 'Inmediato (5–15 min)' },
    { label: 'Streaming y cuentas', value: 'De 10 a 30 minutos' },
    { label: 'Métodos y cursos', value: 'El mismo día' },
  ],
} as const;

// Pasos para comprar, mostrados en la página de referencias.
export const HOW_TO_BUY = [
  {
    title: 'Elige tu producto',
    desc: 'Explora el catálogo y abre el producto que quieres.',
  },
  {
    title: 'Completa tus datos',
    desc: 'Indica cantidad, nombre y tu WhatsApp. En recargas, agrega tu ID de jugador.',
  },
  {
    title: 'Envía tu pedido',
    desc: 'Pulsa «Pedir por WhatsApp» y coordinamos la entrega al instante.',
  },
] as const;
