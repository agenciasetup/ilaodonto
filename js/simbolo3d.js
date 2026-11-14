// Símbolo do Instituto em 3D (Three.js): o SVG da marca vira uma peça de cerâmica verde,
// com bordas arredondadas, que flutua devagar e se vira para o cursor (ou para o dedo, no celular).
// Sem WebGL ou com "reduzir movimento": fica o SVG plano.
import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const palco = document.getElementById("palco");
const canvas = palco?.querySelector("canvas");
const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
const temWebGL = (() => { try { return !!document.createElement("canvas").getContext("webgl2"); } catch { return false; } })();

if (palco && canvas && temWebGL && !reduzir) {
  iniciar().catch((e) => { console.warn("3D indisponível, usando o símbolo plano.", e); palco.classList.remove("com-3d"); });
}

async function iniciar() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const cena = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  cena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  cena.environmentIntensity = document.body.classList.contains("hero-verde") ? 0.4 : 0.55;

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 0, 12.5);

  // Luz de estúdio suave: chave quente, contorno laranja discreto, preenchimento sálvia
  const chave = new THREE.DirectionalLight(0xfff1dc, 2.4); chave.position.set(-4, 5, 6); cena.add(chave);
  const contorno = new THREE.DirectionalLight(0xff8a4c, 1.6); contorno.position.set(5, -1, -3); cena.add(contorno);
  const preenche = new THREE.DirectionalLight(0xc9d8cd, 0.8); preenche.position.set(4, 2, 5); cena.add(preenche);
  cena.add(new THREE.HemisphereLight(0xfbf6ec, 0x5d7563, 0.6));

  // O símbolo, a partir do SVG oficial
  const dados = await new SVGLoader().loadAsync("assets/brand/simbolo-verde.svg");
  const formas = dados.paths.flatMap((p) => SVGLoader.createShapes(p));
  const geo = new THREE.ExtrudeGeometry(formas, {
    depth: 70, curveSegments: 28,
    bevelEnabled: true, bevelThickness: 16, bevelSize: 9, bevelSegments: 10,
  });
  geo.center();
  const escala = 4.4 / 1000;
  geo.scale(escala, -escala, escala); // SVG tem o Y para baixo
  geo.computeVertexNormals();

  // Sobre o creme: cerâmica verde. Sobre a hero verde: cerâmica creme.
  const sobreVerde = document.body.classList.contains("hero-verde");
  const ceramica = new THREE.MeshPhysicalMaterial({
    color: sobreVerde ? 0xf1e6cf : 0x5f7b67, roughness: sobreVerde ? 0.38 : 0.32, metalness: 0,
    clearcoat: 1, clearcoatRoughness: 0.18,
    sheen: 0.6, sheenColor: new THREE.Color(sobreVerde ? 0xfff6e6 : 0xdfe9e1), sheenRoughness: 0.5,
  });
  const simbolo = new THREE.Mesh(geo, ceramica);
  // as faces da frente invertem ao espelhar o Y: corrige o lado visível
  ceramica.side = THREE.DoubleSide;

  const grupo = new THREE.Group();
  grupo.add(simbolo);
  cena.add(grupo);

  // Pequenas esferas creme orbitando, como bolhas de ozônio
  const bolhas = new THREE.Group();
  const matBolha = new THREE.MeshPhysicalMaterial({ color: 0xf8eed9, roughness: 0.15, clearcoat: 1, transmission: 0.25, thickness: 0.5 });
  const matLaranja = new THREE.MeshPhysicalMaterial({ color: 0xff641a, roughness: 0.3, clearcoat: 1 });
  const dadosBolhas = [
    [2.6, 1.6, 0.9, 0.16, matBolha], [-2.7, -1.3, 1.1, 0.12, matBolha], [2.1, -2.2, -0.6, 0.1, matLaranja],
    [-2.2, 2.2, -0.8, 0.09, matBolha], [0.4, 2.8, 1.2, 0.07, matLaranja],
  ];
  dadosBolhas.forEach(([x, y, z, r, m], i) => {
    const b = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 32), m);
    b.position.set(x, y, z); b.userData = { base: b.position.clone(), fase: i * 1.3 };
    bolhas.add(b);
  });
  cena.add(bolhas);

  function dimensionar() {
    const r = canvas.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
  }
  dimensionar();
  new ResizeObserver(dimensionar).observe(palco);

  // Para onde olhar: cursor no computador, dedo no celular
  const alvo = { x: 0, y: 0 };
  const mirar = (px, py) => {
    const r = palco.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    alvo.x = Math.max(-1, Math.min(1, (px - cx) / (innerWidth * 0.5)));
    alvo.y = Math.max(-1, Math.min(1, (py - cy) / (innerHeight * 0.5)));
  };
  let ultimoToque = -1e9;
  addEventListener("pointermove", (e) => { if (e.pointerType !== "mouse") return; mirar(e.clientX, e.clientY); ultimoToque = performance.now(); }, { passive: true });

  // Arrastar para girar (dedo ou mouse), com inércia. Na vertical a página continua rolando (touch-action: pan-y).
  let arrasto = 0, vel = 0, xAnt = null, tAnt = 0;
  palco.addEventListener("pointerdown", (e) => { xAnt = e.clientX; tAnt = performance.now(); vel = 0; palco.classList.add("girou"); });
  addEventListener("pointermove", (e) => {
    if (xAnt === null) return;
    const agora = performance.now(), dx = e.clientX - xAnt;
    arrasto += dx * 0.012;
    vel = (dx * 0.012) / Math.max(16, agora - tAnt) * 16;
    xAnt = e.clientX; tAnt = agora;
  }, { passive: true });
  const soltar = () => { xAnt = null; };
  addEventListener("pointerup", soltar); addEventListener("pointercancel", soltar);
  const celular = matchMedia("(max-width: 820px)");

  let visivel = true;
  new IntersectionObserver((e) => { visivel = e[0].isIntersecting; }).observe(palco);

  palco.classList.add("com-3d");
  renderer.render(cena, camera);
  requestAnimationFrame(() => palco.classList.add("pronto"));

  const inicio = performance.now();
  const giro = { x: 0, y: 0 };
  renderer.setAnimationLoop(() => {
    if (!visivel) return;
    const t = (performance.now() - inicio) / 1000;
    const parado = performance.now() - ultimoToque > 2500 && xAnt === null && Math.abs(vel) < 0.002;
    // sem cursor por perto, ele "respira" sozinho
    const tx = parado ? Math.sin(t * 0.45) * 0.35 : alvo.x * 0.75;
    const ty = parado ? Math.cos(t * 0.35) * 0.12 : alvo.y * 0.45;
    giro.x += (tx - giro.x) * 0.05;
    giro.y += (ty - giro.y) * 0.05;
    const rolagem = Math.min(1, scrollY / innerHeight);
    if (xAnt === null) { arrasto += vel; vel *= 0.95; }
    grupo.rotation.y = giro.x + rolagem * (celular.matches ? 0.6 : 1.2) + arrasto;
    grupo.rotation.x = giro.y - 0.05;
    grupo.rotation.z = Math.sin(t * 0.3) * 0.04;
    grupo.position.y = Math.sin(t * 0.9) * 0.08 - rolagem * 0.4;
    bolhas.children.forEach((b) => {
      const { base, fase } = b.userData;
      b.position.set(base.x + giro.x * 0.5, base.y + Math.sin(t * 0.8 + fase) * 0.18 - giro.y * 0.4, base.z);
    });
    bolhas.rotation.y = giro.x * 0.3;
    renderer.render(cena, camera);
  });
}
