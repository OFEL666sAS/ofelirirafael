import { useState, type MouseEvent } from 'react';
import { ArrowRight, Bot, Gamepad2, Globe2, MonitorSmartphone, Play, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import type { Product } from '../lib/supabase';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onViewProduct: (product: Product) => void;
}

const signals = [
  { label: 'Free Fire', icon: Gamepad2 },
  { label: 'Streaming', icon: Play },
  { label: 'IA', icon: Bot },
  { label: 'VPN', icon: Globe2 },
  { label: 'Apps', icon: MonitorSmartphone },
];

export function HomePage({ onNavigate }: HomePageProps) {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  function handlePointer(event: MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setPointer({
      x: ((event.clientX - rect.left) / rect.width - 0.5) * 16,
      y: ((event.clientY - rect.top) / rect.height - 0.5) * -12,
    });
  }

  return (
    <main className="home-shell" onMouseMove={handlePointer} onMouseLeave={() => setPointer({ x: 0, y: 0 })}>
      <section className="home-hero">
        <div className="tech-grid" aria-hidden="true" />
        <div className="signal signal-one" aria-hidden="true" />
        <div className="signal signal-two" aria-hidden="true" />
        <div className="hero-copy">
          <div className="hero-kicker"><span className="status-dot" /> Tienda digital peruana</div>
          <h1>OFELIRIRAFAEL</h1>
          <p className="hero-line">Streaming, Cuentas Free Fire, Diamantes y Métodos</p>
          <p className="hero-description">Accesos digitales claros, atención humana y entregas coordinadas sin crear cuentas ni complicaciones.</p>
          <div className="hero-actions">
            <button onClick={() => onNavigate('catalogo')} className="btn-gold hero-button">Explorar catálogo <ArrowRight size={17} /></button>
            <button onClick={() => onNavigate('referencias')} className="btn-quiet hero-button">Ver referencias</button>
          </div>
          <div className="hero-trust">
            <div><strong>Más de cinco mil</strong><span>clientes atendidos</span></div>
            <div><strong>5–30 minutos</strong><span>entrega aproximada</span></div>
          </div>
        </div>

        <div className="hero-console" style={{ transform: `perspective(900px) rotateX(${pointer.y}deg) rotateY(${pointer.x}deg)` }}>
          <div className="console-top"><span>OFEL / SYSTEM</span><span className="console-live"><span className="status-dot" /> ONLINE</span></div>
          <div className="console-mark">OF<span>EL</span></div>
          <div className="console-rule" />
          <div className="console-caption">Acceso digital · soporte real · Perú</div>
          <div className="signal-list">
            {signals.map(({ label, icon: Icon }, index) => <div key={label} className="signal-chip" style={{ animationDelay: `${index * 90}ms` }}><Icon size={15} /> {label}</div>)}
          </div>
          <div className="console-footer"><ShieldCheck size={15} /> Compra directa por WhatsApp <Zap size={15} /></div>
        </div>
      </section>
      <section className="home-bottom">
        <div><Sparkles size={17} /><span>Tecnología, gaming y entretenimiento en un solo lugar.</span></div>
        <span className="home-note">Sin registro · atención en español · precios en soles</span>
      </section>
    </main>
  );
}
