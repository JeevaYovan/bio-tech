import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * WebGL hero overlay — wraps the existing parallax hero (`<ng-content>`)
 * and lazy-loads Three.js on top once the host has rendered.
 *
 * Behaviour:
 *  - Fallback parallax hero ALWAYS renders first as the LCP element.
 *  - On desktop with fine pointer + non-reduce-motion, after view init
 *    we dynamic-import Three.js, build a small scene of translucent
 *    floating shapes, and fade the canvas in over 600ms.
 *  - Mobile / coarse-pointer / reduced-motion never load Three.js.
 *  - IntersectionObserver pauses the renderer when the section is
 *    scrolled offscreen.
 *  - All Three.js resources disposed on `destroyRef.onDestroy`.
 *
 * Bundle: Three.js arrives as a separate lazy chunk — confirm via
 * `npm run build` chunk listing. Should NOT be in the initial home
 * chunk.
 */
@Component({
  selector: 'app-nature-webgl-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="webgl-wrap" [class.is-active]="canvasReady()">
      <ng-content></ng-content>
      <div #canvasContainer class="webgl-canvas-host" aria-hidden="true"></div>
    </div>
  `,
  styleUrl: './nature-webgl-hero.scss',
})
export class NatureWebglHeroComponent implements AfterViewInit {
  protected readonly canvasReady = signal(false);

  private readonly canvasContainer = viewChild.required<ElementRef<HTMLElement>>('canvasContainer');
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  /* Set in ngOnDestroy via destroyRef. We check this after every async
     boundary in bootScene(); if true, we abort and dispose any partial
     allocations. Without this, navigating away from home before
     `await import('three')` resolves leaks the entire scene because the
     destroyRef.onDestroy() registration at the end of bootScene runs
     after the destroy hook has already fired (a no-op in Angular 17+),
     so the renderer + listeners persist for the page lifetime. */
  private destroyed = false;

  constructor() {
    this.destroyRef.onDestroy(() => { this.destroyed = true; });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const fine = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;

    /* Defer the Three.js dynamic import slightly past first paint so
       the parallax fallback gets a chance to land as the LCP element. */
    const idle = (cb: () => void) => {
      const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback;
      if (typeof ric === 'function') ric(cb, { timeout: 1500 });
      else setTimeout(cb, 600);
    };
    idle(() => {
      if (this.destroyed) return;
      this.bootScene();
    });
  }

  private async bootScene(): Promise<void> {
    const THREE = await import('three');
    /* Component may have been destroyed during the dynamic import.
       If so, abort: nothing has been allocated yet, just return. */
    if (this.destroyed) return;

    const container = this.canvasContainer().nativeElement;
    const rect = container.getBoundingClientRect();
    /* Cap pixel ratio at 1 for the hero — the shapes are out of focus
       anyway and dpr 2 doubles fragment cost for almost no visual gain. */
    const dpr = Math.min(1, window.devicePixelRatio || 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, rect.width / rect.height, 0.1, 100);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    });
    renderer.setPixelRatio(dpr);
    renderer.setSize(rect.width, rect.height, false);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    /* Lighting — single hemisphere + soft rim. Hemisphere replaces an
       ambient + key directional pair with one cheaper light. */
    const hemi = new THREE.HemisphereLight(0xfff5e1, 0x1a3c2b, 1.0);
    const rim = new THREE.DirectionalLight(0x8bc34a, 0.7);
    rim.position.set(-4, 2, 3);
    scene.add(hemi, rim);

    /* Floating organic shapes — solid lit meshes in brand greens and
       gold with manual opacity. We dropped MeshPhysicalMaterial's
       transmission/thickness/ior (which costs a separate render pass
       per frame) — MeshStandardMaterial with transparent + low opacity
       gives the same translucent look at a fraction of the cost. */
    const palette = [0x2d6a4f, 0x8bc34a, 0xd4a843, 0x5b8a6a, 0x7baa3a];
    const meshes: Array<{
      mesh: InstanceType<typeof THREE.Mesh>;
      base: { x: number; y: number; z: number };
      drift: { x: number; y: number };
      spin: { x: number; y: number };
    }> = [];

    /* IcosahedronGeometry detail 0 — the lowest subdivision. Five
       shapes at this poly count is roughly a tenth of seven shapes at
       detail 1. The visual difference at hero scale is invisible. */
    const geomA = new THREE.IcosahedronGeometry(0.9, 0);
    const geomB = new THREE.IcosahedronGeometry(0.6, 0);

    const COUNT = 5;
    for (let i = 0; i < COUNT; i++) {
      const color = palette[i % palette.length];
      const material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.45,
        metalness: 0.1,
        transparent: true,
        opacity: 0.5,
      });
      const geom = i % 2 === 0 ? geomA : geomB;
      const mesh = new THREE.Mesh(geom, material);
      const base = {
        x: (Math.random() - 0.5) * 8,
        y: (Math.random() - 0.5) * 5,
        z: (Math.random() - 0.5) * 3 - 1,
      };
      mesh.position.set(base.x, base.y, base.z);
      const scale = 0.8 + Math.random() * 0.6;
      mesh.scale.set(scale, scale, scale);
      scene.add(mesh);
      meshes.push({
        mesh,
        base,
        drift: { x: 0.001 + Math.random() * 0.002, y: 0.001 + Math.random() * 0.002 },
        spin: { x: 0.0015 + Math.random() * 0.002, y: 0.001 + Math.random() * 0.002 },
      });
    }

    /* Mouse parallax: camera nudges based on cursor position. */
    let mx = 0, my = 0, tmx = 0, tmy = 0;
    const onMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 0.6;
      my = (e.clientY / window.innerHeight - 0.5) * 0.4;
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    /* Forward declaration for ensureLoop; defined below tick(). */
    let ensureLoop: () => void = () => {};

    /* Pause flags — `visible` from IntersectionObserver, `awake` from
       Page Visibility API. The rAF loop is fully cancelled when the
       hero is offscreen or the tab is hidden, and restarted when both
       conditions return — so a user scrolled past the hero pays zero
       per-frame cost (previously the rAF kept spinning, just skipping
       the render call). */
    let visible = true;
    let awake = !document.hidden;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          visible = e.isIntersecting;
        }
        ensureLoop();
      },
      { threshold: 0 },
    );
    io.observe(container);
    const onVisibility = () => {
      awake = !document.hidden;
      ensureLoop();
    };
    document.addEventListener('visibilitychange', onVisibility);

    /* Resize handler. */
    const onResize = () => {
      const r = container.getBoundingClientRect();
      camera.aspect = r.width / r.height;
      camera.updateProjectionMatrix();
      renderer.setSize(r.width, r.height, false);
    };
    window.addEventListener('resize', onResize, { passive: true });

    /* Animation loop. Cancelled fully when offscreen / tab hidden;
       restarted via ensureLoop() when both conditions return. */
    let raf = 0;
    let running = false;
    let t = 0;
    const tick = () => {
      if (!visible || !awake) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(tick);
      t += 0.01;
      tmx += (mx - tmx) * 0.05;
      tmy += (my - tmy) * 0.05;
      camera.position.x = tmx * 1.5;
      camera.position.y = -tmy * 1.5;
      camera.lookAt(0, 0, 0);

      for (let i = 0; i < meshes.length; i++) {
        const { mesh, base, drift, spin } = meshes[i];
        mesh.position.x = base.x + Math.sin(t * drift.x * 60 + i) * 0.4;
        mesh.position.y = base.y + Math.cos(t * drift.y * 60 + i * 0.5) * 0.3;
        mesh.rotation.x += spin.x;
        mesh.rotation.y += spin.y;
      }

      renderer.render(scene, camera);
    };
    ensureLoop = () => {
      if (running || !visible || !awake) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };
    ensureLoop();

    /* Fade in. */
    requestAnimationFrame(() => this.canvasReady.set(true));

    this.destroyRef.onDestroy(() => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      meshes.forEach(({ mesh }) => {
        scene.remove(mesh);
        const mat = mesh.material as InstanceType<typeof THREE.Material> & { dispose: () => void };
        mat.dispose();
      });
      geomA.dispose();
      geomB.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    });
  }
}
