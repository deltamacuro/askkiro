/**
 * Askiro 3D: extruye el SVG de la portada y lo anima con Three.js.
 * Se carga de forma diferida desde workshop.js solo si hay WebGL y el usuario no pidio reducir animaciones.
 * El <img> del SVG queda como estado final si algo falla (sin WebGL, contexto perdido, error de red).
 */
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';

/** Profundidad del cuerpo y biseles, en unidades del SVG (viewBox de ~2050 x 2366) */
const BODY = { depth: 200, bevelEnabled: true, bevelThickness: 120, bevelSize: 60, bevelSegments: 10, curveSegments: 36 };
const EYES = { depth: 24, bevelEnabled: true, bevelThickness: 10, bevelSize: 8, bevelSegments: 3, curveSegments: 20 };
const STACHE = { depth: 46, bevelEnabled: true, bevelThickness: 22, bevelSize: 14, bevelSegments: 5, curveSegments: 24 };

/**
 * Crea un gradientMap de bandas duras para el sombreado toon.
 * @param {number[]} tones - Intensidades 0-255, una por banda
 * @returns {THREE.DataTexture}
 */
function toonGradient(tones) {
  const tex = new THREE.DataTexture(new Uint8Array(tones), tones.length, 1, THREE.RedFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.NoColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Suaviza un contorno cerrado: lo re-muestrea a intervalos regulares y aplica Chaikin.
 * Quita los micro-dientes del trazado de bitmap, que el contorno toon marcaria como rayas.
 * @param {THREE.Vector2[]} pts - Puntos del contorno
 * @param {number} samples - Cantidad de puntos tras re-muestrear
 * @param {number} passes - Pasadas de Chaikin
 * @returns {THREE.Vector2[]}
 */
function smoothLoop(pts, samples, passes) {
  const curve = new THREE.SplineCurve(pts.concat([pts[0]]));
  let out = curve.getSpacedPoints(samples).slice(0, -1);
  for (let k = 0; k < passes; k++) {
    const next = [];
    for (let i = 0; i < out.length; i++) {
      const a = out[i];
      const b = out[(i + 1) % out.length];
      next.push(new THREE.Vector2(a.x * 0.75 + b.x * 0.25, a.y * 0.75 + b.y * 0.25));
      next.push(new THREE.Vector2(a.x * 0.25 + b.x * 0.75, a.y * 0.25 + b.y * 0.75));
    }
    out = next;
  }
  return out;
}

/**
 * Devuelve una copia suavizada de una forma (contorno y agujeros).
 * @param {THREE.Shape} shape - Forma original
 * @returns {THREE.Shape}
 */
function smoothShape(shape) {
  const smooth = new THREE.Shape(smoothLoop(shape.getSpacedPoints(160), 140, 2));
  shape.holes.forEach(function (h) { smooth.holes.push(new THREE.Path(smoothLoop(h.getSpacedPoints(60), 50, 2))); });
  return smooth;
}

/**
 * Extruye los paths de un grupo de SVGLoader.
 * El SVG del fantasma viene de un trazado de bitmap con muchas astillas: se descartan
 * las formas con menos del minRatio del area de la mas grande para que el borde quede limpio.
 * @param {Array} paths - ShapePaths de SVGLoader
 * @param {Object} opts - Opciones de ExtrudeGeometry
 * @param {THREE.Material} material - Material de la malla
 * @param {number} [minRatio] - Area minima relativa (0 = todas)
 * @param {boolean} [smooth] - Suavizar el contorno antes de extruir
 * @returns {THREE.Group}
 */
function extrude(paths, opts, material, minRatio, smooth) {
  const shapes = [];
  paths.forEach(function (path) { path.toShapes().forEach(function (shape) { shapes.push(shape); }); });
  const areas = shapes.map(function (sh) { return Math.abs(THREE.ShapeUtils.area(sh.getPoints())); });
  const max = Math.max.apply(null, areas.concat([0]));
  const group = new THREE.Group();
  shapes.forEach(function (shape, i) {
    if (minRatio && areas[i] < max * minRatio) return;
    group.add(new THREE.Mesh(new THREE.ExtrudeGeometry(smooth ? smoothShape(shape) : shape, opts), material));
  });
  return group;
}

/**
 * Monta el fantasma 3D sobre el SVG de la portada.
 * @param {HTMLElement} wrap - Contenedor del fantasma (.start-ghost-wrap)
 * @param {HTMLImageElement} img - SVG 2D que se reemplaza visualmente
 * @param {HTMLElement} screen - Pantalla de inicio (para pausar cuando no esta visible)
 */
export async function mountHero3D(wrap, img, screen) {
  const svgText = await (await fetch(img.currentSrc || img.src)).text();
  const data = new SVGLoader().parse(svgText);

  /* Separar cuerpo, ojos y bigote segun el nodo de origen */
  const parts = { body: [], eyes: [], stache: [] };
  data.paths.forEach(function (path) {
    const node = path.userData.node;
    const fill = (path.userData.style.fill || '').toLowerCase();
    if (fill === 'none' || fill === 'transparent') return;
    if (node && node.closest && node.closest('#askiro-bigote')) parts.stache.push(path);
    else if (fill === '#000000' || fill === '#000') parts.eyes.push(path);
    else parts.body.push(path);
  });

  /* Materiales toon: cuerpo blanco con sombra lila suave, ojos y bigote negros */
  const gradient = toonGradient([95, 175, 255]);
  const bodyMat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: gradient });
  const darkMat = new THREE.MeshToonMaterial({ color: 0x0b0a10, gradientMap: gradient });

  const body = extrude(parts.body, BODY, bodyMat, 0.05, true);
  const front = BODY.depth + BODY.bevelThickness - 8;
  const eyes = extrude(parts.eyes, EYES, darkMat, 0, true);
  eyes.position.z = front;
  const stacheMeshes = extrude(parts.stache, STACHE, darkMat);

  /* El bigote gira sobre su propio centro: se recentra dentro de un pivote */
  const stacheBox = new THREE.Box3().setFromObject(stacheMeshes);
  const stacheCenter = stacheBox.getCenter(new THREE.Vector3());
  stacheMeshes.position.set(-stacheCenter.x, -stacheCenter.y, 0);
  const stache = new THREE.Group();
  stache.add(stacheMeshes);
  stache.position.set(stacheCenter.x, stacheCenter.y, front + 4);

  /* Coordenadas SVG (Y hacia abajo) + espejo de la portada (scaleX(-1)) = rotacion de 180 grados */
  const inner = new THREE.Group();
  inner.add(body, eyes, stache);
  const box = new THREE.Box3().setFromObject(body);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  inner.children.forEach(function (c) { c.position.x -= center.x; c.position.y -= center.y; });
  inner.rotation.z = Math.PI;
  const scale = 2.6 / size.y;
  inner.scale.setScalar(scale);
  inner.position.z = -(BODY.depth / 2) * scale;

  const ghost = new THREE.Group();
  ghost.add(inner);
  ghost.rotation.z = THREE.MathUtils.degToRad(-3);

  /* Escena, camara y luces */
  const canvas = document.createElement('canvas');
  canvas.className = 'start-ghost-3d';
  canvas.setAttribute('aria-hidden', 'true');
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  let pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(pixelRatio);
  const outline = new OutlineEffect(renderer, { defaultThickness: 0.003, defaultColor: [0, 0, 0] });

  const scene = new THREE.Scene();
  scene.add(ghost);
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(-5, 3, 3);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9147ff, 2.2);
  rim.position.set(5, -1, -2);
  scene.add(rim);

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  camera.position.set(0, 0, 8);

  wrap.appendChild(canvas);

  /** Ajusta el render al tamano del canvas */
  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  /* Seguimiento del cursor (o del dedo) */
  const pointer = { x: 0, y: 0 };
  const look = { x: 0, y: 0 };
  window.addEventListener('pointermove', function (e) {
    const r = canvas.getBoundingClientRect();
    pointer.x = THREE.MathUtils.clamp(((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)), -1, 1);
    pointer.y = THREE.MathUtils.clamp(-((e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)), -1, 1);
  }, { passive: true });

  /* Clic: una pirueta y el bigote se agita */
  let spin = 0;
  let wiggle = 0;
  wrap.addEventListener('click', function () { spin = 1; wiggle = 1; });

  /* Pausa cuando la portada no esta visible o la pestana esta oculta */
  let onScreen = true;
  new IntersectionObserver(function (entries) { onScreen = entries[0].isIntersecting; }).observe(canvas);
  function active() { return onScreen && !document.hidden && screen.classList.contains('active'); }

  /* Si se pierde el contexto WebGL, volvemos al SVG */
  let imgFade = null;
  canvas.addEventListener('webglcontextlost', function (e) {
    e.preventDefault();
    canvas.remove();
    if (imgFade) imgFade.cancel();
    img.style.opacity = '';
    wrap.classList.remove('has-3d');
  });

  const timer = new THREE.Timer();
  let frames = 0;
  let slowFrames = 0;

  /** Bucle de animacion: flotar, mirar al cursor, bigote vivo */
  function tick(now) {
    requestAnimationFrame(tick);
    timer.update(now);
    const dt = Math.min(timer.getDelta(), 0.05);
    if (!active()) return;
    const t = timer.getElapsed();

    /* Calidad adaptativa: si los cuadros tardan, bajamos la resolucion */
    frames++;
    if (dt > 0.022) slowFrames++;
    if (frames === 90) {
      if (slowFrames > 30 && pixelRatio > 1) { pixelRatio = 1; renderer.setPixelRatio(1); resize(); }
      frames = 0; slowFrames = 0;
    }

    look.x += (pointer.x - look.x) * 0.06;
    look.y += (pointer.y - look.y) * 0.06;

    ghost.position.y = Math.sin(t * 1.6) * 0.09;
    ghost.rotation.y = -0.38 + look.x * 0.5 + Math.sin(t * 0.7) * 0.06;
    ghost.rotation.x = -look.y * 0.25;
    ghost.rotation.z = THREE.MathUtils.degToRad(-3) + Math.sin(t * 1.1) * 0.025;

    if (spin > 0) {
      spin = Math.max(0, spin - dt * 1.4);
      ghost.rotation.y += (1 - spin) * Math.PI * 2 * (spin > 0 ? 1 : 0);
    }

    /* Ojos y bigote miran hacia el cursor (en coordenadas del SVG rotado 180 grados) */
    eyes.position.x = -center.x - look.x * 40;
    eyes.position.y = -center.y + look.y * 30;
    wiggle = Math.max(0, wiggle - dt * 1.2);
    stache.rotation.z = Math.sin(t * 2.4) * 0.035 + Math.sin(t * 22) * 0.12 * wiggle;
    stache.scale.y = 1 + Math.sin(t * 3.2) * 0.03;

    outline.render(scene, camera);
  }
  tick();

  /* Fundido del SVG al 3D */
  wrap.classList.add('has-3d');
  canvas.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'forwards' });
  imgFade = img.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, easing: 'ease-out', fill: 'forwards' });
}
