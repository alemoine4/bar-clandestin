import React, { useEffect, useRef, useState } from 'react';
import { Flame, GlassWater, Boxes, Users, Sparkles } from 'lucide-react';
import WhiskyScene3D from './WhiskyScene3D.jsx';
import './immersive.css';
import './immersive-3d.css';
import './webgl-hero.css';

const BASE = import.meta.env.BASE_URL;

export default function ImmersiveHero() {
  const heroRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    const node = heroRef.current;
    if (!node) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;

    const updateBurst = () => {
      raf = 0;
      if (reducedMotion) {
        setBurst(0);
        return;
      }
      const rect = node.getBoundingClientRect();
      const travel = Math.max(1, node.offsetHeight - window.innerHeight);
      const scrollProgress = Math.min(1, Math.max(0, -rect.top / travel));
      const nextBurst = Math.min(1, Math.max(0, (scrollProgress - 0.07) / 0.74));
      setBurst(nextBurst);
    };

    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(updateBurst);
    };

    const onPointerMove = (event) => {
      if (reducedMotion) return;
      const rect = node.getBoundingClientRect();
      setTilt({
        x: ((event.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((event.clientY - rect.top) / rect.height - 0.5) * 2,
      });
    };

    const reset = () => setTilt({ x: 0, y: 0 });
    updateBurst();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    node.addEventListener('pointermove', onPointerMove);
    node.addEventListener('pointerleave', reset);

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      node.removeEventListener('pointermove', onPointerMove);
      node.removeEventListener('pointerleave', reset);
    };
  }, []);

  const scrollToBar = () => {
    document.getElementById('bar-app')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openSection = (labels) => {
    scrollToBar();
    window.setTimeout(() => {
      const root = document.getElementById('bar-app');
      if (!root) return;
      const buttons = Array.from(root.querySelectorAll('button'));
      const target = buttons.find((button) => {
        const text = (button.textContent || '').trim().toLowerCase();
        return labels.some((label) => text.includes(label));
      });
      target?.click();
    }, 420);
  };

  return (
    <section
      ref={heroRef}
      className="v2-hero"
      aria-labelledby="v2-hero-title"
      style={{
        '--tilt-x': tilt.x,
        '--tilt-y': tilt.y,
        '--burst': burst,
        '--hero-bg': `url(${BASE}fond.jpg)`,
      }}
    >
      <div className="v2-hero__backdrop" aria-hidden="true" />
      <div className="v2-hero__light" aria-hidden="true" />
      <div className="v2-burst-flare" aria-hidden="true" />

      <div className="v2-sticky-stage">
        <header className="v2-hero__nav">
          <div className="v2-brand">
            <img src={`${BASE}logo-icon.png`} alt="" width="46" height="46" />
            <span>Le Bar Clandestin</span>
          </div>
          <button type="button" className="v2-nav-cta" onClick={scrollToBar}>
            Entrer dans mon bar
          </button>
        </header>

        <div className="v2-hero__layout">
          <div className="v2-hero__copy">
            <div className="v2-hero__eyebrow">
              <Flame size={15} strokeWidth={1.5} aria-hidden="true" />
              <span>Speakeasy personnel</span>
            </div>
            <h1 id="v2-hero-title">Votre cave.<br />Votre moment.</h1>
            <p>
              Une entrée immersive vers votre collection, le sommelier et le mode soirée — avec une vraie scène 3D interactive.
            </p>

            <div className="v2-hero__actions">
              <button type="button" className="v2-primary" onClick={scrollToBar}>
                <GlassWater size={18} strokeWidth={1.5} aria-hidden="true" />
                Entrer dans mon bar
              </button>
              <span className="v2-note">
                <Sparkles size={14} strokeWidth={1.5} aria-hidden="true" />
                Faites défiler pour briser la bouteille
              </span>
            </div>
          </div>

          <div className="v2-hero__visual" aria-hidden="true">
            <WhiskyScene3D burst={burst} tilt={tilt} />
            <div className="v2-caption v2-caption--webgl">
              <strong>Le Bar Clandestin</strong>
              <span>Scène 3D interactive · scroll pour entrer</span>
            </div>
          </div>
        </div>

        <div className="v2-entrybar" aria-label="Accès rapides au bar">
          <button type="button" onClick={() => openSection(['sommelier'])}>
            <Sparkles size={18} strokeWidth={1.5} aria-hidden="true" />
            <span><strong>Sommelier</strong><small>Trouver le bon whisky</small></span>
          </button>
          <button type="button" onClick={() => openSection(['inventaire'])}>
            <Boxes size={18} strokeWidth={1.5} aria-hidden="true" />
            <span><strong>Gérer mes stocks</strong><small>Ouvrir directement l'inventaire</small></span>
          </button>
          <button type="button" onClick={() => openSection(['soirée', 'soiree'])}>
            <Users size={18} strokeWidth={1.5} aria-hidden="true" />
            <span><strong>Soirée</strong><small>Servir les invités</small></span>
          </button>
        </div>
      </div>
    </section>
  );
}
