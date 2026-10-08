import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Search, Trash2, RefreshCw, Phone } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone_country: string;
  phone: string;
  phone_normalized: string;
  times_contacted: number;
  created_at: string;
  updated_at: string;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-PE', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) {
      setError('No se pudo cargar la lista de clientes.');
    } else {
      setCustomers((data as Customer[]) || []);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Eliminar este cliente de la lista?')) return;
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (!error) setCustomers((prev) => prev.filter((c) => c.id !== id));
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.phone_normalized.toLowerCase().includes(q) ||
      c.phone.includes(q),
    );
  }, [customers, query]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-gold-400" /> Clientes
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Lista privada. Cada número se guarda una sola vez cuando piden por WhatsApp.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar nombre o teléfono"
              className="pl-9 pr-3 py-2 rounded-xl bg-dark-700 border border-gold-500/10 text-white text-sm placeholder:text-gray-600 focus:border-gold-500/50 focus:outline-none w-full sm:w-64"
            />
          </div>
          <button
            onClick={fetchCustomers}
            className="p-2 rounded-xl bg-dark-700 border border-gold-500/10 text-gold-400 hover:bg-dark-600 transition-colors"
            title="Actualizar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Cargando...</div>
      ) : error ? (
        <div className="text-center py-16 text-red-400">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">
            {customers.length === 0 ? 'Aún no hay clientes registrados.' : 'Sin resultados para tu búsqueda.'}
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-500 mb-3">{filtered.length} cliente(s)</p>
          <div className="grid gap-2.5">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border border-white/5 bg-dark-700/40"
              >
                <div className="w-10 h-10 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400 font-bold flex-shrink-0">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">{c.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {c.phone_country} {c.phone}
                    </span>
                    {c.times_contacted > 1 && (
                      <span className="px-1.5 py-0.5 rounded bg-gold-500/10 text-gold-400 text-[10px] font-bold">
                        {c.times_contacted} pedidos
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-gray-600 uppercase tracking-wide">Último</p>
                  <p className="text-xs text-gray-400">{formatDate(c.updated_at)}</p>
                </div>
                <a
                  href={`https://wa.me/${(c.phone_country + c.phone).replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-green-500/10 text-green-400 transition-colors"
                  title="Escribir por WhatsApp"
                >
                  <MessageIcon />
                </a>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}
