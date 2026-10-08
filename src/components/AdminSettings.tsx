import { useEffect, useState } from 'react';
import { supabase, EXCHANGE_RATE } from '../lib/supabase';
import { Save, Settings, DollarSign, MessageCircle, Clock } from 'lucide-react';

export function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [available, setAvailable] = useState(true);
  const [rate, setRate] = useState(String(EXCHANGE_RATE));
  const [whatsapp, setWhatsapp] = useState('51943592821');
  const [delivery, setDelivery] = useState('Entrega aproximada de 5 a 30 minutos');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from('app_config').select('exchange_rate, whatsapp_number, delivery_text').eq('id', 1).maybeSingle()
      .then(({ data, error }) => {
        if (error && error.code === '42703') { setAvailable(false); }
        if (data) {
          if (data.exchange_rate != null) setRate(String(data.exchange_rate));
          if (data.whatsapp_number) setWhatsapp(String(data.whatsapp_number));
          if (data.delivery_text) setDelivery(String(data.delivery_text));
        }
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    const value = parseFloat(rate);
    if (!value || value <= 0) { alert('Ingresa un tipo de cambio válido.'); return; }
    setSaving(true);
    const { error } = await supabase.from('app_config').update({
      exchange_rate: value,
      whatsapp_number: whatsapp.replace(/[^0-9]/g, ''),
      delivery_text: delivery.trim(),
      updated_at: new Date().toISOString(),
    }).eq('id', 1);
    setSaving(false);
    if (error) { alert('No se pudo guardar: ' + error.message + '\nAplica la migración nueva si falta la columna exchange_rate.'); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) return <div className="text-center py-16 text-gray-500">Cargando configuración...</div>;

  return (
    <div className="max-w-xl">
      <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1"><Settings className="w-5 h-5 text-gold-400" /> Configuración</h2>
      <p className="text-xs text-gray-500 mb-6">Ajustes globales de la tienda. El tipo de cambio aplica a todos los precios en dólares.</p>
      {!available && <p className="mb-4 text-xs text-amber-400">Falta la columna exchange_rate en app_config. Aplica la migración nueva para guardar.</p>}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5"><DollarSign className="w-3.5 h-3.5 inline mr-1" />Tipo de cambio: 1 USD = S/</label>
          <input type="number" step="0.01" min="0.01" value={rate} onChange={(e) => setRate(e.target.value)} className="input-field" />
          <p className="text-[11px] text-gray-600 mt-1">Se usa para convertir todos los precios soles ↔ dólares en toda la web.</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5"><MessageCircle className="w-3.5 h-3.5 inline mr-1" />Número de WhatsApp de la tienda</label>
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="51943592821" className="input-field" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5"><Clock className="w-3.5 h-3.5 inline mr-1" />Texto de entrega (portada)</label>
          <input value={delivery} onChange={(e) => setDelivery(e.target.value)} className="input-field" />
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl btn-gold text-sm disabled:opacity-50">
          <Save className="w-4 h-4" /> {saving ? 'Guardando...' : saved ? 'Guardado ✓' : 'Guardar configuración'}
        </button>
      </div>
    </div>
  );
}
