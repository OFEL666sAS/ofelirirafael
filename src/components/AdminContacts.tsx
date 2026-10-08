import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, RefreshCw, Mail, Phone, Star } from 'lucide-react';

interface Contact { id: string; label: string; kind: string; value: string; is_primary: boolean; }

export function AdminContacts({ kind, title, icon: Icon }: { kind: 'whatsapp' | 'email'; title: string; icon: typeof Phone }) {
  const [rows, setRows] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [exists, setExists] = useState(true);
  const [label, setLabel] = useState('');
  const [value, setValue] = useState('');

  const fetchRows = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('admin_contacts').select('*').eq('kind', kind).order('created_at');
    if (error) setExists(false); else { setExists(true); setRows((data as Contact[]) || []); }
    setLoading(false);
  }, [kind]);

  useEffect(() => { fetchRows(); }, [fetchRows]);
  async function add() {
    if (!value.trim() || !label.trim()) return;
    await supabase.from('admin_contacts').insert({ label: label.trim(), kind, value: value.trim(), is_primary: rows.length === 0 });
    setLabel(''); setValue(''); fetchRows();
  }
  async function setPrimary(id: string) {
    await supabase.from('admin_contacts').update({ is_primary: false }).eq('kind', kind);
    await supabase.from('admin_contacts').update({ is_primary: true }).eq('id', id);
    fetchRows();
  }
  async function remove(id: string) { if (!confirm('Eliminar?')) return; await supabase.from('admin_contacts').delete().eq('id', id); fetchRows(); }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div><h2 className="text-lg font-bold text-white flex items-center gap-2"><Icon className="w-5 h-5 text-gold-400" /> {title}</h2><p className="text-xs text-gray-500 mt-0.5">Datos de contacto internos de la tienda.</p></div>
        <button onClick={fetchRows} className="p-2 rounded-xl bg-dark-700 border border-gold-500/10 text-gold-400"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
      </div>
      {!exists ? (
        <p className="text-sm text-gray-500 py-8 text-center">Aplica la migración nueva para activar esta sección.</p>
      ) : (
        <>
          <div className="flex gap-2 mb-5 flex-wrap">
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Etiqueta (Ej: Principal)" className="input-field !w-auto flex-1 min-w-[140px]" />
            <input value={value} onChange={(e) => setValue(e.target.value)} placeholder={kind === 'email' ? 'correo@ejemplo.com' : '51999999999'} className="input-field !w-auto flex-[2] min-w-[180px]" />
            <button onClick={add} disabled={!label.trim() || !value.trim()} className="flex items-center gap-2 px-4 py-2 rounded-xl btn-gold text-sm font-semibold disabled:opacity-50"><Plus className="w-4 h-4" /> Agregar</button>
          </div>
          {rows.length === 0 ? <div className="text-center py-12 text-gray-500">Sin registros.</div> : (
            <div className="grid gap-2">
              {rows.map((r) => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-dark-700/40">
                  <div className="flex-1 min-w-0"><h3 className="text-sm font-semibold text-white flex items-center gap-2">{r.label}{r.is_primary && <span className="text-[9px] px-1.5 py-0.5 rounded bg-gold-500/20 text-gold-400 font-bold">PRINCIPAL</span>}</h3><p className="text-xs text-gray-500">{r.value}</p></div>
                  {!r.is_primary && <button onClick={() => setPrimary(r.id)} className="p-2 rounded-lg text-gray-500 hover:text-gold-400" title="Marcar principal"><Star className="w-4 h-4" /></button>}
                  <button onClick={() => remove(r.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function AdminEmails() { return <AdminContacts kind="email" title="Correos" icon={Mail} />; }
export function AdminNumbers() { return <AdminContacts kind="whatsapp" title="Números" icon={Phone} />; }
