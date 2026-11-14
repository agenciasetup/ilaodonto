// Animações: entrada do título, elementos surgindo, portas que abrem, TMB com letra fixa,
// consultório em scroll horizontal, círculos do jardim e chips que flutuam com o cursor.
// Quem pediu "reduzir movimento" no sistema vê tudo parado e completo.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;

window.__animado = true;

if (!reduzir) {
  gsap.registerPlugin(ScrollTrigger);
  const ease = "power3.out";

  // 1. Título da recepção, linha por linha
  gsap.from(".recepcao h1 .linha > span", { yPercent: 110, duration: 1.2, ease: "power4.out", stagger: 0.09, delay: 0.15 });

  // 2. Elementos que surgem
  gsap.utils.toArray("[data-surgir]").forEach((el) => {
    gsap.fromTo(el, { autoAlpha: 0, y: 30 }, {
      autoAlpha: 1, y: 0, duration: 1, ease,
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
    });
  });
  gsap.utils.toArray("[data-surgir-grupo]").forEach((g) => {
    gsap.from(g.children, {
      autoAlpha: 0, y: 26, duration: 0.9, ease, stagger: 0.08,
      scrollTrigger: { trigger: g, start: "top 86%", once: true },
    });
  });

  // 3. Portas: os ambientes de cor abrem como uma porta (o recorte se expande)
  gsap.utils.toArray(".porta").forEach((sala) => {
    gsap.fromTo(sala, { clipPath: "inset(6% 4% 0% 4% round 56px)" }, {
      clipPath: "inset(0% 0% 0% 0% round 56px)", ease: "none",
      scrollTrigger: { trigger: sala, start: "top bottom", end: "top 25%", scrub: true },
    });
  });

  // 4. Parallax das fotos
  gsap.utils.toArray("[data-parallax]").forEach((img) => {
    gsap.fromTo(img, { yPercent: -6 }, {
      yPercent: 6, ease: "none",
      scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  // 5. Protocolo TMB: a letra fica parada e troca conforme o texto passa (só no computador)
  ScrollTrigger.matchMedia({
    "(min-width: 1021px)": () => {
      const letras = document.querySelectorAll(".tmb-letra span");
      const itens = document.querySelectorAll(".tmb-item");
      const ativar = (i) => {
        letras.forEach((l, k) => l.classList.toggle("ativa", k === i));
        itens.forEach((it, k) => it.classList.toggle("ativo", k === i));
      };
      const triggers = [...itens].map((it, i) => ScrollTrigger.create({
        trigger: it, start: "top 55%", end: "bottom 55%",
        onToggle: (s) => s.isActive && ativar(i),
      }));
      gsap.to(".tmb-letra .anel", {
        rotate: 120, ease: "none",
        scrollTrigger: { trigger: ".tmb", start: "top bottom", end: "bottom top", scrub: true },
      });
      return () => { triggers.forEach((t) => t.kill()); itens.forEach((it) => it.classList.add("ativo")); };
    },
  });

  // 6. Consultório em scroll horizontal (computador). No celular: carrossel de deslizar.
  const secao = document.querySelector("[data-horizontal]");
  const trilho = secao?.querySelector("[data-trilho]");
  const barra = secao?.querySelector("[data-progresso]");
  if (secao && trilho) {
    ScrollTrigger.matchMedia({
      "(min-width: 861px)": () => {
        secao.classList.add("travado");
        const distancia = () => trilho.scrollWidth - innerWidth;
        const anim = gsap.to(trilho, {
          x: () => -distancia(), ease: "none",
          scrollTrigger: {
            trigger: secao, start: "top top", end: () => "+=" + distancia(), scrub: 0.7, pin: true,
            invalidateOnRefresh: true, anticipatePin: 1,
            onUpdate: (s) => { if (barra) barra.style.transform = "scaleX(" + s.progress + ")"; },
          },
        });
        trilho.querySelectorAll("[data-parallax-x]").forEach((img) => {
          gsap.fromTo(img, { xPercent: -14, rotate: -8 }, {
            xPercent: 14, rotate: 8, ease: "none",
            scrollTrigger: { trigger: img.closest(".cadeira"), containerAnimation: anim, start: "left right", end: "right left", scrub: true },
          });
        });
        return () => secao.classList.remove("travado");
      },
    });
  }

  // 7. Jardim: os três círculos se aproximam até se sobreporem
  const circ = gsap.utils.toArray(".circulos [data-circulo]");
  if (circ.length) {
    gsap.timeline({ scrollTrigger: { trigger: ".circulos", start: "top 85%", end: "center 50%", scrub: 0.8 } })
      .from(".circulos .boca", { y: -70, x: 0, opacity: 0.2 }, 0)
      .from(".circulos .corpo", { x: -80, y: 40, opacity: 0.2 }, 0)
      .from(".circulos .mente", { x: 80, y: 40, opacity: 0.2 }, 0)
      .from(".circulos .centro", { scale: 0, rotate: -90 }, 0.3);
  }

  // 8. Símbolo da saída gira devagar com a rolagem
  gsap.to("[data-gira]", { rotate: 90, ease: "none", scrollTrigger: { trigger: ".saida", start: "top bottom", end: "bottom top", scrub: true } });

  // 9. Chips da recepção flutuam com o cursor, cada um numa profundidade
  if (matchMedia("(hover: hover)").matches) {
    const chips = gsap.utils.toArray("[data-flutua]").map((c) => ({
      x: gsap.quickTo(c, "x", { duration: 1.2, ease }),
      y: gsap.quickTo(c, "y", { duration: 1.2, ease }),
      p: Number(c.dataset.flutua) || 20,
    }));
    addEventListener("pointermove", (e) => {
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      chips.forEach((m) => { m.x(nx * m.p); m.y(ny * m.p); });
    }, { passive: true });
  }

  // Fontes e imagens mudam as medidas: recalcula quando tudo carrega
  addEventListener("load", () => ScrollTrigger.refresh());
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
} else {
  document.querySelectorAll(".tmb-item").forEach((it) => it.classList.add("ativo"));
}
