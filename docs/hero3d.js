/**
 * Askiro 3D: fantasma modelado con volumen real (no extrusion) y animado con Three.js.
 * Cuerpo = cupula en torno + 3 lobulos esfericos + bulto de la cola; ojos y bigote se apoyan
 * sobre la superficie curva. Se carga en diferido desde workshop.js solo si hay WebGL y el
 * usuario no pidio reducir animaciones. El <img> del SVG queda como estado final si algo falla.
 */
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';

/** Achatamiento en profundidad: el fantasma es gordito pero no una esfera */
const DEPTH = 0.74;

/** Silueta del bigote (misma que askiro.svg), en su propio sistema de 200 x 70 */
const STACHE_D = 'M100 18 C88 6 62 2 42 10 C24 17 10 30 4 46 C2 54 8 60 16 56 C20 64 30 66 36 60 C42 68 54 68 60 60 C68 68 80 66 86 58 C92 62 97 58 100 52 C103 58 108 62 114 58 C120 66 132 68 140 60 C146 68 158 68 164 60 C170 66 180 64 184 56 C192 60 198 54 196 46 C190 30 176 17 158 10 C138 2 112 6 100 18 Z';

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
 * Cuerpo: cupula redonda que baja con los costados apenas abiertos (como el fantasma original).
 * @param {THREE.Material} mat - Material del cuerpo
 * @returns {THREE.Mesh}
 */
function makeDome(mat) {
  const R = 0.95;
  const yc = 0.3;
  const top = [];
  for (let i = 0; i <= 24; i++) {
    const a = (i / 24) * (Math.PI / 2);
    top.push(new THREE.Vector2(Math.sin(a) * R, yc + Math.cos(a) * R));
  }
  /* Costados y base con curva suave; la base queda escondida dentro de los lobulos */
  const sides = new THREE.SplineCurve([
    new THREE.Vector2(R, yc),
    new THREE.Vector2(0.99, -0.2),
    new THREE.Vector2(0.92, -0.55),
    new THREE.Vector2(0.6, -0.7),
    new THREE.Vector2(0.001, -0.72)
  ]).getPoints(32).slice(1);
  const profile = top.concat(sides).reverse(); /* LatheGeometry espera el perfil de abajo hacia arriba */
  const mesh = new THREE.Mesh(new THREE.LatheGeometry(profile, 72), mat);
  mesh.scale.z = DEPTH;
  return mesh;
}

/**
 * Esfera achatada (lobulo, cola, ojo).
 * @param {number} r - Radio
 * @param {THREE.Material} mat - Material
 * @param {number[]} pos - Posicion [x, y, z]
 * @param {number[]} [squash] - Escala [x, y, z]
 * @returns {THREE.Mesh}
 */
function blob(r, mat, pos, squash) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 32), mat);
  m.position.set(pos[0], pos[1], pos[2]);
  const s = squash || [1, 1, DEPTH];
  m.scale.set(s[0], s[1], s[2]);
  return m;
}

/**
 * Busca el punto de la superficie frontal del cuerpo en (x, y) y su normal.
 * @param {THREE.Object3D} body - Grupo del cuerpo
 * @param {number} x - Coordenada X
 * @param {number} y - Coordenada Y
 * @returns {{point: THREE.Vector3, normal: THREE.Vector3}}
 */
function surfaceAt(body, x, y) {
  const ray = new THREE.Raycaster(new THREE.Vector3(x, y, 5), new THREE.Vector3(0, 0, -1));
  const hit = ray.intersectObject(body, true)[0];
  if (!hit) return { point: new THREE.Vector3(x, y, 0.7), normal: new THREE.Vector3(0, 0, 1) };
  const normal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld).normalize();
  return { point: hit.point, normal: normal };
}

/**
 * Bigote: la silueta del SVG extruida con bisel y curvada para abrazar la cara.
 * @param {THREE.Material} mat - Material
 * @param {number} width - Ancho final
 * @param {number} bendRadius - Radio de la curva horizontal
 * @returns {THREE.Mesh}
 */
function makeStache(mat, width, bendRadius) {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg"><path d="' + STACHE_D + '"/></svg>';
  const shapes = new SVGLoader().parse(svg).paths[0].toShapes();
  const geo = new THREE.ExtrudeGeometry(shapes, { depth: 10, bevelEnabled: true, bevelThickness: 9, bevelSize: 4, bevelSegments: 8, curveSegments: 36 });
  geo.center();
  const k = width / 200;
  geo.scale(k, -k, -k); /* SVG tiene Y hacia abajo; invertir tambien Z evita voltear las caras */
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    pos.setZ(i, pos.getZ(i) - (x * x) / (2 * bendRadius));
  }
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, mat);
}

/**
 * Monta el fantasma 3D sobre el SVG de la portada.
 * @param {HTMLElement} wrap - Contenedor del fantasma (.start-ghost-wrap)
 * @param {HTMLImageElement} img - SVG 2D que se reemplaza visualmente
 * @param {HTMLElement} screen - Pantalla de inicio (para pausar cuando no esta visible)
 */
export async function mountHero3D(wrap, img, screen) {
  const gradient = toonGradient([70, 140, 205, 255]);
  const bodyMat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: gradient });
  const darkMat = new THREE.MeshToonMaterial({ color: 0x0b0a10, gradientMap: gradient });

  /* Cuerpo con la orientacion de la portada: ojos a la derecha, cola abajo a la izquierda */
  const body = new THREE.Group();
  body.add(makeDome(bodyMat));
  /* Lobulos mas profundos que anchos para quedar al ras del frente del cuerpo (sin "escalon") */
  body.add(blob(0.44, bodyMat, [-0.5, -0.66, 0.04], [1, 1, 1.32]));
  body.add(blob(0.46, bodyMat, [0.1, -0.76, 0.04], [1, 1, 1.3]));
  body.add(blob(0.42, bodyMat, [0.6, -0.64, 0.04], [1, 1, 1.34]));
  body.add(blob(0.36, bodyMat, [-0.84, -0.42, 0], [0.95, 1.2, 1.2]));
  body.scale.set(0.92, 1.1, 1); /* mas alto que ancho, como el original */
  body.updateMatrixWorld(true);

  /* Ojos apoyados sobre la superficie: el externo un poco mas alto, como el original */
  const eyes = new THREE.Group();
  [[-0.02, 0.36], [0.36, 0.42]].forEach(function (p) {
    const s = surfaceAt(body, p[0], p[1]);
    const eye = blob(0.1, darkMat, [0, 0, 0], [1, 1.55, 0.42]);
    eye.position.copy(s.point).addScaledVector(s.normal, 0.012);
    eye.lookAt(eye.position.clone().add(s.normal));
    eyes.add(eye);
  });

  /* Bigote tupido bajo los ojos, inclinado como la linea de los ojos */
  const stacheAnchor = surfaceAt(body, 0.17, 0.1);
  const stache = new THREE.Group();
  stache.add(makeStache(darkMat, 0.9, 0.85));
  stache.position.copy(stacheAnchor.point).addScaledVector(stacheAnchor.normal, 0.03);
  stache.lookAt(stache.position.clone().add(stacheAnchor.normal));
  stache.rotateZ(THREE.MathUtils.degToRad(8));
  const stacheBase = stache.quaternion.clone();

  const ghost = new THREE.Group();
  ghost.add(body, eyes, stache);
  ghost.rotation.z = THREE.MathUtils.degToRad(-6);
  ghost.scale.setScalar(1.05);

  /* Escena, camara y luces */
  const canvas = document.createElement('canvas');
  canvas.className = 'start-ghost-3d';
  canvas.setAttribute('aria-hidden', 'true');
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  let pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(pixelRatio);
  const outline = new OutlineEffect(renderer, { defaultThickness: 0.004, defaultColor: [0, 0, 0] });

  const scene = new THREE.Scene();
  scene.add(ghost);
  scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  const key = new THREE.DirectionalLight(0xffffff, 2.6);
  key.position.set(-4, 5, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9147ff, 2.4);
  rim.position.set(5, -1, -3);
  scene.add(rim);

  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
  camera.position.set(0, 0, 9);

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
  const wiggleQ = new THREE.Quaternion();
  const zAxis = new THREE.Vector3(0, 0, 1);
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
    ghost.rotation.y = 0.12 + look.x * 0.55 + Math.sin(t * 0.7) * 0.06;
    ghost.rotation.x = -look.y * 0.28;
    ghost.rotation.z = THREE.MathUtils.degToRad(-6) + Math.sin(t * 1.1) * 0.03;

    if (spin > 0) {
      spin = Math.max(0, spin - dt * 1.3);
      if (spin > 0) ghost.rotation.y += (1 - spin) * Math.PI * 2;
    }

    /* Ojos: se corren un poco hacia el cursor; bigote: respira y se agita al hacer clic */
    eyes.position.set(look.x * 0.035, look.y * 0.03, 0);
    wiggle = Math.max(0, wiggle - dt * 1.2);
    wiggleQ.setFromAxisAngle(zAxis, Math.sin(t * 2.4) * 0.04 + Math.sin(t * 22) * 0.14 * wiggle);
    stache.quaternion.copy(stacheBase).multiply(wiggleQ);
    stache.scale.set(1, 1 + Math.sin(t * 3.2) * 0.04, 1);

    outline.render(scene, camera);
  }
  requestAnimationFrame(tick);

  /* Fundido del SVG al 3D */
  wrap.classList.add('has-3d');
  canvas.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'forwards' });
  imgFade = img.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, easing: 'ease-out', fill: 'forwards' });
}
