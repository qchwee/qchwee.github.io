import * as THREE from 'three';
 
/* ============================================================================
   CONFIG — swap in your real artwork here whenever it's ready.
   Just drop the image files next to index.html and set the paths below.
   Until you do, nice placeholder textures are generated automatically.
   ============================================================================ */
const CONFIG = {
  cardFrontImageURL: './birthdaycard.png', // e.g. 'card-front.png'  (you said you already have this one)
  cardBackImageURL: './birthdaycardback.png',  // e.g. 'card-back.png'   (create this later, then just set it here)
};
 
/* ============================================================================
   BASIC SCENE SETUP
   ============================================================================ */
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
 
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0714, 0.045);
 
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 5.2);
 
window.addEventListener('resize', () => {
  updateResponsiveFraming();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ============================================================================
   RESPONSIVE FRAMING — pull the camera back on narrow/portrait screens so the
   envelope and emerged card still fit in view.
   ============================================================================ */
function updateResponsiveFraming() {
  const aspect = window.innerWidth / window.innerHeight;
  camera.aspect = aspect;

  if (aspect < 0.9) {
    // Portrait phone: pull back and widen FOV a bit so the card doesn't crop
    camera.position.z = 7.2;
    camera.fov = 52;
  } else if (aspect < 1.3) {
    // Squarish / small tablet
    camera.position.z = 6;
    camera.fov = 48;
  } else {
    // Normal desktop landscape
    camera.position.z = 5.2;
    camera.fov = 45;
  }
  camera.updateProjectionMatrix();
}
updateResponsiveFraming();
 
/* ============================================================================
   LIGHTING — soft ambient + a key light + two colored rim lights for a
   "floating in space" glow.
   ============================================================================ */
scene.add(new THREE.AmbientLight(0x6a5acd, 0.55));
 
const keyLight = new THREE.DirectionalLight(0xfff4e0, 1.5);
keyLight.position.set(2.5, 3.5, 4);
scene.add(keyLight);
 
const rimBlue = new THREE.PointLight(0x4d6dff, 6, 20);
rimBlue.position.set(-3.5, -1.5, -3);
scene.add(rimBlue);
 
const rimPink = new THREE.PointLight(0xff5da2, 3, 15);
rimPink.position.set(3, -2, -2);
scene.add(rimPink);
 
/* ============================================================================
   STARFIELD
   ============================================================================ */
function createStarfield() {
  const count = 1800;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const baseColor = new THREE.Color();
 
  for (let i = 0; i < count; i++) {
    const radius = 15 + Math.random() * 45;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
 
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
 
    const tint = Math.random();
    if (tint < 0.15) baseColor.set(0x9fb4ff);
    else if (tint < 0.3) baseColor.set(0xffc9e6);
    else baseColor.set(0xffffff);
 
    colors[i * 3] = baseColor.r;
    colors[i * 3 + 1] = baseColor.g;
    colors[i * 3 + 2] = baseColor.b;
  }
 
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
 
  const material = new THREE.PointsMaterial({
    size: 0.09,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
  });
 
  return new THREE.Points(geometry, material);
}
const stars = createStarfield();
scene.add(stars);
 
/* ============================================================================
   PLACEHOLDER TEXTURE GENERATION (used until you supply real artwork)
   ============================================================================ */
function makePlaceholderTexture({ label, sublabel, bg, border, textColor }) {
  const size = 1024;
  const cvs = document.createElement('canvas');
  cvs.width = size;
  cvs.height = Math.round(size * 0.68);
  const ctx = cvs.getContext('2d');
 
  // background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, cvs.width, cvs.height);
 
  // inset border
  const inset = 28;
  ctx.strokeStyle = border;
  ctx.lineWidth = 4;
  ctx.strokeRect(inset, inset, cvs.width - inset * 2, cvs.height - inset * 2);
 
  // corner flourish marks
  ctx.strokeStyle = border;
  ctx.lineWidth = 2;
  const c = 60;
  [[inset, inset, 1, 1], [cvs.width - inset, inset, -1, 1],
   [inset, cvs.height - inset, 1, -1], [cvs.width - inset, cvs.height - inset, -1, -1]]
    .forEach(([x, y, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(x + dx * c, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + dy * c);
      ctx.stroke();
    });
 
  // text
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '600 46px Georgia, serif';
  ctx.fillText(label, cvs.width / 2, cvs.height / 2 - 20);
  ctx.font = '400 24px Georgia, serif';
  ctx.fillStyle = border;
  ctx.fillText(sublabel, cvs.width / 2, cvs.height / 2 + 30);
 
  const texture = new THREE.CanvasTexture(cvs);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
 
const frontPlaceholder = makePlaceholderTexture({
  label: 'Front Artwork',
  sublabel: 'set CONFIG.cardFrontImageURL',
  bg: '#f4ecd8',
  border: '#b79a5e',
  textColor: '#5a4326',
});
 
const backPlaceholder = makePlaceholderTexture({
  label: 'Back Artwork',
  sublabel: 'set CONFIG.cardBackImageURL',
  bg: '#efe6d0',
  border: '#b79a5e',
  textColor: '#5a4326',
});
 
function loadRealTextureIfConfigured(url, materialSlot) {
  if (!url) return;
  new THREE.TextureLoader().load(url, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    materialSlot.map = tex;
    materialSlot.needsUpdate = true;
  });
}
 
/* ============================================================================
   ENVELOPE — built procedurally: a rectangular body with four folded flaps
   (bottom / left / right static, top hinged so it can open) and a red wax seal.
   ============================================================================ */
const ENV_W = 2.4;
const ENV_H = 1.6;
const halfW = ENV_W / 2;
const halfH = ENV_H / 2;
 
const paperWhite = 0xf7f5f0;
const paperShade = 0xeeebe2;
 
function flapMesh(points, color, doubleSide = true) {
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  const geometry = new THREE.ShapeGeometry(shape, 8);
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.85,
    metalness: 0.02,
    side: doubleSide ? THREE.DoubleSide : THREE.FrontSide,
  });
  return new THREE.Mesh(geometry, material);
}
 
const envelopeGroup = new THREE.Group();
 
// main body
const bodyGeo = new THREE.BoxGeometry(ENV_W, ENV_H, 0.06);
const bodyMat = new THREE.MeshStandardMaterial({ color: paperWhite, roughness: 0.85, metalness: 0.02 });
const body = new THREE.Mesh(bodyGeo, bodyMat);
envelopeGroup.add(body);
 
// static folded flaps (bottom / left / right), apex meeting at the center
const bottomFlap = flapMesh([[-halfW, -halfH], [halfW, -halfH], [0, 0]], paperShade);
bottomFlap.position.z = 0.035;
envelopeGroup.add(bottomFlap);
 
const leftFlap = flapMesh([[-halfW, -halfH], [-halfW, halfH], [0, 0]], paperShade);
leftFlap.position.z = 0.038;
envelopeGroup.add(leftFlap);
 
const rightFlap = flapMesh([[halfW, -halfH], [halfW, halfH], [0, 0]], paperShade);
rightFlap.position.z = 0.041;
envelopeGroup.add(rightFlap);
 
// hinged top flap — lives inside its own pivot group so it rotates around the
// envelope's top edge, not its own center
const topFlapPivot = new THREE.Group();
topFlapPivot.position.set(0, halfH, 0.044);
const topFlap = flapMesh([[-halfW, 0], [halfW, 0], [0, -halfH]], paperWhite);
topFlapPivot.add(topFlap);
envelopeGroup.add(topFlapPivot);
 
// wax seal (fixed on the body, roughly where the flap tip meets the center)
const sealGroup = new THREE.Group();
sealGroup.position.set(0, 0, 0.05);
 
const sealBase = new THREE.Mesh(
  new THREE.CylinderGeometry(0.2, 0.22, 0.035, 32),
  new THREE.MeshStandardMaterial({ color: 0xa10f28, roughness: 0.45, metalness: 0.1 })
);
sealBase.rotation.x = Math.PI / 2;
sealGroup.add(sealBase);
 
const sealRing = new THREE.Mesh(
  new THREE.TorusGeometry(0.13, 0.016, 10, 32),
  new THREE.MeshStandardMaterial({ color: 0x6e0a1c, roughness: 0.5, metalness: 0.1 })
);
sealRing.rotation.x = Math.PI / 2;
sealRing.position.z = 0.02;
sealGroup.add(sealRing);
 
const sealHighlight = new THREE.Mesh(
  new THREE.CircleGeometry(0.045, 20),
  new THREE.MeshStandardMaterial({ color: 0xe2637d, roughness: 0.35, metalness: 0.05 })
);
sealHighlight.position.set(-0.06, 0.07, 0.022);
sealGroup.add(sealHighlight);
 
envelopeGroup.add(sealGroup);
 
const envelopeFloatGroup = new THREE.Group();
envelopeFloatGroup.add(envelopeGroup);
scene.add(envelopeFloatGroup);
 
/* ============================================================================
   CARD — a thin box with front/back face materials. Starts tucked inside the
   envelope (small + hidden behind the flap), then pops out on open.
   ============================================================================ */
const CARD_W = 1.9;
const CARD_H = 1.3;
const CARD_T = 0.035;
 
const cardEdgeMat = new THREE.MeshStandardMaterial({ color: 0xece3cf, roughness: 0.7 });
const cardFrontMat = new THREE.MeshStandardMaterial({ map: frontPlaceholder, roughness: 0.55 });
const cardBackMat = new THREE.MeshStandardMaterial({ map: backPlaceholder, roughness: 0.55 });
 
loadRealTextureIfConfigured(CONFIG.cardFrontImageURL, cardFrontMat);
loadRealTextureIfConfigured(CONFIG.cardBackImageURL, cardBackMat);
 
// BoxGeometry material order: [+x, -x, +y, -y, +z(front), -z(back)]
const cardMaterials = [cardEdgeMat, cardEdgeMat, cardEdgeMat, cardEdgeMat, cardFrontMat, cardBackMat];
const cardMesh = new THREE.Mesh(new THREE.BoxGeometry(CARD_W, CARD_H, CARD_T), cardMaterials);
 
const cardGroup = new THREE.Group();
cardGroup.add(cardMesh);
 
const cardFloatGroup = new THREE.Group();
cardFloatGroup.add(cardGroup);
cardFloatGroup.visible = false; // stays hidden until the envelope is opened
scene.add(cardFloatGroup);
 
// tucked (inside envelope, hidden-ish) vs. emerged (floating out front) poses
const CARD_TUCKED = { pos: new THREE.Vector3(0, 0.32, 0.05), scale: 0.22 };
const CARD_EMERGED = { pos: new THREE.Vector3(0, 0, 1.9), scale: 1.15 };
 
cardGroup.position.copy(CARD_TUCKED.pos);
cardGroup.scale.setScalar(CARD_TUCKED.scale);
 
/* ============================================================================
   INTERACTION STATE
   ============================================================================ */
let isOpened = false;
let isDragging = false;
let lastPointer = { x: 0, y: 0 };
let dragVel = { x: 0, y: 0 };
 
let envEuler = { x: 0, y: 0 };       // current envelope orientation from dragging
const AUTO_ROTATE_SPEED = 0.18;      // rad/sec idle spin while closed & untouched
 
const OPEN_ANGLE = -2.35;            // how far the top flap swings open (radians)
let flapAngle = 0;
 
let emergeProgress = 0;              // 0 = tucked, 1 = fully emerged
let emergeTarget = 0;
 
let cardFlipCurrent = 0;
let cardFlipTarget = 0;
 
/* ---- right-click + drag to spin the envelope (only while it's closed) ---- */
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
 
canvas.addEventListener('mousedown', (e) => {
  if (e.button !== 2 || isOpened) return;
  isDragging = true;
  lastPointer.x = e.clientX;
  lastPointer.y = e.clientY;
  dragVel = { x: 0, y: 0 };
});
 
window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const dx = e.clientX - lastPointer.x;
  const dy = e.clientY - lastPointer.y;
  lastPointer.x = e.clientX;
  lastPointer.y = e.clientY;
 
  const sensitivity = 0.006;
  dragVel.x = dx * sensitivity;
  dragVel.y = dy * sensitivity;
 
  envEuler.y += dragVel.x;
  envEuler.x += dragVel.y;
});
 
window.addEventListener('mouseup', () => {
  isDragging = false;
});
 
/* ---- space bar: first press opens the envelope, every press after flips the card ---- */
window.addEventListener('keydown', (e) => {
  if (e.code !== 'Space' || e.repeat) return;
  e.preventDefault();
 
  if (!isOpened) {
    isOpened = true;
    cardFloatGroup.visible = true; // reveal the card now that the envelope is opening
    emergeTarget = 1; // flap swings toward OPEN_ANGLE and the card emerges, both in the animate loop
  } else {
    cardFlipTarget += Math.PI;
  }
});

/* ---- tap to open / flip, for touch devices ---- */
function handleAdvanceTap() {
  if (!isOpened) {
    isOpened = true;
    cardFloatGroup.visible = true;
    emergeTarget = 1;
  } else {
    cardFlipTarget += Math.PI;
  }
}

let touchStart = null;

canvas.addEventListener('touchstart', (e) => {
  if (e.touches.length !== 1) return;
  const t = e.touches[0];
  touchStart = { x: t.clientX, y: t.clientY, time: performance.now() };
}, { passive: true });

canvas.addEventListener('touchend', (e) => {
  if (!touchStart) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStart.x;
  const dy = t.clientY - touchStart.y;
  const dist = Math.hypot(dx, dy);
  const duration = performance.now() - touchStart.time;
  touchStart = null;

  // Only treat it as a tap if the finger didn't move much and it was quick
  if (dist < 12 && duration < 400) {
    handleAdvanceTap();
  }
}, { passive: true });
 
/* ============================================================================
   ANIMATION LOOP
   ============================================================================ */
const clock = new THREE.Clock();
 
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.elapsedTime;
 
  // gentle starfield drift
  stars.rotation.y += dt * 0.01;
 
  // --- envelope rotation: drag + inertia + idle auto-spin ---
  if (!isDragging) {
    dragVel.x = THREE.MathUtils.damp(dragVel.x, 0, 3, dt);
    dragVel.y = THREE.MathUtils.damp(dragVel.y, 0, 3, dt);
    envEuler.y += dragVel.x;
    envEuler.x += dragVel.y;
    if (!isOpened) envEuler.y += AUTO_ROTATE_SPEED * dt;
  }
  envelopeGroup.rotation.set(envEuler.x, envEuler.y, 0);
 
  // --- envelope + card gentle floating bob ---
  envelopeFloatGroup.position.y = Math.sin(elapsed * 0.6) * 0.12;
  envelopeFloatGroup.position.x = Math.sin(elapsed * 0.35) * 0.06;
  cardFloatGroup.position.y = Math.sin(elapsed * 0.6 + 2.1) * 0.12;
  cardFloatGroup.position.x = Math.sin(elapsed * 0.35 + 1.2) * 0.06;
 
  // --- flap opening ---
  const flapTarget = isOpened ? OPEN_ANGLE : 0;
  flapAngle = THREE.MathUtils.damp(flapAngle, flapTarget, 3.5, dt);
  topFlapPivot.rotation.x = flapAngle;
 
  // --- card emerging from the envelope ---
  emergeProgress = THREE.MathUtils.damp(emergeProgress, emergeTarget, 3, dt);
  cardGroup.position.lerpVectors(CARD_TUCKED.pos, CARD_EMERGED.pos, emergeProgress);
  const scale = THREE.MathUtils.lerp(CARD_TUCKED.scale, CARD_EMERGED.scale, emergeProgress);
  cardGroup.scale.setScalar(scale);
 
  // --- card flip (infinitely repeatable) ---
  cardFlipCurrent = THREE.MathUtils.damp(cardFlipCurrent, cardFlipTarget, 6, dt);
  cardGroup.rotation.y = cardFlipCurrent;
 
  renderer.render(scene, camera);
}
 
animate();