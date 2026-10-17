'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

const SEEN_KEY = 'raven-vice-awakening-seen-v1';

export default function TheAwakening() {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const host = root.current;
    const canvasEl = canvas.current;
    if (!host || !canvasEl) return;

    const alreadySeen = (() => {
      try { return sessionStorage.getItem(SEEN_KEY) === 'true'; } catch { return false; }
    })();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (alreadySeen || reducedMotion) {
      setVisible(false);
      try { sessionStorage.setItem(SEEN_KEY, 'true'); } catch { /* storage may be disabled */ }
      return;
    }

    let disposed = false;
    let finished = false;
    let frame = 0;
    let renderer: import('three').WebGLRenderer | undefined;
    let scene: import('three').Scene | undefined;
    let camera: import('three').PerspectiveCamera | undefined;
    let particles: import('three').Points | undefined;
    let particleGeometry: import('three').BufferGeometry | undefined;
    let particleMaterial: import('three').Material | undefined;
    let materials: import('three').Material[] = [];
    let timeline: gsap.core.Timeline | undefined;
    let context: gsap.Context | undefined;
    let renderFrame: (() => void) | undefined;
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;
    const cameraMotion = { x: 0, y: 0, z: 14 };
    let resizeObserver: ResizeObserver | undefined;

    const releaseRenderer = () => {
      cancelAnimationFrame(frame); frame = 0;
      resizeObserver?.disconnect();
      particleGeometry?.dispose(); particleGeometry = undefined;
      particleMaterial?.dispose(); particleMaterial = undefined;
      materials.forEach((material) => material.dispose()); materials = [];
      renderer?.dispose(); renderer?.forceContextLoss(); renderer = undefined;
      scene = undefined; camera = undefined; particles = undefined;
    };

    const markSeen = () => {
      try { sessionStorage.setItem(SEEN_KEY, 'true'); } catch { /* storage may be disabled */ }
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      markSeen();
      timeline?.kill();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      gsap.to(host, { autoAlpha: 0, duration: 0.7, ease: 'power2.inOut', onComplete: () => {
        releaseRenderer();
        context?.revert(); context = undefined;
        if (!disposed) setVisible(false);
      } });
    };

    const onPointerMove = (event: PointerEvent) => {
      targetX = (event.clientX / Math.max(window.innerWidth, 1) - 0.5) * 0.7;
      targetY = (event.clientY / Math.max(window.innerHeight, 1) - 0.5) * -0.42;
    };
    const onVisibilityChange = () => {
      if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0; }
      else if (!document.hidden && renderer && !frame) renderFrame?.();
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);

    const setup = async () => {
      try {
        const THREE = await import('three');
        if (disposed || finished) return;
        const pixelRatio = Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.15 : 1.35);
        renderer = new THREE.WebGLRenderer({ canvas: canvasEl, alpha: true, antialias: false, powerPreference: 'low-power', precision: 'mediump' });
        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight, false);
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(42, window.innerWidth / Math.max(window.innerHeight, 1), 0.1, 100);
        camera.position.set(0, 0, 14);
        const count = window.innerWidth < 700 ? 38 : 82;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        for (let i = 0; i < count; i++) {
          positions[i * 3] = (Math.random() - .5) * 20;
          positions[i * 3 + 1] = (Math.random() - .5) * 12;
          positions[i * 3 + 2] = (Math.random() - .5) * 8;
          colors[i * 3] = .56 + Math.random() * .38;
          colors[i * 3 + 1] = .025 + Math.random() * .045;
          colors[i * 3 + 2] = .06 + Math.random() * .09;
          sizes[i] = .018 + Math.random() * .045;
        }
        particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        particleMaterial = new THREE.PointsMaterial({ size: .045, vertexColors: true, transparent: true, opacity: .53, depthWrite: false, sizeAttenuation: true });
        particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        const updateSize = () => {
          if (!renderer || !camera) return;
          const width = window.innerWidth; const height = window.innerHeight;
          renderer.setSize(width, height, false);
          camera.aspect = width / Math.max(height, 1);
          camera.updateProjectionMatrix();
        };
        resizeObserver = new ResizeObserver(updateSize);
        resizeObserver.observe(document.documentElement);
        const drawFrame = () => {
          if (disposed || !renderer || !scene || !camera || document.hidden) { frame = 0; return; }
          frame = requestAnimationFrame(drawFrame);
          pointerX += (targetX - pointerX) * .026;
          pointerY += (targetY - pointerY) * .026;
          camera.position.set(cameraMotion.x + pointerX, cameraMotion.y + pointerY, cameraMotion.z);
          camera.lookAt(0, 0, 0);
          if (particles) particles.rotation.z = Math.sin(performance.now() * .00012) * .025;
          renderer.render(scene, camera);
        };
        renderFrame = drawFrame;
        drawFrame();
      } catch {
        releaseRenderer();
      }
    };

    const playTimeline = () => {
      context = gsap.context(() => {
        gsap.set('.awakening__brand-stage', { scale: .94 });
        gsap.set('.awakening__city', { scale: 1.1, xPercent: 0 });
        timeline = gsap.timeline({ onComplete: finish, defaults: { ease: 'power2.out' } });
        timeline
          .to('.awakening__particle-haze', { opacity: .24, duration: .5 }, 0)
          .to('.awakening__lightning', { height: '34%', opacity: 1, duration: .12, ease: 'steps(1)' }, .72)
          .to('.awakening__flare', { scale: 1.7, opacity: .9, duration: .18 }, .78)
          .to('.awakening__lightning', { opacity: 0, duration: .35 }, .92)
          .to('.awakening__bolt', { opacity: 1, scale: 1.06, duration: .32, ease: 'expo.out' }, .8)
          .to('.awakening__bolt', { scale: 1, duration: .8, ease: 'sine.inOut' }, 1.12)
          .to('.awakening__flare', { opacity: 0, scale: 2.4, duration: .8 }, 1.05)
          .to('.awakening__brand-stage', { opacity: 1, duration: .18, ease: 'sine.out' }, .74)
          .to('.awakening__logo', { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 1.7, ease: 'power2.inOut' }, 2.0)
          .to('.awakening__brand-stage', { filter: 'drop-shadow(0 0 42px rgba(255,34,78,.24))', duration: .8 }, 2.6)
          .to('.awakening__city', { opacity: 1, scale: 1.025, xPercent: -1.4, duration: 4.3, ease: 'sine.inOut' }, 5.1)
          .to('.awakening__blackout', { opacity: 0, duration: 2.1, ease: 'power2.inOut' }, 5.15)
          .to(cameraMotion, { x: .25, y: -.08, z: 13.15, duration: 4.6, ease: 'sine.inOut' }, 4.85)
          .to('.awakening__brand-stage', { opacity: 0, scale: .9, yPercent: -7, duration: 1.35, ease: 'sine.inOut' }, 5.35)
          .to('.awakening__name', { opacity: 1, y: 0, duration: 1.35, ease: 'power2.out' }, 9.0)
          .to('.awakening__caption', { opacity: .92, duration: .8, ease: 'sine.out' }, 9.55)
          .to('.awakening__name, .awakening__caption', { opacity: 0, y: -8, duration: .55, ease: 'sine.in' }, 11.4)
          .to('.awakening__progress i', { width: '100%', duration: 12, ease: 'none' }, 0);

      }, host);
    };

    // Load the 3D scene only when this session will actually play the intro.
    const skipButton = host.querySelector<HTMLButtonElement>('.awakening__skip');
    skipButton?.addEventListener('click', finish);
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') finish(); };
    window.addEventListener('keydown', onKeyDown);

    void setup().finally(() => { if (!disposed && !finished) playTimeline(); });

    return () => {
      disposed = true;
      timeline?.kill();
      context?.revert();
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      releaseRenderer();
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="awakening" ref={root} role="dialog" aria-label="Introdução cinematográfica Nox Vesper" aria-modal="true">
      <div className="awakening__blackout" />
      <div className="awakening__particle-haze" />
      <div className="awakening__city" style={{ backgroundImage: "url('/assets/hero-raven-city.jpg')" }} aria-hidden="true" />
      <div className="awakening__glow" />
      <div className="awakening__lightning" />
      <div className="awakening__flare" />
      <canvas className="awakening__three" ref={canvas} aria-hidden="true" />
      <div className="awakening__brand-stage" aria-hidden="true">
        <img className="awakening__bolt" src="/assets/raven-lightning-mask.png" alt="" />
        <img className="awakening__logo" src="/assets/raven-original.png" alt="" />
      </div>
      <div className="awakening__name" aria-hidden="true"><h1>LUCAS <span>NEVES</span></h1><p>DESENVOLVEDOR FULLSTACK</p></div>
      <p className="awakening__caption" aria-hidden="true">VICE CITY · APÓS O ANOITECER</p>
      <button className="awakening__skip" type="button">Pular intro <span>↗</span></button>
      <div className="awakening__progress" aria-hidden="true"><i /></div>
      <div className="awakening__vignette" />
      <div className="awakening__grain" />
    </div>
  );
}
