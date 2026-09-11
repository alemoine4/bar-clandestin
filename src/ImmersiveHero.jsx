import React, { useEffect, useRef, useState } from 'react';
import { Flame, GlassWater, Boxes, Users, Sparkles } from 'lucide-react';
import './immersive.css';

const BASE = import.meta.env.BASE_URL;

export default function ImmersiveHero() {
  const heroRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const node = heroRef.current;
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const onPointerMove = (event) => {
      const rect = node.getBoundingClientRect();
      setTilt({
        x: ((event.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((event.clientY - rect.top) / rect.height - 0.5) * 2,
      });
    };

    const reset = () => setTilt({ x: 0, y: 0 });
    node.addEventListener('pointermove', onPointerMove);
    node.addEventListener('pointerleave', reset);
    return () => {
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
        '--hero-bg': `url(${BASE}fond.jpg)`,
      }}
    >
      <div className="v2-hero__backdrop" aria-hidden="true" />
      <div className="v2-hero__light" aria-hidden="true" />

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
            Un accès plus élégant à votre collection, au sommelier et au mode soirée — sans changer
            ce qui fonctionne déjà dans l'application.
          </p>

          <div className="v2-hero__actions">
            <button type="button" className="v2-primary" onClick={scrollToBar}>
              <GlassWater size={18} strokeWidth={1.5} aria-hidden="true" />
              Entrer dans mon bar
            </button>
            <span className="v2-note">
              <Sparkles size={14} strokeWidth={1.5} aria-hidden="true" />
              Votre app complète est juste en dessous
            </span>
          </div>
        </div>

        <div className="v2-hero__visual" aria-hidden="true">
          <div className="v2-orbit v2-orbit--1" />
          <div className="v2-orbit v2-orbit--2" />
          <div className="v2-bottle-wrap">
            <div className="v2-bottle-shadow" />
            <img
              className="v2-bottle"
              src={`${BASE}bottles/laphroaig-10.webp`}
              alt=""
              width="512"
              height="768"
              decoding="async"
            />
          </div>
          <div className="v2-glass" aria-hidden="true"><span /></div>
          <div className="v2-caption">
            <strong>Laphroaig 10</strong>
            <span>Islay · tourbé · maritime</span>
          </div>
        </div>
      </div>

      <div className="v2-entrybar" aria-label="Accès rapides au bar">
        <button type="button" onClick={() => openSection(['sommelier'])}>
          <Sparkles size={18} strokeWidth={1.5} aria-hidden="true" />
          <span><strong>Sommelier</strong><small>Trouver le bon whisky</small></span>
        </button>
        <button type="button" onClick={() => openSection(['inventaire', 'cave'])}>
          <Boxes size={18} strokeWidth={1.5} aria-hidden="true" />
          <span><strong>Ma cave</strong><small>Voir les bouteilles</small></span>
        </button>
        <button type="button" onClick={() => openSection(['soirée', 'soiree'])}>
          <Users size={18} strokeWidth={1.5} aria-hidden="true" />
          <span><strong>Soirée</strong><small>Servir les invités</small></span>
        </button>
      </div>
    </section>
  );
}
