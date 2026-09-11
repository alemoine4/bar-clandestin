import React, { useEffect, useRef, useState } from 'react';
import { Flame, GlassWater, Boxes, Users, Sparkles } from 'lucide-react';
import './immersive.css';
import './immersive-3d.css';

const BASE = import.meta.env.BASE_URL;
const BOTTLE_SRC = `${BASE}bottles/laphroaig-10.webp`;

const SHARDS = [
  { clip: 'polygon(38% 0, 62% 0, 58% 17%, 43% 21%)', dx: -54, dy: -155, dz: 210, rz: -24 },
  { clip: 'polygon(42% 15%, 60% 13%, 70% 31%, 50% 38%)', dx: 128, dy: -118, dz: 290, rz: 38 },
  { clip: 'polygon(26% 20%, 47% 18%, 48% 42%, 25% 48%)', dx: -172, dy: -74, dz: 230, rz: -46 },
  { clip: 'polygon(48% 34%, 73% 29%, 78% 51%, 51% 57%)', dx: 195, dy: -32, dz: 340, rz: 58 },
  { clip: 'polygon(21% 42%, 49% 40%, 46% 62%, 19% 68%)', dx: -218, dy: 18, dz: 270, rz: -62 },
  { clip: 'polygon(50% 50%, 79% 47%, 81% 69%, 53% 72%)', dx: 230, dy: 46, dz: 380, rz: 71 },
  { clip: 'polygon(18% 62%, 47% 58%, 53% 82%, 22% 88%)', dx: -182, dy: 132, dz: 305, rz: -41 },
  { clip: 'polygon(50% 68%, 80% 66%, 76% 91%, 47% 87%)', dx: 174, dy: 145, dz: 355, rz: 48 },
  { clip: 'polygon(23% 84%, 51% 80%, 58% 100%, 29% 100%)', dx: -92, dy: 214, dz: 235, rz: -28 },
  { clip: 'polygon(50% 83%, 75% 88%, 69% 100%, 46% 100%)', dx: 104, dy: 224, dz: 285, rz: 35 },
  { clip: 'polygon(31% 31%, 50% 30%, 48% 52%, 30% 55%)', dx: -116, dy: -18, dz: 420, rz: -78 },
  { clip: 'polygon(51% 22%, 67% 20%, 72% 42%, 54% 45%)', dx: 160, dy: -70, dz: 460, rz: 82 },
  { clip: 'polygon(32% 53%, 51% 50%, 53% 71%, 34% 76%)', dx: -138, dy: 84, dz: 390, rz: -67 },
  { clip: 'polygon(51% 48%, 70% 44%, 75% 64%, 55% 69%)', dx: 154, dy: 90, dz: 445, rz: 73 },
];

const PARTICLES = [
  [-210, -96, 360], [186, -124, 420], [-248, 18, 280], [235, 46, 490],
  [-176, 156, 350], [154, 194, 440], [-82, -196, 250], [94, -174, 330],
  [-286, 106, 390], [278, -28, 520], [-124, 228, 310], [212, 176, 470],
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
      const travel = Math.max(1, node.offsetHeight - window.innerHeight);
      const scrollProgress = Math.min(1, Math.max(0, -rect.top / travel));
      const nextBurst = Math.min(1, Math.max(0, (scrollProgress - 0.10) / 0.68));
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
                Faites défiler pour briser la bouteille
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
              <div className="v2-cracks" aria-hidden="true">
                <i /><i /><i /><i /><i /><i />
              </div>
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
              <div className="v2-particles" aria-hidden="true">
                {PARTICLES.map(([x, y, z], index) => (
                  <i key={index} style={{ '--px': `${x}px`, '--py': `${y}px`, '--pz': `${z}px` }} />
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
            <span><strong>Ma cave</strong><small>Voir et gérer les stocks</small></span>
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
