// Demo component for the business-motion-film lab: a layered product that explodes along its normal,
// with projected anchors for HTML callouts. Follows references/three-js-patterns.md (render contract):
// everything is posed from t only, so any seek order gives the same pixels.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smoother = x => { x = clamp(x); return x * x * x * (x * (x * 6 - 15) + 10); };

// Bottom → top. ids match the labels mounted in index.html.
const LAYERS = [
  { id: 'd', color: 0xe8e1cf, h: 0.30, rough: 0.9 },  // base
  { id: 'c', color: 0x51703a, h: 0.10, rough: 0.7 },
  { id: 'b', color: 0xd9ef71, h: 0.08, rough: 0.5 },
  { id: 'a', color: 0x0a211d, h: 0.16, rough: 0.35 }, // top
];

export async function createScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(1920, 1080, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1920 / 1080, 0.1, 100);

  scene.add(new THREE.HemisphereLight(0xfff8ee, 0x3a4640, 1.4));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(-5, 9, 6); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 3;
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4 });
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xcfe4ff, 0.8); rim.position.set(6, 3, -6); scene.add(rim);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.18 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

  let y = 0;
  const parts = LAYERS.map((L, i) => {
    const geo = new THREE.BoxGeometry(2.6, L.h, 1.8);
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: L.color, roughness: L.rough, metalness: 0.05 }));
    mesh.castShadow = mesh.receiveShadow = true;
    const rest = y + L.h / 2; y += L.h;
    scene.add(mesh);
    // anchor: the front-right edge midpoint of each layer, in the layer's local frame
    return { ...L, i, mesh, rest, anchor: new THREE.Vector3(1.3, 0, 0.9) };
  });

  function pose(t) {
    // lift 0.3→1.5 s with smootherstep and a tiny stagger (no one-frame pop), then a slow "breathing" spread
    parts.forEach(p => {
      const lift = smoother((t - 0.3 - p.i * 0.005) / 1.2);
      const breathe = 1 + 0.12 * smoother((t - 1.5) / 2.1);
      p.mesh.position.y = p.rest + p.i * 0.55 * lift * breathe;
    });
    // slow 4% push so the hold never freezes
    const d = 9.2 * (1 - 0.04 * smoother(t / 3.6));
    const dir = new THREE.Vector3(0.62, 0.52, 0.72).normalize();
    camera.position.copy(dir.multiplyScalar(d));
    camera.lookAt(-0.35, 1.05, 0);
    camera.updateMatrixWorld();
  }

  const v = new THREE.Vector3();
  function anchors(t) {
    pose(t);
    return parts.map(p => {
      v.copy(p.anchor).add(p.mesh.position).project(camera);
      return { id: p.id, x: (v.x + 1) / 2 * 1920, y: (1 - v.y) / 2 * 1080 };
    });
  }
  function render(t) { pose(t); renderer.render(scene, camera); }

  await renderer.compileAsync(scene, camera);
  render(0);
  return { render, anchors, dispose: () => renderer.dispose() };
}
