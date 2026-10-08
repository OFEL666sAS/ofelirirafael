import { useState } from 'react';
import { Lock, Diamond, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;

    setError('');
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError('Credenciales incorrectas');
    } else {
      onSuccess();
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl gradient-gold flex items-center justify-center mb-4">
            <Diamond className="w-7 h-7 text-dark-900" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Panel de Admin</h1>
          <p className="text-sm text-gray-400">Acceso restringido</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-dark-700/40 rounded-2xl border border-white/5 p-6">
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-400 mb-2">
              <Mail className="w-3.5 h-3.5 inline mr-1" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="admin@correo.com"
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-gold-500/10 text-white text-sm placeholder:text-gray-600 focus:border-gold-500/50 focus:outline-none transition-colors"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-400 mb-2">
              <Lock className="w-3.5 h-3.5 inline mr-1" />
              Contrasena
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Tu contrasena"
              className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-gold-500/10 text-white text-sm placeholder:text-gray-600 focus:border-gold-500/50 focus:outline-none transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 mb-4 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-3 rounded-xl btn-gold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
