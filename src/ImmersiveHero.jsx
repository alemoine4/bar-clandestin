import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Flame, GlassWater, Sparkles } from 'lucide-react';
import './immersive.css';

const BASE = import.meta.env.BASE_URL;

const FEATURED_BOTTLES = [
  { src: `${BASE}bottles/laphroaig-10.webp`, label: 'Islay · fumé · maritime', className: 'hero-bottle hero-bottle--main' },
  { src: `${BASE}bottles/glenmorangie-lasanta-12.webp`, label: 'Highlands · sherry · gourmand', className: 'hero-bottle hero-bottle--left' },
  { src: `${BASE}bottles/compass-box-spice-tree.webp`, label: 'Épicé · boisé · chaleureux', className: 'hero-bottle hero-bottle--right' },
];

export default function ImmersiveHero() {
  const heroRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const node = heroRef.current;
    if (!node) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return undefined;

    const onPointerMove = (event) => {
      const rect = node.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      setTilt({ x, y });
    };

    const reset = () => setTilt({ x: 0, y: 0 });
    node.addEventListener('pointermove', onPointerMove);
    node.addEventListener('pointerleave', reset);
    return () => {
      node.removeEventListener('pointermove', onPointerMove);
      node.removeEventListener('pointerleave', reset);
    };
  }, []);

  const enterBar = () => {
    document.getElementById('bar-app')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const backgroundStyle = {
    background: `linear-gradient(90deg, rgba(5,3,2,.95) 0%, rgba(8,5,3,.74) 42%, rgba(7,4,2,.45) 70%, rgba(5,3,2,.80) 100%), linear-gradient(180deg, rgba(10,6,3,.12), rgba(5,3,2,.82)), url('${BASE}fond.jpg') center / cover no-repeat`,
  };

  return (
    <section ref={heroRef} className="v2-hero" aria-labelledby="v2-hero-title">
      <div className="v2-hero__background" style={backgroundStyle} aria-hidden="true" />
      <div className="v2-hero__grain" aria-hidden="true" />
      <div className="v2-hero__glow v2-hero__glow--one" aria-hidden="true" />
      <div className="v2-hero__glow v2-hero__glow--two" aria-hidden="true" />

      <div className="v2-hero__content">
        <div className="v2-hero__copy">
          <div className="v2-hero__eyebrow">
            <Flame size={16} strokeWidth={1.5} aria-hidden="true" />
            <span>Expérience de dégustation privée</span>
          </div>

          <img className="v2-hero__logo" src={`${BASE}logo-icon.png`} alt="" width="86" height="86" />
          <p className="v2-hero__kicker">Entrez dans</p>
          <h1 id="v2-hero-title">Le Bar Clandestin</h1>
          <p className="v2-hero__lede">
            Votre cave devient une expérience. Trouvez le whisky qui correspond à l'instant,
            explorez vos bouteilles et préparez la soirée dans une ambiance de speakeasy.
          </p>

          <div className="v2-hero__actions">
            <button type="button" className="v2-hero__primary" onClick={enterBar}>
              <GlassWater size={18} strokeWidth={1.5} aria-hidden="true" />
              Entrer dans le bar
            </button>
            <span className="v2-hero__hint">
              <Sparkles size={15} strokeWidth={1.5} aria-hidden="true" />
              Sommelier · Cave · Soirée
            </span>
          </div>
        </div>

        <div
          className="v2-hero__stage"
          style={{
            '--tilt-x': `${tilt.x}`,
            '--tilt-y': `${tilt.y}`,
          }}
          aria-label="Sélection de whiskies du Bar Clandestin"
        >
          <div className="v2-hero__halo" aria-hidden="true" />
          <div className="v2-hero__table" aria-hidden="true" />
          {FEATURED_BOTTLES.map((bottle) => (
            <figure key={bottle.src} className={bottle.className}>
              <img src={bottle.src} alt="" width="512" height="768" decoding="async" />
              <figcaption>{bottle.label}</figcaption>
            </figure>
          ))}
          <div className="v2-hero__glass" aria-hidden="true">
            <span className="v2-hero__whisky" />
          </div>
        </div>
      </div>

      <button type="button" className="v2-hero__scroll" onClick={enterBar} aria-label="Descendre vers l'application">
        <span>Découvrir</span>
        <ChevronDown size={18} strokeWidth={1.5} aria-hidden="true" />
      </button>
    </section>
  );
}
