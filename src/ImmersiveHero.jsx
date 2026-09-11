import React, { useEffect, useRef, useState } from 'react';
import { Flame, GlassWater, Boxes, Users, Sparkles } from 'lucide-react';
import './immersive.css';
import './immersive-3d.css';

const BASE = import.meta.env.BASE_URL;
const BOTTLE_SRC = `${BASE}bottles/laphroaig-10.webp`;

const SHARDS = [
  { clip: 'polygon(39% 0, 62% 0, 59% 18%, 43% 22%)', dx: -42, dy: -120, dz: 170, rz: -18 },
  { clip: 'polygon(43% 18%, 59% 15%, 68% 35%, 48% 39%)', dx: 96, dy: -82, dz: 205, rz: 28 },
  { clip: 'polygon(29% 22%, 49% 20%, 48% 45%, 27% 49%)', dx: -126, dy: -48, dz: 155, rz: -33 },
  { clip: 'polygon(49% 37%, 72% 30%, 75% 53%, 52% 57%)', dx: 142, dy: -20, dz: 235, rz: 39 },
  { clip: 'polygon(27% 45%, 51% 43%, 47% 66%, 22% 68%)', dx: -154, dy: 22, dz: 190, rz: -46 },
  { clip: 'polygon(49% 52%, 76% 49%, 78% 73%, 51% 70%)', dx: 166, dy: 48, dz: 260, rz: 52 },
  { clip: 'polygon(22% 64%, 48% 61%, 52% 84%, 25% 88%)', dx: -118, dy: 102, dz: 205, rz: -29 },
  { clip: 'polygon(49% 68%, 78% 68%, 73% 91%, 47% 88%)', dx: 128, dy: 112, dz: 230, rz: 34 },
  { clip: 'polygon(25% 85%, 51% 82%, 58% 100%, 31% 100%)', dx: -54, dy: 154, dz: 145, rz: -15 },
  { clip: 'polygon(51% 85%, 73% 88%, 68% 100%, 47% 100%)', dx: 64, dy: 168, dz: 180, rz: 22 },
];

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
      const distance = Math.max(1, node.offsetHeight * 0.72);
      const scrollProgress = Math.min(1, Math.max(0, -rect.top / distance));
      const nextBurst = Math.min(1, Math.max(0, (scrollProgress - 0.13) / 0.52));
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
    node.addEventListener('pointermove', onPointerMove);
    node.addEventListener('pointerleave', reset);

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
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
              Faites défiler pour révéler le bar
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
              src={BOTTLE_SRC}
              alt=""
              width="512"
              height="768"
              decoding="async"
            />
            <div className="v2-shards" aria-hidden="true">
              {SHARDS.map((shard, index) => (
                <span
                  key={index}
                  className="v2-shard"
                  style={{
                    '--clip': shard.clip,
                    '--dx': `${shard.dx}px`,
                    '--dy': `${shard.dy}px`,
                    '--dz': `${shard.dz}px`,
                    '--rz': `${shard.rz}deg`,
                    backgroundImage: `url(${BOTTLE_SRC})`,
                  }}
                />
              ))}
            </div>
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
