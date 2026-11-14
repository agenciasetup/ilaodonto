# Landing Page · Instituto Leliane Andrade (ILA Odonto)

Site estático, sem build: `index.html` + `css/estilo.css` + `js/`. Para publicar, suba a pasta inteira (Vercel, Netlify, Cloudflare Pages, Hostinger).
Three.js e GSAP vêm de CDN (jsDelivr, versões fixas no `importmap` do `index.html`).

## Versões
- `index.html`: hero creme, símbolo 3D em cerâmica verde
- `hero-verde.html`: hero verde-escuro com logo creme e símbolo 3D em cerâmica creme

As duas usam o mesmo `css/estilo.css` e o mesmo `js/`. A diferença é só a classe `hero-verde` no `<body>` e as duas versões do logo no cabeçalho. Para adotar a verde de vez, basta renomear `hero-verde.html` para `index.html`.

## Conceito: uma visita ao Instituto
Cada seção é um ambiente da clínica, com placa numerada e o selo "Você está na…" no canto da tela.

| # | Ambiente | Conteúdo | Movimento |
|---|---|---|---|
| 1 | Recepção | Título, CTA, credenciais | Símbolo da marca em 3D que segue o cursor, chips que flutuam |
| 2 | Sala de espera | As frases de quem tem medo | Lado fixo, frases surgindo |
| 3 | Sala de conversa | Protocolo TMB + 4 passos | Letra T/M/B fixa que troca com a rolagem |
| 4 | Consultório | 7 tratamentos (inclui sem metais) | Scroll horizontal no computador, carrossel no celular |
| 5 | Jardim interno | Odontologia integrativa | Círculos boca/corpo/mente se juntando |
| 6 | Sala da Dra. | Bio e CROs | Parallax na foto |
| 7 | Mural | Depoimentos | |
| 8 | Onde atendemos | Porto Velho, Caxias do Sul e online | |
| 9 | Agenda | Ficha que envia para o WhatsApp | |
| 10 | Dúvidas | FAQ | |
| 11 | Saída | CTA final + rodapé com responsável técnica | Símbolo girando no fundo |

As salas coloridas (3, 5, 9) abrem como uma porta ao entrar na tela. Com "reduzir movimento" ligado no sistema, tudo aparece parado e o 3D vira o símbolo plano.

## Identidade (manual R-COSTA)
- Cores: verde neutro `#647E6C`, creme `#F8EED9`, laranja `#FF641A`, verde escuro `#275037`
- Títulos: Fraunces (serifa suave, com itálico de destaque). Texto: Nunito, substituta livre da Urbane Rounded da marca.
- Logos e elementos em `assets/brand/` (creme, verde e laranja).

## Falta preencher
- [ ] `assets/fotos/dra-leliane.jpg` (vertical 4:5, foto original sem texto por cima)
- [ ] `assets/fotos/depoimento-1.jpg` e `depoimento-2.jpg` (só depoimentos reais e autorizados)
- [ ] Endereços completos das unidades (procure `ENDEREÇO` no `index.html`)

## A Dra. precisa confirmar
- [ ] Como funciona o atendimento em Porto Velho e em Caxias do Sul (fixo ou por períodos)
- [ ] O que ela oferece em "Produtos e treinamentos"
- [ ] Os textos de "Odontologia sem metais" e do atendimento online
- [ ] Usar no Mural a história da paciente de 6 anos (já publicada por ela no Instagram)

A copy segue o briefing e a voz do Instagram (@ilaodonto): frases riscadas dos carrosséis, método "avaliação, critério, tempo", nome "ILA".

WhatsApp: `WHATSAPP = "5569999021899"` em `js/site.js`.

## Rodar local
```bash
python3 -m http.server 4387
```
O 3D carrega o SVG por `fetch`, então abra por um servidor, não direto pelo arquivo.
