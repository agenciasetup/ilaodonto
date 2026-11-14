// Funções da página que não dependem de animação: WhatsApp, formulário, cabeçalho e o "você está na".
(function () {
  const WHATSAPP = "5569999021899"; // (69) 99902-1899
  const linkZap = (msg) => "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg);

  document.querySelectorAll(".js-zap").forEach((a) => {
    a.href = linkZap(a.dataset.msg || "Olá! Vim pelo site.");
    a.target = "_blank";
    a.rel = "noopener";
  });

  // Ficha de chegada -> WhatsApp com tudo escrito
  const form = document.getElementById("ficha");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const obrig = ["nome", "telefone", "cidade"];
    let primeiro = null;
    obrig.forEach((k) => {
      const campo = form.elements[k].closest(".campo");
      const vazio = !String(d.get(k) || "").trim();
      campo.classList.toggle("erro", vazio);
      if (vazio && !primeiro) primeiro = form.elements[k];
    });
    if (primeiro) { primeiro.focus(); return; }
    const linhas = [
      "Olá, Dra. Leliane! Vim pelo site e quero agendar uma avaliação.",
      "",
      "Nome: " + d.get("nome"),
      "WhatsApp: " + d.get("telefone"),
      "Cidade: " + d.get("cidade"),
      "Motivo: " + d.get("motivo"),
    ];
    const extra = String(d.get("mensagem") || "").trim();
    if (extra) linhas.push("Mensagem: " + extra);
    window.open(linkZap(linhas.join("\n")), "_blank", "noopener");
  });

  document.getElementById("telefone").addEventListener("input", (e) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 11);
    if (v.length > 6) v = "(" + v.slice(0, 2) + ") " + v.slice(2, 7) + "-" + v.slice(7);
    else if (v.length > 2) v = "(" + v.slice(0, 2) + ") " + v.slice(2);
    else if (v.length) v = "(" + v;
    e.target.value = v;
  });

  // Cabeçalho: fica sólido ao rolar, se esconde ao descer e volta ao subir
  const topo = document.getElementById("topo");
  let ultimo = 0;
  const aoRolar = () => {
    const y = window.scrollY;
    topo.classList.toggle("solido", y > 30);
    topo.classList.toggle("escondido", y > 500 && y > ultimo + 4);
    if (y < ultimo - 4) topo.classList.remove("escondido");
    ultimo = y;
  };
  aoRolar();
  addEventListener("scroll", aoRolar, { passive: true });

  // "Você está na": mostra o ambiente atual
  const placa = document.getElementById("voce-esta");
  const num = placa.querySelector("b");
  const nome = placa.querySelector(".nome");
  const salas = document.querySelectorAll("[data-sala]");
  const io = new IntersectionObserver((itens) => {
    itens.forEach((i) => {
      if (!i.isIntersecting) return;
      const s = i.target;
      num.textContent = s.dataset.sala;
      nome.textContent = s.dataset.nome;
      placa.classList.toggle("ativo", s.dataset.sala !== "1" && s.dataset.sala !== "11");
    });
  }, { rootMargin: "-45% 0px -54% 0px" });
  salas.forEach((s) => io.observe(s));

  document.getElementById("ano").textContent = new Date().getFullYear();

  // Segurança: se as animações não carregarem (sem internet para o GSAP), mostra tudo
  setTimeout(() => { if (!window.__animado) document.documentElement.classList.remove("anima"); }, 2500);
})();

// ==========================================================
// Celular com cara de app: abas, folha da ficha, stories e carrossel
// ==========================================================
(function () {
  const celular = matchMedia("(max-width: 820px)");
  const vibrar = () => { try { navigator.vibrate && navigator.vibrate(8); } catch (e) {} };
  const topo = document.getElementById("topo");

  // ---- Abas: marca a aba do ambiente atual e mostra o nome no cabeçalho ----
  const abas = document.querySelectorAll(".abas a[data-aba]");
  const abaDe = { recepcao: "recepcao", espera: "recepcao", conversa: "conversa", consultorio: "consultorio", jardim: "consultorio", dra: "dra", mural: "dra", enderecos: "dra", agenda: "dra", duvidas: "dra", saida: "dra" };
  const io = new IntersectionObserver((itens) => {
    itens.forEach((i) => {
      if (!i.isIntersecting) return;
      const id = i.target.id;
      abas.forEach((a) => a.classList.toggle("ativa", a.dataset.aba === abaDe[id]));
      topo.dataset.ambiente = i.target.dataset.sala + " · " + i.target.dataset.nome;
    });
  }, { rootMargin: "-45% 0px -54% 0px" });
  document.querySelectorAll("[data-sala]").forEach((s) => io.observe(s));
  abas.forEach((a) => a.addEventListener("click", vibrar));

  // ---- Folha (bottom sheet) com a ficha de chegada ----
  const folha = document.getElementById("folha");
  const fundo = document.getElementById("folha-fundo");
  const corpo = document.getElementById("folha-corpo");
  const ficha = document.getElementById("ficha");
  const lugar = document.getElementById("lugar-ficha");
  const abrir = () => {
    if (!celular.matches) { document.getElementById("agenda").scrollIntoView({ behavior: "smooth" }); return; }
    vibrar();
    corpo.appendChild(ficha);
    ficha.style.opacity = "1"; ficha.style.visibility = "visible"; ficha.style.transform = "none";
    folha.hidden = false; fundo.hidden = false;
    document.documentElement.classList.add("folha-aberta");
    requestAnimationFrame(() => requestAnimationFrame(() => { folha.classList.add("aberta"); fundo.classList.add("aberta"); }));
    setTimeout(() => document.getElementById("nome").focus({ preventScroll: true }), 450);
  };
  const fechar = () => {
    folha.classList.remove("aberta", "arrastando"); fundo.classList.remove("aberta");
    folha.style.transform = "";
    document.documentElement.classList.remove("folha-aberta");
    setTimeout(() => {
      folha.hidden = true; fundo.hidden = true;
      lugar.after(ficha);
    }, 450);
  };
  document.getElementById("abrir-ficha").addEventListener("click", abrir);
  document.getElementById("fechar-ficha").addEventListener("click", fechar);
  fundo.addEventListener("click", fechar);
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !folha.hidden) fechar(); });
  // Arrastar a alça para baixo fecha
  let y0 = null, dy = 0;
  folha.querySelectorAll(".folha-alca, .folha-topo").forEach((alca) => {
    alca.addEventListener("pointerdown", (e) => { if (e.target.closest("button")) return; y0 = e.clientY; dy = 0; folha.classList.add("arrastando"); alca.setPointerCapture(e.pointerId); });
    alca.addEventListener("pointermove", (e) => { if (y0 === null) return; dy = Math.max(0, e.clientY - y0); folha.style.transform = "translateY(" + dy + "px)"; });
    const soltar = () => { if (y0 === null) return; y0 = null; folha.classList.remove("arrastando"); folha.style.transform = ""; if (dy > 110) fechar(); };
    alca.addEventListener("pointerup", soltar); alca.addEventListener("pointercancel", soltar);
  });

  // ---- Sala de espera em stories ----
  const caixa = document.getElementById("stories");
  const frases = [...document.querySelectorAll(".pensamentos li")].map((li) => li.innerHTML);
  const virada = document.querySelector(".espera .virada p")?.innerHTML;
  if (caixa && frases.length) {
    const total = frases.length + 1;
    caixa.innerHTML =
      '<div class="stories-barras">' + Array.from({ length: total }, () => "<i><b></b></i>").join("") + "</div>" +
      '<div class="stories-cab"><img src="assets/brand/simbolo-verde.svg" alt="">Sala de espera <span>· ILA</span></div>' +
      frases.map((f, i) => '<div class="story"><img class="fundo" src="assets/brand/simbolo-creme.svg" alt=""><small>0' + (i + 1) + " · VOCÊ JÁ DISSE ISSO?</small><p>" + f + "</p></div>").join("") +
      '<div class="story final"><img class="fundo" src="assets/brand/simbolo-verde.svg" alt=""><small>E AGORA?</small><p>' + virada + "</p></div>" +
      '<div class="stories-toque"><button type="button" aria-label="Anterior"></button><button type="button" aria-label="Próximo"></button></div>' +
      '<div class="stories-dica">Toque para avançar</div>';
    const slides = caixa.querySelectorAll(".story");
    const barras = caixa.querySelectorAll(".stories-barras i");
    const DUR = 4200;
    let atual = 0, anim = null, visivel = false, pausado = false;
    const mostrar = (n) => {
      atual = (n + total) % total;
      slides.forEach((s, k) => s.classList.toggle("atual", k === atual));
      barras.forEach((b, k) => { b.classList.toggle("feita", k < atual); b.firstChild.getAnimations().forEach((a) => a.cancel()); });
      caixa.classList.toggle("no-final", atual === total - 1);
      anim = barras[atual].firstChild.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: DUR, fill: "forwards" });
      anim.onfinish = () => mostrar(atual + 1);
      if (!visivel || pausado) anim.pause();
    };
    const [ant, prox] = caixa.querySelectorAll(".stories-toque button");
    ant.addEventListener("click", () => { vibrar(); mostrar(atual - 1); });
    prox.addEventListener("click", () => { vibrar(); mostrar(atual + 1); });
    // segurar pausa, como nos stories
    caixa.addEventListener("pointerdown", () => { pausado = true; anim && anim.pause(); });
    ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => caixa.addEventListener(ev, () => { pausado = false; visivel && anim && anim.play(); }));
    new IntersectionObserver((e) => { visivel = e[0].isIntersecting; if (!anim) return; visivel && !pausado ? anim.play() : anim.pause(); }, { threshold: 0.6 }).observe(caixa);
    const ligar = () => { caixa.hidden = !celular.matches; };
    ligar(); celular.addEventListener("change", ligar);
    mostrar(0);
  }

  // ---- Consultório: pontos e cartões de fora menores ----
  const trilhoEl = document.querySelector("[data-trilho]");
  const rolador = document.querySelector(".consultorio-fixo");
  const pontos = document.getElementById("pontos");
  const cadeiras = [...document.querySelectorAll(".cadeira")];
  if (trilhoEl && rolador && pontos) {
    pontos.innerHTML = cadeiras.map(() => "<i></i>").join("");
    const bolinhas = pontos.querySelectorAll("i");
    let ultimo = -1;
    const atualizar = () => {
      if (!celular.matches) return;
      const centro = rolador.scrollLeft + rolador.clientWidth / 2;
      let melhor = 0, dist = Infinity;
      cadeiras.forEach((c, k) => {
        const meio = c.offsetLeft + c.offsetWidth / 2;
        const d = Math.abs(meio - centro);
        if (d < dist) { dist = d; melhor = k; }
        c.classList.toggle("longe", d > c.offsetWidth * 0.55);
      });
      const naAbertura = rolador.scrollLeft < cadeiras[0].offsetLeft - rolador.clientWidth * 0.5;
      bolinhas.forEach((b, k) => b.classList.toggle("ativo", !naAbertura && k === melhor));
      if (!naAbertura && melhor !== ultimo) { if (ultimo !== -1) vibrar(); ultimo = melhor; }
    };
    rolador.addEventListener("scroll", atualizar, { passive: true });
    atualizar();
  }
})();
