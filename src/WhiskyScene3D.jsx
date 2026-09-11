import React, { useEffect, useRef, useState } from 'react';

const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export default function WhiskyScene3D({ burst = 0, tilt = { x: 0, y: 0 } }) {
  const mountRef = useRef(null);
  const runtimeRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let disposed = false;
    let frameId = 0;
    let resizeObserver;

    const mount = mountRef.current;
    if (!mount) return undefined;

    const init = async () => {
      try {
        const THREE = await import(/* @vite-ignore */ THREE_URL);
        if (disposed) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
        camera.position.set(4.4, 2.1, 7.8);
        camera.lookAt(0, 1.35, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
        renderer.setClearColor(0x000000, 0);
        mount.appendChild(renderer.domElement);

        const root = new THREE.Group();
        root.position.y = -0.15;
        scene.add(root);

        const glassMat = new THREE.MeshPhysicalMaterial({
          color: 0x3c1208,
          roughness: 0.12,
          metalness: 0.02,
          transmission: 0.72,
          thickness: 0.35,
          ior: 1.48,
          transparent: true,
          opacity: 0.95,
          clearcoat: 0.8,
          clearcoatRoughness: 0.08,
        });
        const whiskyMat = new THREE.MeshPhysicalMaterial({
          color: 0xc15d12,
          roughness: 0.2,
          transmission: 0.12,
          thickness: 0.5,
          transparent: true,
          opacity: 0.9,
        });
        const labelMat = new THREE.MeshStandardMaterial({ color: 0xe8d4ae, roughness: 0.76 });
        const inkMat = new THREE.MeshStandardMaterial({ color: 0x261207, roughness: 0.5 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xb8862d, roughness: 0.28, metalness: 0.7 });
        const capMat = new THREE.MeshStandardMaterial({ color: 0x160b06, roughness: 0.3, metalness: 0.5 });

        const bottle = new THREE.Group();
        root.add(bottle);

        const bodyPoints = [
          [0.82, 0.0], [0.86, 0.08], [0.9, 0.24], [0.9, 2.38], [0.84, 2.54],
          [0.72, 2.7], [0.53, 2.87], [0.33, 3.03], [0.25, 3.22], [0.25, 3.87], [0.28, 3.96],
        ].map(([x, y]) => new THREE.Vector2(x, y));
        const body = new THREE.Mesh(new THREE.LatheGeometry(bodyPoints, 64), glassMat);
        body.castShadow = false;
        bottle.add(body);

        const liquidPoints = [
          [0.72, 0.08], [0.78, 0.15], [0.79, 0.34], [0.79, 2.2], [0.68, 2.33], [0.52, 2.42],
        ].map(([x, y]) => new THREE.Vector2(x, y));
        const liquid = new THREE.Mesh(new THREE.LatheGeometry(liquidPoints, 48), whiskyMat);
        bottle.add(liquid);

        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.4, 48), capMat);
        cap.position.y = 4.12;
        bottle.add(cap);

        const label = new THREE.Mesh(new THREE.PlaneGeometry(1.18, 1.35), labelMat);
        label.position.set(0, 1.82, 0.905);
        bottle.add(label);
        const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.84, 0.16), inkMat);
        stripe.position.set(0, 1.8, 0.918);
        bottle.add(stripe);
        const crest = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.11), goldMat);
        crest.position.set(0, 2.18, 0.92);
        bottle.add(crest);

        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(1.58, 0.018, 12, 120),
          new THREE.MeshBasicMaterial({ color: 0xc79b48, transparent: true, opacity: 0.34 })
        );
        ring.position.set(0, 1.9, -0.75);
        scene.add(ring);

        const shards = [];
        const rand = (() => {
          let seed = 137;
          return () => {
            seed = (seed * 16807) % 2147483647;
            return (seed - 1) / 2147483646;
          };
        })();

        for (let i = 0; i < 56; i += 1) {
          const angle = rand() * Math.PI * 2;
          const y = 0.45 + rand() * 3.35;
          const radius = 0.16 + rand() * 0.66;
          const size = 0.08 + rand() * 0.2;
          const geom = new THREE.BufferGeometry();
          const vertices = new Float32Array([
            -size, -size * 0.55, 0,
            size, -size * 0.45, size * 0.08,
            size * (0.15 + rand() * 0.55), size, -size * 0.08,
          ]);
          geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
          geom.computeVertexNormals();
          const mesh = new THREE.Mesh(geom, glassMat.clone());
          mesh.material.opacity = 0;
          mesh.material.transparent = true;
          mesh.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
          mesh.rotation.set(rand() * 2, rand() * 2, rand() * 2);
          mesh.scale.setScalar(0.001);
          root.add(mesh);
          shards.push({
            mesh,
            start: mesh.position.clone(),
            target: new THREE.Vector3(
              Math.cos(angle) * (2.3 + rand() * 3.8),
              y + (rand() - 0.35) * 3.6,
              Math.sin(angle) * (1.5 + rand() * 4.2) + (rand() - 0.5) * 1.5
            ),
            spin: new THREE.Vector3((rand() - 0.5) * 5.5, (rand() - 0.5) * 7, (rand() - 0.5) * 8),
            phase: rand() * 0.15,
          });
        }

        const droplets = [];
        for (let i = 0; i < 34; i += 1) {
          const angle = rand() * Math.PI * 2;
          const y = 0.55 + rand() * 2.7;
          const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.035 + rand() * 0.06, 1), whiskyMat.clone());
          mesh.material.opacity = 0;
          mesh.material.transparent = true;
          mesh.position.set(Math.cos(angle) * (0.1 + rand() * 0.5), y, Math.sin(angle) * (0.1 + rand() * 0.45));
          mesh.scale.setScalar(0.001);
          root.add(mesh);
          droplets.push({
            mesh,
            start: mesh.position.clone(),
            target: new THREE.Vector3(
              Math.cos(angle) * (1 + rand() * 2.8),
              y + (rand() - 0.35) * 2.2,
              Math.sin(angle) * (0.7 + rand() * 2.4)
            ),
            phase: rand() * 0.18,
          });
        }

        const ambient = new THREE.HemisphereLight(0x5a331a, 0x080402, 1.2);
        scene.add(ambient);
        const key = new THREE.SpotLight(0xffa149, 110, 24, Math.PI / 5.2, 0.5, 1.4);
        key.position.set(3.8, 6.2, 4.5);
        key.target.position.set(0, 1.7, 0);
        scene.add(key, key.target);
        const rim = new THREE.PointLight(0xff4b12, 46, 12, 1.7);
        rim.position.set(-3, 3.5, -2.4);
        scene.add(rim);
        const front = new THREE.PointLight(0xffd5a1, 26, 10, 1.4);
        front.position.set(0, 2.2, 4.7);
        scene.add(front);

        const halo = new THREE.PointLight(0xff6a1a, 0, 10, 2);
        halo.position.set(0, 1.9, 0.3);
        scene.add(halo);

        runtimeRef.current = { THREE, renderer, scene, camera, root, bottle, ring, shards, droplets, halo, key };

        const resize = () => {
          const rect = mount.getBoundingClientRect();
          const width = Math.max(1, rect.width);
          const height = Math.max(1, rect.height);
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        };
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(mount);
        resize();

        const animate = () => {
          if (disposed) return;
          frameId = requestAnimationFrame(animate);
          const rt = runtimeRef.current;
          if (!rt) return;
          const t = performance.now() * 0.0005;
          rt.ring.rotation.z = t * 0.18;
          rt.bottle.position.y = Math.sin(t * 2.1) * 0.035;
          renderer.render(scene, camera);
        };
        animate();
      } catch (error) {
        console.error('Three.js hero failed', error);
        setFailed(true);
      }
    };

    init();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      const rt = runtimeRef.current;
      if (rt) {
        rt.scene.traverse((obj) => {
          obj.geometry?.dispose?.();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose?.());
          else obj.material?.dispose?.();
        });
        rt.renderer.dispose();
        rt.renderer.domElement.remove();
      }
      runtimeRef.current = null;
    };
  }, []);

  useEffect(() => {
    const rt = runtimeRef.current;
    if (!rt) return;
    const p = clamp(burst);
    const pre = clamp(p / 0.28);
    const explode = clamp((p - 0.22) / 0.68);
    const vanish = clamp((p - 0.72) / 0.28);

    rt.root.rotation.x = (tilt.y || 0) * -0.045 + pre * -0.035;
    rt.root.rotation.y = (tilt.x || 0) * 0.105 + pre * 0.08;
    rt.root.position.x = (tilt.x || 0) * 0.08;
    rt.camera.position.x = 4.4 + (tilt.x || 0) * 0.3;
    rt.camera.position.y = 2.1 - (tilt.y || 0) * 0.12;
    rt.camera.lookAt(0, 1.35, 0);
    rt.bottle.scale.setScalar(Math.max(0.001, 1 - explode * 1.03));
    rt.ring.material.opacity = 0.34 * (1 - vanish);
    rt.halo.intensity = Math.sin(Math.min(1, explode * 1.35) * Math.PI) * 88;
    rt.key.intensity = 110 + Math.sin(Math.min(1, explode * 1.2) * Math.PI) * 55;

    rt.shards.forEach((entry, index) => {
      const local = clamp((explode - entry.phase) / (1 - entry.phase));
      const eased = 1 - Math.pow(1 - local, 3);
      entry.mesh.position.lerpVectors(entry.start, entry.target, eased);
      entry.mesh.rotation.x += entry.spin.x * 0.008 * local;
      entry.mesh.rotation.y += entry.spin.y * 0.008 * local;
      entry.mesh.rotation.z += entry.spin.z * 0.008 * local;
      entry.mesh.scale.setScalar(local > 0.02 ? 1 - vanish * 0.45 : 0.001);
      entry.mesh.material.opacity = local * (1 - vanish * 0.82) * (index % 3 === 0 ? 0.78 : 0.55);
    });

    rt.droplets.forEach((entry) => {
      const local = clamp((explode - entry.phase) / (1 - entry.phase));
      const eased = 1 - Math.pow(1 - local, 2.4);
      entry.mesh.position.lerpVectors(entry.start, entry.target, eased);
      entry.mesh.scale.setScalar(local > 0.02 ? 1 - vanish * 0.7 : 0.001);
      entry.mesh.material.opacity = local * (1 - vanish);
    });
  }, [burst, tilt]);

  return (
    <div ref={mountRef} className="v2-webgl-scene" aria-hidden="true">
      {failed && <div className="v2-webgl-fallback" />}
    </div>
  );
}
