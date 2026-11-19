/* global React, ReactDOM */
const {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo
} = React;

/* ---------------- dados ---------------- */
const WHATS_NUMBER = "5511981346370";
const MAPS_URL = "https://maps.app.goo.gl/GfpdgcHVXvJEF7316";
const INSTAGRAM_URL = "https://www.instagram.com/nazza_barbearia/";
const ADDRESS = "Av. João de Andrade, 685, Santo Antônio, Osasco/SP · 06132-002";
const LAT = -23.5534,
  LON = -46.8009;
const SERVICES = [{
  id: "classico",
  num: "01",
  name: "Corte Clássico",
  time: "40 min",
  desc: "Tesoura e máquina com acabamento na navalha. O corte atemporal, alinhado ao seu estilo e finalizado com produto na medida."
}, {
  id: "moderno",
  num: "02",
  name: "Corte Moderno",
  time: "45 min",
  desc: "Fade, degradê, texturizado e riscos. As tendências do momento executadas com precisão milimétrica.",
  hot: true
}, {
  id: "combo",
  num: "03",
  name: "Corte + Barba",
  time: "1h15",
  desc: "O ritual completo: corte sob medida mais barba desenhada com toalha quente, navalha e finalização com balm."
}, {
  id: "infantil",
  num: "04",
  name: "Corte Infantil",
  time: "30 min",
  desc: "Paciência e cuidado com os pequenos. Um corte caprichado para o filho sair se sentindo gente grande."
}, {
  id: "barba",
  num: "05",
  name: "Barba",
  time: "30 min",
  desc: "Desenho completo com toalha quente, navalha e hidratação. Contornos definidos e pele confortável."
}, {
  id: "sobrancelha",
  num: "06",
  name: "Sobrancelha",
  time: "15 min",
  desc: "Limpeza e alinhamento na navalha, respeitando o formato natural. O detalhe que muda o olhar."
}];
const GALLERY = [{
  src: "assets/g1.jpg",
  cap: "Degradê infantil",
  sub: "Fade limpo + contorno natural"
}, {
  src: "assets/g2.jpg",
  cap: "Máquina & tesoura",
  sub: "Acabamento fio a fio na cadeira"
}, {
  src: "assets/g3.jpg",
  cap: "Black power alinhado",
  sub: "Topo volumoso + fade na lateral"
}, {
  src: "assets/g4.jpg",
  cap: "Buzz cut na régua",
  sub: "Máquina baixa + contorno definido"
}, {
  src: "assets/g5.jpg",
  cap: "Social moderno",
  sub: "Penteado + laterais baixas"
}, {
  src: "assets/g6.jpg",
  cap: "Taper em cabelo crespo",
  sub: "Transição suave na nuca"
}];
const REVIEWS = [{
  name: "Edmilson Lima",
  meta: "Local Guide · 60 avaliações",
  color: "#e9b83d",
  text: "O Naza para mim é um excelente cabeleireiro, com atendimento muito bacana. A gente percebe como ele naturalmente tem capricho para fazer uma ótima entrega. Sabe aquela sensação de contentamento por um trabalho bem feito? É assim que me sinto quando corto com ele, que aliás faz alguns anos."
}, {
  name: "Douglas Marques",
  meta: "8 avaliações",
  color: "#dca43c",
  text: "Bons profissionais e excelente atendimento. Lugar limpo e organizado."
}, {
  name: "Caique Marchetti",
  meta: "6 avaliações",
  color: "#eed3a0",
  text: "Excelentes profissionais, entregam com qualidade o corte que o cliente pede."
}];
const FAQ = [{
  q: "Preciso agendar ou posso chegar direto?",
  a: "Os dois funcionam! Encaixes são bem-vindos conforme a disponibilidade da cadeira. Mas agendar pelo formulário ou WhatsApp garante o seu horário, sem espera."
}, {
  q: "Como funciona o agendamento pelo site?",
  a: "Em 3 passos: você preenche nome, WhatsApp, serviço e horário; confere o resumo; e confirma enviando a mensagem pronta pelo WhatsApp. A barbearia responde confirmando o horário em minutos, dentro do expediente."
}, {
  q: "Quais formas de pagamento vocês aceitam?",
  a: "Cartão de crédito, cartão de débito e pagamento por aproximação (NFC / celular). Também aceitamos Pix e dinheiro."
}, {
  q: "Cortam cabelo infantil? A partir de que idade?",
  a: "Sim! O corte infantil é feito com paciência e cuidado, para qualquer idade em que a criança já consiga ficar sentada na cadeira. Agende num horário mais tranquilo para uma experiência ainda melhor."
}, {
  q: "E se eu precisar cancelar ou remarcar?",
  a: "Sem burocracia: é só avisar pelo WhatsApp (11) 98134-6370 com o máximo de antecedência que conseguir. A gente reagenda sem custo nenhum."
}];
const OPEN_MIN = 9 * 60,
  CLOSE_MIN = 19 * 60 + 30;
const SLOTS = [];
for (let m = OPEN_MIN; m <= CLOSE_MIN - 30; m += 30) {
  SLOTS.push(String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"));
}
function isOpenNow(d) {
  if (d.getDay() === 0) return false;
  const mins = d.getHours() * 60 + d.getMinutes();
  return mins >= OPEN_MIN && mins < CLOSE_MIN;
}
function todayISO() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function fmtDate(iso) {
  if (!iso) return "a definir";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long"
  });
}
function maskPhone(v) {
  const n = v.replace(/\D/g, "").slice(0, 11);
  if (n.length <= 2) return n;
  if (n.length <= 6) return "(" + n.slice(0, 2) + ") " + n.slice(2);
  if (n.length <= 10) return "(" + n.slice(0, 2) + ") " + n.slice(2, 6) + "-" + n.slice(6);
  return "(" + n.slice(0, 2) + ") " + n.slice(2, 7) + "-" + n.slice(7);
}

/* ---------------- ícones ---------------- */
const WhatsIcon = () => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m0 1.67c2.2 0 4.27.86 5.82 2.42a8.2 8.2 0 0 1 2.42 5.82c0 4.54-3.7 8.24-8.25 8.24-1.48 0-2.93-.4-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24M8.53 7.33c-.16 0-.43.06-.66.31-.22.25-.87.85-.87 2.07 0 1.22.89 2.4 1 2.56.13.17 1.76 2.67 4.25 3.73 2.08.88 2.5.7 2.95.66.45-.04 1.45-.59 1.65-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.47-.28-.25-.13-1.45-.72-1.68-.8-.22-.08-.39-.12-.55.12-.16.25-.63.8-.77.96-.14.17-.29.19-.53.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.55-1.34-.76-1.84-.2-.48-.4-.42-.55-.42-.14-.01-.3-.02-.46-.02"
}));
const InstaIcon = () => /*#__PURE__*/React.createElement("svg", {
  width: "16",
  height: "16",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("rect", {
  x: "2",
  y: "2",
  width: "20",
  height: "20",
  rx: "5"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "4.5"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "17.5",
  cy: "6.5",
  r: "1.2",
  fill: "currentColor",
  stroke: "none"
}));
const ScissorsIcon = () => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("circle", {
  cx: "6",
  cy: "6",
  r: "3"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "6",
  cy: "18",
  r: "3"
}), /*#__PURE__*/React.createElement("path", {
  d: "M20 4 8.12 15.88"
}), /*#__PURE__*/React.createElement("path", {
  d: "M14.47 14.48 20 20"
}), /*#__PURE__*/React.createElement("path", {
  d: "M8.12 8.12 12 12"
}));
const CheckIcon = () => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2.4",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M20 6 9 17l-5-5"
}));
const XIcon = () => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2.2",
  strokeLinecap: "round",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M18 6 6 18"
}), /*#__PURE__*/React.createElement("path", {
  d: "m6 6 12 12"
}));
const StarIcon = () => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
}));
const StarSolidIcon = () => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  fill: "currentColor",
  stroke: "none",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
}));
const Stars = ({
  n = 5
}) => /*#__PURE__*/React.createElement(React.Fragment, null, Array.from({
  length: n
}, (_, i) => /*#__PURE__*/React.createElement(StarSolidIcon, {
  key: i
})));
const WarnIcon = () => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 9v4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 17h.01"
}));
const LockIcon = () => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("rect", {
  x: "3",
  y: "11",
  width: "18",
  height: "11",
  rx: "2"
}), /*#__PURE__*/React.createElement("path", {
  d: "M7 11V7a5 5 0 0 1 10 0v4"
}));
const ExpandIcon = () => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M15 3h6v6"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 21H3v-6"
}), /*#__PURE__*/React.createElement("path", {
  d: "M21 3l-7 7"
}), /*#__PURE__*/React.createElement("path", {
  d: "M3 21l7-7"
}));
const PlusIcon = () => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2.2",
  strokeLinecap: "round",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M12 5v14"
}), /*#__PURE__*/React.createElement("path", {
  d: "M5 12h14"
}));

/* ---------------- toasts ---------------- */
let toastSeq = 0;
function Toasts({
  items,
  dismiss
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "toasts",
    role: "status",
    "aria-live": "polite"
  }, items.map(t => /*#__PURE__*/React.createElement("div", {
    key: t.id,
    className: "toast " + t.kind + (t.leaving ? " leaving" : "")
  }, /*#__PURE__*/React.createElement("span", {
    className: "t-icon"
  }, t.kind === "success" ? /*#__PURE__*/React.createElement(CheckIcon, null) : t.kind === "error" ? /*#__PURE__*/React.createElement(XIcon, null) : /*#__PURE__*/React.createElement(ScissorsIcon, null)), /*#__PURE__*/React.createElement("span", null, t.msg), /*#__PURE__*/React.createElement("button", {
    onClick: () => dismiss(t.id),
    "aria-label": "Fechar aviso"
  }, /*#__PURE__*/React.createElement(XIcon, null)))));
}

/* ---------------- nav ---------------- */
const NAV_ITEMS = [["inicio", "Início"], ["servicos", "Serviços"], ["equipe", "A Equipe"], ["galeria", "Galeria"], ["avaliacoes", "Avaliações"], ["agendar", "Contato"]];
function Nav({
  active,
  open,
  setOpen,
  go
}) {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? window.scrollY / h * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearInterval(timer);
    };
  }, []);
  const aberto = isOpenNow(now);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "progress",
    style: {
      width: progress + "%"
    }
  }), /*#__PURE__*/React.createElement("header", {
    className: "nav" + (scrolled ? " scrolled" : "")
  }, /*#__PURE__*/React.createElement("div", {
    className: "nav-inner"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#inicio",
    className: "brand",
    onClick: e => {
      e.preventDefault();
      go("inicio");
    },
    "aria-label": "Nazza Barbearia, voltar ao in\xEDcio"
  }, /*#__PURE__*/React.createElement("span", {
    className: "brand-badge"
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/logo.png",
    alt: "Logo Nazza Barbearia"
  })), /*#__PURE__*/React.createElement("span", {
    className: "brand-name"
  }, "NAZZA", /*#__PURE__*/React.createElement("small", null, "BARBEARIA"))), /*#__PURE__*/React.createElement("nav", {
    className: "nav-links",
    "aria-label": "Se\xE7\xF5es do site"
  }, NAV_ITEMS.map(([id, label]) => /*#__PURE__*/React.createElement("a", {
    key: id,
    href: "#" + id,
    className: active === id ? "active" : "",
    onClick: e => {
      e.preventDefault();
      go(id);
    }
  }, label))), /*#__PURE__*/React.createElement("div", {
    className: "nav-cta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "status-pill " + (aberto ? "open" : "closed"),
    title: "Seg a S\xE1b, 9h \xE0s 19h30 \xB7 Domingo fechado"
  }, /*#__PURE__*/React.createElement("span", {
    className: "status-dot"
  }), aberto ? "Aberto · até 19h30" : "Fechado agora"), /*#__PURE__*/React.createElement("a", {
    href: "#agendar",
    className: "btn btn-primary btn-sm",
    onClick: e => {
      e.preventDefault();
      go("agendar");
    }
  }, "Agendar"), /*#__PURE__*/React.createElement("button", {
    className: "burger" + (open ? " open" : ""),
    onClick: () => setOpen(!open),
    "aria-label": open ? "Fechar menu" : "Abrir menu",
    "aria-expanded": open
  }, /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null))))), open && /*#__PURE__*/React.createElement("div", {
    className: "mobile-menu"
  }, NAV_ITEMS.map(([id, label]) => /*#__PURE__*/React.createElement("a", {
    key: id,
    href: "#" + id,
    className: active === id ? "active" : "",
    onClick: e => {
      e.preventDefault();
      go(id);
      setOpen(false);
    }
  }, label, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--brass)"
    }
  }, "\u2192"))), /*#__PURE__*/React.createElement("span", {
    className: "status-pill " + (aberto ? "open" : "closed"),
    style: {
      marginTop: 14,
      alignSelf: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "status-dot"
  }), aberto ? "Aberto agora · fecha às 19h30" : "Fechado agora · Seg a Sáb 9h às 19h30"), /*#__PURE__*/React.createElement("a", {
    href: "#agendar",
    className: "btn btn-primary",
    onClick: e => {
      e.preventDefault();
      go("agendar");
      setOpen(false);
    }
  }, "Agendar hor\xE1rio")));
}

/* ---------------- hero ---------------- */
function Hero({
  go
}) {
  return /*#__PURE__*/React.createElement("section", {
    className: "hero",
    id: "inicio"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-bg"
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/hero.jpg",
    alt: "",
    fetchpriority: "high"
  })), /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-content"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow rise d1"
  }, "Santo Ant\xF4nio \xB7 Osasco \xB7 dentro do Posto Ipiranga"), /*#__PURE__*/React.createElement("h1", {
    className: "rise d2"
  }, "Cortes que", /*#__PURE__*/React.createElement("br", null), "revelam", /*#__PURE__*/React.createElement("span", {
    className: "accent"
  }, "seu estilo")), /*#__PURE__*/React.createElement("p", {
    className: "hero-sub rise d3"
  }, "Um time de barbeiros com capricho em cada detalhe e atendimento de gente que conhece voc\xEA pelo nome. Corte cl\xE1ssico ou moderno, barba e sobrancelha, do jeito que voc\xEA pede."), /*#__PURE__*/React.createElement("div", {
    className: "hero-ctas rise d4"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#agendar",
    className: "btn btn-primary",
    onClick: e => {
      e.preventDefault();
      go("agendar");
    }
  }, "Agendar hor\xE1rio"), /*#__PURE__*/React.createElement("a", {
    href: "#servicos",
    className: "btn btn-ghost",
    onClick: e => {
      e.preventDefault();
      go("servicos");
    }
  }, "Servi\xE7os")), /*#__PURE__*/React.createElement("div", {
    className: "hero-stats rise d5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("b", null, "4.9", /*#__PURE__*/React.createElement("span", {
    className: "star"
  }, /*#__PURE__*/React.createElement(StarSolidIcon, null))), /*#__PURE__*/React.createElement("span", null, "Nota no Google")), /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("b", null, "50+"), /*#__PURE__*/React.createElement("span", null, "Avalia\xE7\xF5es reais")), /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("b", null, "6"), /*#__PURE__*/React.createElement("span", null, "Servi\xE7os completos")), /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("b", null, "1min"), /*#__PURE__*/React.createElement("span", null, "Para agendar"))))), /*#__PURE__*/React.createElement("span", {
    className: "scroll-hint rise d6"
  }, "role para explorar"));
}
function Marquee() {
  const items = ["Corte Clássico", "Corte Moderno", "Fade & Degradê", "Corte Infantil", "Barba na Navalha", "Sobrancelha", "Toalha Quente"];
  const row = items.map((t, i) => /*#__PURE__*/React.createElement("span", {
    key: i
  }, t, /*#__PURE__*/React.createElement("i", null, /*#__PURE__*/React.createElement(ScissorsIcon, null))));
  return /*#__PURE__*/React.createElement("div", {
    className: "marquee",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("div", {
    className: "marquee-track"
  }, row, row));
}

/* ---------------- serviços ---------------- */
function Services({
  pick
}) {
  return /*#__PURE__*/React.createElement("section", {
    className: "section",
    id: "servicos"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head center reveal"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "O que fazemos"), /*#__PURE__*/React.createElement("h2", {
    className: "h2"
  }, "Servi\xE7os & ", /*#__PURE__*/React.createElement("em", null, "rituais")), /*#__PURE__*/React.createElement("p", {
    className: "section-sub"
  }, "Escolha um servi\xE7o e o formul\xE1rio de agendamento j\xE1 vem preenchido para voc\xEA. Valores na cadeira ou pelo WhatsApp.")), /*#__PURE__*/React.createElement("div", {
    className: "services-grid"
  }, SERVICES.map((s, i) => /*#__PURE__*/React.createElement("article", {
    className: "service-card reveal",
    key: s.id,
    style: {
      transitionDelay: i % 3 * 0.08 + "s"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "service-top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "service-num"
  }, s.num), s.hot && /*#__PURE__*/React.createElement("span", {
    className: "badge-hot"
  }, "Mais pedido")), /*#__PURE__*/React.createElement("h3", null, s.name), /*#__PURE__*/React.createElement("p", null, s.desc), /*#__PURE__*/React.createElement("div", {
    className: "service-meta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "service-time"
  }, "\u2248 ", s.time), /*#__PURE__*/React.createElement("button", {
    className: "service-book",
    onClick: () => pick(s.id)
  }, "Agendar \u2192"))))), /*#__PURE__*/React.createElement("p", {
    className: "services-note reveal"
  }, "Encaixes s\xE3o bem-vindos quando a cadeira est\xE1 livre, ", /*#__PURE__*/React.createElement("b", null, "mas agendar garante o seu hor\xE1rio."))));
}

/* ---------------- equipe ---------------- */
function Team({
  go
}) {
  return /*#__PURE__*/React.createElement("section", {
    className: "section",
    id: "equipe"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap team-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "team-photo reveal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "team-main"
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/team.jpg",
    alt: "Equipe de barbeiros da Nazza Barbearia reunida na loja",
    loading: "lazy"
  }), /*#__PURE__*/React.createElement("div", {
    className: "exp-chip"
  }, /*#__PURE__*/React.createElement("b", null, "Equipe"), /*#__PURE__*/React.createElement("span", null, "unida pelo capricho"))), /*#__PURE__*/React.createElement("img", {
    className: "team-photo-extra",
    src: "assets/team2.jpg",
    alt: "Barbeiro da equipe Nazza fazendo um corte infantil",
    loading: "lazy"
  })), /*#__PURE__*/React.createElement("div", {
    className: "team-copy reveal"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Quem segura a tesoura"), /*#__PURE__*/React.createElement("h2", {
    className: "h2"
  }, "A ", /*#__PURE__*/React.createElement("em", null, "equipe"), " Nazza"), /*#__PURE__*/React.createElement("p", {
    className: "team-role"
  }, "Barbeiros \xB7 Um s\xF3 padr\xE3o de qualidade"), /*#__PURE__*/React.createElement("p", null, "A Nazza n\xE3o depende de um \xFAnico par de m\xE3os: \xE9 um time de barbeiros que trabalha junto, com o mesmo capricho e o mesmo padr\xE3o de acabamento. Quem chega pela primeira vez \xE9 recebido pelo nome; quem volta h\xE1 anos sabe que pode sentar em qualquer cadeira."), /*#__PURE__*/React.createElement("p", null, "Do cl\xE1ssico na tesoura ao fade navalhado, do corte infantil \xE0 barba desenhada, a equipe se complementa, e a loja, limpa e organizada, virou ponto de encontro do bairro Santo Ant\xF4nio."), /*#__PURE__*/React.createElement("ul", {
    className: "team-values"
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", {
    className: "v-ic"
  }, /*#__PURE__*/React.createElement(ScissorsIcon, null)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "M\xE3o treinada, olho no detalhe"), "Cada barbeiro domina do cl\xE1ssico ao moderno, com acabamento conferido antes de voc\xEA sair da cadeira.")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", {
    className: "v-ic"
  }, /*#__PURE__*/React.createElement(CheckIcon, null)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "Cadeira limpa e organizada"), "Material higienizado e bancada em ordem a cada atendimento, ponto elogiado nas avalia\xE7\xF5es.")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", {
    className: "v-ic"
  }, /*#__PURE__*/React.createElement(StarIcon, null)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "Atendimento que conhece voc\xEA"), "Time unido pelo mesmo capricho: o corte que voc\xEA pediu, do jeito que voc\xEA pediu."))), /*#__PURE__*/React.createElement("blockquote", {
    className: "team-quote"
  }, "\u201CBons profissionais e excelente atendimento. Lugar limpo e organizado.\u201D", /*#__PURE__*/React.createElement("footer", null, "Douglas Marques \xB7 avalia\xE7\xE3o no Google")), /*#__PURE__*/React.createElement("div", {
    className: "chips"
  }, /*#__PURE__*/React.createElement("span", {
    className: "chip"
  }, "Cortes cl\xE1ssicos"), /*#__PURE__*/React.createElement("span", {
    className: "chip"
  }, "Fades & modernos"), /*#__PURE__*/React.createElement("span", {
    className: "chip"
  }, "Barba na navalha"), /*#__PURE__*/React.createElement("span", {
    className: "chip"
  }, "Corte infantil")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 28
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#agendar",
    className: "btn btn-primary",
    onClick: e => {
      e.preventDefault();
      go("agendar");
    }
  }, "Agendar com a equipe")))));
}

/* ---------------- galeria + lightbox ---------------- */
function Gallery({
  notify
}) {
  const [idx, setIdx] = useState(null);
  const close = useCallback(() => setIdx(null), []);
  const step = useCallback(dir => setIdx(i => i === null ? null : (i + dir + GALLERY.length) % GALLERY.length), []);
  useEffect(() => {
    if (idx === null) return;
    const onKey = e => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [idx, close, step]);
  return /*#__PURE__*/React.createElement("section", {
    className: "section",
    id: "galeria"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head center reveal"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Trabalhos recentes"), /*#__PURE__*/React.createElement("h2", {
    className: "h2"
  }, "Na ", /*#__PURE__*/React.createElement("em", null, "cadeira")), /*#__PURE__*/React.createElement("p", {
    className: "section-sub"
  }, "Cada corte conta uma hist\xF3ria. Toque em uma foto para ampliar, use \u2190 \u2192 para navegar e Esc para fechar.")), /*#__PURE__*/React.createElement("div", {
    className: "gallery-grid"
  }, GALLERY.map((g, i) => /*#__PURE__*/React.createElement("button", {
    className: "gallery-item reveal",
    key: g.src,
    onClick: () => setIdx(i),
    style: {
      transitionDelay: i % 3 * 0.08 + "s"
    },
    "aria-label": "Ampliar foto: " + g.cap
  }, /*#__PURE__*/React.createElement("img", {
    src: g.src,
    alt: g.cap + ", " + g.sub,
    loading: "lazy"
  }), /*#__PURE__*/React.createElement("span", {
    className: "g-cap"
  }, g.cap, /*#__PURE__*/React.createElement("i", null, /*#__PURE__*/React.createElement(ExpandIcon, null))))))), idx !== null && /*#__PURE__*/React.createElement("div", {
    className: "lightbox",
    onClick: close,
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "Foto ampliada"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lb-count"
  }, String(idx + 1).padStart(2, "0"), " / ", String(GALLERY.length).padStart(2, "0")), /*#__PURE__*/React.createElement("button", {
    className: "lb-close",
    onClick: close,
    "aria-label": "Fechar foto (Esc)"
  }, /*#__PURE__*/React.createElement(XIcon, null)), /*#__PURE__*/React.createElement("button", {
    className: "lb-btn lb-prev",
    onClick: e => {
      e.stopPropagation();
      step(-1);
    },
    "aria-label": "Foto anterior (seta esquerda)"
  }, "\u2039"), /*#__PURE__*/React.createElement("figure", {
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("img", {
    key: idx,
    src: GALLERY[idx].src,
    alt: GALLERY[idx].cap
  }), /*#__PURE__*/React.createElement("figcaption", null, GALLERY[idx].cap, /*#__PURE__*/React.createElement("small", null, GALLERY[idx].sub, " \xB7 Esc fecha \xB7 \u2190 \u2192 navega"))), /*#__PURE__*/React.createElement("button", {
    className: "lb-btn lb-next",
    onClick: e => {
      e.stopPropagation();
      step(1);
    },
    "aria-label": "Pr\xF3xima foto (seta direita)"
  }, "\u203A")));
}

/* ---------------- avaliações ---------------- */
function Reviews() {
  return /*#__PURE__*/React.createElement("section", {
    className: "section",
    id: "avaliacoes"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head reveal"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Quem senta, volta"), /*#__PURE__*/React.createElement("h2", {
    className: "h2"
  }, "A palavra dos ", /*#__PURE__*/React.createElement("em", null, "clientes"))), /*#__PURE__*/React.createElement("div", {
    className: "reviews-layout"
  }, /*#__PURE__*/React.createElement("aside", {
    className: "rating-panel reveal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rating-big"
  }, "4.9"), /*#__PURE__*/React.createElement("div", {
    className: "rating-stars",
    "aria-label": "4,9 de 5 estrelas"
  }, /*#__PURE__*/React.createElement(Stars, null)), /*#__PURE__*/React.createElement("p", {
    className: "rating-count"
  }, "50 avalia\xE7\xF5es no Google"), /*#__PURE__*/React.createElement("div", {
    className: "rating-tags"
  }, /*#__PURE__*/React.createElement("span", {
    className: "chip"
  }, "Profissionais"), /*#__PURE__*/React.createElement("span", {
    className: "chip"
  }, "Limpeza"), /*#__PURE__*/React.createElement("span", {
    className: "chip"
  }, "Capricho"), /*#__PURE__*/React.createElement("span", {
    className: "chip"
  }, "Atendimento"), /*#__PURE__*/React.createElement("span", {
    className: "chip"
  }, "Qualidade")), /*#__PURE__*/React.createElement("a", {
    className: "btn btn-ghost btn-sm",
    href: MAPS_URL,
    target: "_blank",
    rel: "noopener noreferrer"
  }, "Ver no Google \u2197"), /*#__PURE__*/React.createElement("p", {
    className: "rating-src"
  }, /*#__PURE__*/React.createElement("span", {
    className: "g-badge"
  }), "Avalia\xE7\xF5es verificadas do Google Maps")), /*#__PURE__*/React.createElement("div", {
    className: "reviews-col"
  }, REVIEWS.map((r, i) => /*#__PURE__*/React.createElement("article", {
    className: "review-card reveal",
    key: r.name,
    style: {
      transitionDelay: i * 0.08 + "s"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "review-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "avatar",
    style: {
      background: "linear-gradient(135deg," + r.color + ", #eed3a0)"
    }
  }, r.name.split(" ").map(p => p[0]).slice(0, 2).join("")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", null, r.name), /*#__PURE__*/React.createElement("small", null, r.meta)), /*#__PURE__*/React.createElement("span", {
    className: "review-stars",
    "aria-label": "5 estrelas"
  }, /*#__PURE__*/React.createElement(Stars, null))), /*#__PURE__*/React.createElement("p", null, "\u201C", r.text, "\u201D")))))));
}

/* ---------------- agendamento ---------------- */
const EMPTY_FORM = {
  name: "",
  phone: "",
  service: "",
  date: "",
  time: ""
};
function Booking({
  form,
  setForm,
  notify
}) {
  const [stage, setStage] = useState("form"); // form | review | done
  const [errors, setErrors] = useState({});
  const cardRef = useRef(null);
  const minDate = todayISO();
  const set = (key, val) => {
    setForm(f => key === "date" ? {
      ...f,
      date: val,
      time: ""
    } : {
      ...f,
      [key]: val
    });
    setErrors(e => {
      const n = {
        ...e
      };
      delete n[key];
      if (key === "date") delete n.time;
      return n;
    });
  };
  const isSunday = form.date && new Date(form.date + "T12:00:00").getDay() === 0;
  const isToday = form.date === minDate;
  const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
  const slotDisabled = s => {
    if (!form.date || isSunday) return true;
    if (!isToday) return false;
    const [h, m] = s.split(":").map(Number);
    return h * 60 + m <= nowMins + 30;
  };
  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = "Digite seu nome para sabermos quem chega na cadeira.";
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < 10) e.phone = "Digite um WhatsApp com DDD, ex.: (11) 98134-6370.";
    if (!form.service) e.service = "Escolha o serviço que você quer fazer.";
    if (!form.date) e.date = "Escolha o dia da sua visita.";else if (form.date < minDate) e.date = "Essa data já passou. Escolha hoje ou um dia futuro.";else if (isSunday) e.date = "Domingo a barbearia está fechada, escolha de segunda a sábado.";
    if (!e.date && !form.time) e.time = "Toque em um horário disponível acima.";
    setErrors(e);
    if (Object.keys(e).length) {
      notify("Alguns campos precisam de atenção, veja as dicas em vermelho.", "error");
      setTimeout(() => {
        const first = cardRef.current && cardRef.current.querySelector(".field.error input, .field.error select, .field.error .slot:not([disabled])");
        if (first) first.focus();
      }, 60);
      return false;
    }
    return true;
  };
  const toReview = ev => {
    ev.preventDefault();
    if (validate()) {
      setStage("review");
      notify("Confira o resumo antes de confirmar.", "info");
    }
  };
  const serviceName = (SERVICES.find(s => s.id === form.service) || {}).name || "a definir";
  const whatsText = encodeURIComponent("Olá, Nazza Barbearia! Quero agendar um horário.\n\n" + "Serviço: " + serviceName + "\n" + "Data: " + fmtDate(form.date) + "\n" + "Horário: " + form.time + "\n" + "Nome: " + form.name.trim() + "\n" + "WhatsApp: " + form.phone + "\n\n" + "Podem confirmar? Obrigado!");
  const whatsLink = "https://wa.me/" + WHATS_NUMBER + "?text=" + whatsText;
  const confirm = () => {
    setStage("done");
    notify("Pedido montado! Envie pelo WhatsApp para confirmar.", "success");
    window.open(whatsLink, "_blank", "noopener");
  };
  const reset = () => {
    setForm({
      ...EMPTY_FORM
    });
    setErrors({});
    setStage("form");
    notify("Formulário limpo. Pode começar de novo.", "info");
  };
  const stepIdx = stage === "form" ? 0 : stage === "review" ? 1 : 2;
  return /*#__PURE__*/React.createElement("div", {
    className: "form-card reveal",
    ref: cardRef
  }, /*#__PURE__*/React.createElement("div", {
    className: "steps",
    "aria-label": "Etapas do agendamento"
  }, ["Seus dados", "Conferir", "Confirmar"].map((label, i) => /*#__PURE__*/React.createElement("div", {
    key: label,
    className: "step" + (i < stepIdx ? " done" : i === stepIdx ? " current" : "")
  }, /*#__PURE__*/React.createElement("span", {
    className: "step-dot"
  }, i < stepIdx ? /*#__PURE__*/React.createElement(CheckIcon, null) : i + 1), /*#__PURE__*/React.createElement("label", null, label)))), stage === "form" && /*#__PURE__*/React.createElement("form", {
    onSubmit: toReview,
    noValidate: true
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "field" + (errors.name ? " error" : "")
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "f-name"
  }, "Seu nome ", /*#__PURE__*/React.createElement("i", null, "*")), /*#__PURE__*/React.createElement("input", {
    id: "f-name",
    type: "text",
    placeholder: "Como te chamamos?",
    autoComplete: "name",
    value: form.name,
    onChange: e => set("name", e.target.value)
  }), errors.name && /*#__PURE__*/React.createElement("span", {
    className: "field-msg"
  }, /*#__PURE__*/React.createElement(WarnIcon, null), errors.name)), /*#__PURE__*/React.createElement("div", {
    className: "field" + (errors.phone ? " error" : "")
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "f-phone"
  }, "WhatsApp ", /*#__PURE__*/React.createElement("i", null, "*")), /*#__PURE__*/React.createElement("input", {
    id: "f-phone",
    type: "tel",
    inputMode: "tel",
    placeholder: "(11) 90000-0000",
    autoComplete: "tel",
    value: form.phone,
    onChange: e => set("phone", maskPhone(e.target.value))
  }), errors.phone && /*#__PURE__*/React.createElement("span", {
    className: "field-msg"
  }, /*#__PURE__*/React.createElement(WarnIcon, null), errors.phone))), /*#__PURE__*/React.createElement("div", {
    className: "form-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "field" + (errors.service ? " error" : "")
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "f-service"
  }, "Servi\xE7o ", /*#__PURE__*/React.createElement("i", null, "*")), /*#__PURE__*/React.createElement("select", {
    id: "f-service",
    value: form.service,
    onChange: e => set("service", e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Escolha um servi\xE7o\u2026"), SERVICES.map(s => /*#__PURE__*/React.createElement("option", {
    key: s.id,
    value: s.id
  }, s.name, " \xB7 \u2248", s.time))), errors.service && /*#__PURE__*/React.createElement("span", {
    className: "field-msg"
  }, /*#__PURE__*/React.createElement(WarnIcon, null), errors.service)), /*#__PURE__*/React.createElement("div", {
    className: "field" + (errors.date ? " error" : "")
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "f-date"
  }, "Data ", /*#__PURE__*/React.createElement("i", null, "*")), /*#__PURE__*/React.createElement("input", {
    id: "f-date",
    type: "date",
    min: minDate,
    value: form.date,
    onChange: e => set("date", e.target.value)
  }), errors.date ? /*#__PURE__*/React.createElement("span", {
    className: "field-msg"
  }, /*#__PURE__*/React.createElement(WarnIcon, null), errors.date) : isSunday ? /*#__PURE__*/React.createElement("span", {
    className: "field-msg"
  }, /*#__PURE__*/React.createElement(WarnIcon, null), "Domingo estamos fechados, escolha de segunda a s\xE1bado.") : /*#__PURE__*/React.createElement("span", {
    className: "field-hint"
  }, "Seg a S\xE1b \xB7 9h \xE0s 19h30 \xB7 domingo fechado"))), /*#__PURE__*/React.createElement("div", {
    className: "field" + (errors.time ? " error" : "")
  }, /*#__PURE__*/React.createElement("label", null, "Hor\xE1rio ", /*#__PURE__*/React.createElement("i", null, "*")), !form.date || isSunday ? /*#__PURE__*/React.createElement("p", {
    className: "field-hint info"
  }, "Escolha uma data acima para ver os hor\xE1rios livres.") : /*#__PURE__*/React.createElement("div", {
    className: "time-slots",
    role: "radiogroup",
    "aria-label": "Hor\xE1rios dispon\xEDveis"
  }, SLOTS.map(s => /*#__PURE__*/React.createElement("button", {
    type: "button",
    key: s,
    role: "radio",
    "aria-checked": form.time === s,
    className: "slot" + (form.time === s ? " selected" : ""),
    disabled: slotDisabled(s),
    title: slotDisabled(s) ? "Horário indisponível" : "Selecionar " + s,
    onClick: () => set("time", s)
  }, s))), errors.time && /*#__PURE__*/React.createElement("span", {
    className: "field-msg"
  }, /*#__PURE__*/React.createElement(WarnIcon, null), errors.time), isToday && form.date && !isSunday && /*#__PURE__*/React.createElement("p", {
    className: "field-hint"
  }, "Hor\xE1rios riscados j\xE1 passaram, mostramos s\xF3 o que ainda d\xE1 tempo.")), /*#__PURE__*/React.createElement("div", {
    className: "form-actions"
  }, /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn btn-primary"
  }, "Conferir pedido \u2192"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "link-btn",
    onClick: reset
  }, "Limpar formul\xE1rio")), /*#__PURE__*/React.createElement("p", {
    className: "privacy-note"
  }, /*#__PURE__*/React.createElement(LockIcon, null), "Seus dados s\xE3o usados apenas para montar a mensagem de agendamento no WhatsApp. Nada \xE9 enviado sem voc\xEA confirmar.")), stage === "review" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "state-title"
  }, "Confira seu pedido"), /*#__PURE__*/React.createElement("p", {
    className: "state-sub"
  }, "Est\xE1 tudo certo? Se precisar ajustar algo, volte sem perder nada do que preencheu."), /*#__PURE__*/React.createElement("dl", {
    className: "summary-list"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", null, "Servi\xE7o"), /*#__PURE__*/React.createElement("dd", null, serviceName)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", null, "Data"), /*#__PURE__*/React.createElement("dd", {
    style: {
      textTransform: "capitalize"
    }
  }, fmtDate(form.date))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", null, "Hor\xE1rio"), /*#__PURE__*/React.createElement("dd", null, form.time)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", null, "Nome"), /*#__PURE__*/React.createElement("dd", null, form.name.trim())), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", null, "WhatsApp"), /*#__PURE__*/React.createElement("dd", null, form.phone))), /*#__PURE__*/React.createElement("div", {
    className: "form-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: confirm
  }, "Confirmar pelo WhatsApp"), /*#__PURE__*/React.createElement("button", {
    className: "link-btn",
    onClick: () => setStage("form")
  }, "\u2190 Voltar e editar"))), stage === "done" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "state-title"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ok-ring"
  }, /*#__PURE__*/React.createElement(CheckIcon, null)), "Pedido pronto!"), /*#__PURE__*/React.createElement("p", {
    className: "state-sub"
  }, "Abrimos o WhatsApp com sua mensagem preenchida, \xE9 s\xF3 tocar em enviar. A barbearia confirma seu hor\xE1rio por l\xE1, dentro do expediente."), /*#__PURE__*/React.createElement("dl", {
    className: "summary-list"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", null, "Servi\xE7o"), /*#__PURE__*/React.createElement("dd", null, serviceName)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", null, "Data"), /*#__PURE__*/React.createElement("dd", {
    style: {
      textTransform: "capitalize"
    }
  }, fmtDate(form.date), " \xB7 ", form.time))), /*#__PURE__*/React.createElement("div", {
    className: "form-actions"
  }, /*#__PURE__*/React.createElement("a", {
    className: "btn btn-whats",
    href: whatsLink,
    target: "_blank",
    rel: "noopener noreferrer"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 18,
      height: 18,
      display: "inline-flex"
    }
  }, /*#__PURE__*/React.createElement(WhatsIcon, null)), "Reabrir WhatsApp"), /*#__PURE__*/React.createElement("button", {
    className: "link-btn",
    onClick: () => setStage("review")
  }, "\u2190 Editar pedido"), /*#__PURE__*/React.createElement("button", {
    className: "link-btn",
    onClick: reset
  }, "Fazer novo pedido")), /*#__PURE__*/React.createElement("p", {
    className: "field-hint",
    style: {
      marginTop: 18
    }
  }, "N\xE3o abriu? Chame direto: ", /*#__PURE__*/React.createElement("a", {
    href: "tel:+5511981346370",
    style: {
      color: "var(--gold)"
    }
  }, "(11) 98134-6370"))));
}
function Contact({
  form,
  setForm,
  notify
}) {
  const bbox = LON - 0.008 + "," + (LAT - 0.005) + "," + (LON + 0.008) + "," + (LAT + 0.005);
  const mapSrc = "https://www.openstreetmap.org/export/embed.html?bbox=" + encodeURIComponent(bbox) + "&layer=mapnik&marker=" + LAT + "," + LON;
  return /*#__PURE__*/React.createElement("section", {
    className: "section",
    id: "agendar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head reveal"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Visite a barbearia"), /*#__PURE__*/React.createElement("h2", {
    className: "h2"
  }, "Agende sua ", /*#__PURE__*/React.createElement("em", null, "cadeira")), /*#__PURE__*/React.createElement("p", {
    className: "section-sub"
  }, "Preencha, confira e confirme pelo WhatsApp em menos de um minuto. Prefere chegar direto? Encaixes conforme disponibilidade.")), /*#__PURE__*/React.createElement("div", {
    className: "booking-grid"
  }, /*#__PURE__*/React.createElement(Booking, {
    form: form,
    setForm: setForm,
    notify: notify
  }), /*#__PURE__*/React.createElement("div", {
    className: "reveal"
  }, /*#__PURE__*/React.createElement("dl", {
    className: "info-list"
  }, /*#__PURE__*/React.createElement("div", {
    className: "info-item"
  }, /*#__PURE__*/React.createElement("dt", null, "Endere\xE7o"), /*#__PURE__*/React.createElement("dd", null, ADDRESS, /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--muted)",
      fontSize: 13
    }
  }, "Dentro do Posto Ipiranga"))), /*#__PURE__*/React.createElement("div", {
    className: "info-item"
  }, /*#__PURE__*/React.createElement("dt", null, "WhatsApp"), /*#__PURE__*/React.createElement("dd", null, /*#__PURE__*/React.createElement("a", {
    href: "https://wa.me/" + WHATS_NUMBER,
    target: "_blank",
    rel: "noopener noreferrer"
  }, "(11) 98134-6370"))), /*#__PURE__*/React.createElement("div", {
    className: "info-item"
  }, /*#__PURE__*/React.createElement("dt", null, "Hor\xE1rios"), /*#__PURE__*/React.createElement("dd", null, "Seg a S\xE1b \xB7 9h00 \xE0s 19h30", /*#__PURE__*/React.createElement("br", null), "Domingo \xB7 fechado")), /*#__PURE__*/React.createElement("div", {
    className: "info-item"
  }, /*#__PURE__*/React.createElement("dt", null, "Instagram"), /*#__PURE__*/React.createElement("dd", null, /*#__PURE__*/React.createElement("a", {
    href: INSTAGRAM_URL,
    target: "_blank",
    rel: "noopener noreferrer"
  }, "@nazza_barbearia"))), /*#__PURE__*/React.createElement("div", {
    className: "info-item"
  }, /*#__PURE__*/React.createElement("dt", null, "Pagamento"), /*#__PURE__*/React.createElement("dd", {
    className: "pay-chips"
  }, /*#__PURE__*/React.createElement("span", {
    className: "chip"
  }, "Cr\xE9dito"), /*#__PURE__*/React.createElement("span", {
    className: "chip"
  }, "D\xE9bito"), /*#__PURE__*/React.createElement("span", {
    className: "chip"
  }, "Aproxima\xE7\xE3o / NFC"), /*#__PURE__*/React.createElement("span", {
    className: "chip"
  }, "Pix")))), /*#__PURE__*/React.createElement("div", {
    className: "map-frame"
  }, /*#__PURE__*/React.createElement("iframe", {
    src: mapSrc,
    title: "Mapa: Nazza Barbearia, Av. Jo\xE3o de Andrade 685, Osasco",
    loading: "lazy"
  }), /*#__PURE__*/React.createElement("a", {
    className: "btn btn-primary btn-sm map-link",
    href: MAPS_URL,
    target: "_blank",
    rel: "noopener noreferrer"
  }, "Como chegar \u2197"))))));
}

/* ---------------- FAQ ---------------- */
function Faq() {
  const [open, setOpen] = useState(0);
  return /*#__PURE__*/React.createElement("section", {
    className: "section",
    id: "ajuda"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head center reveal"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Ajuda r\xE1pida"), /*#__PURE__*/React.createElement("h2", {
    className: "h2"
  }, "Perguntas ", /*#__PURE__*/React.createElement("em", null, "frequentes"))), /*#__PURE__*/React.createElement("div", {
    className: "faq-list"
  }, FAQ.map((f, i) => /*#__PURE__*/React.createElement("div", {
    className: "faq-item reveal" + (open === i ? " open" : ""),
    key: i
  }, /*#__PURE__*/React.createElement("button", {
    className: "faq-q",
    onClick: () => setOpen(open === i ? -1 : i),
    "aria-expanded": open === i
  }, f.q, /*#__PURE__*/React.createElement("span", {
    className: "fx"
  }, /*#__PURE__*/React.createElement(PlusIcon, null))), /*#__PURE__*/React.createElement("div", {
    className: "faq-a",
    style: {
      maxHeight: open === i ? 240 : 0
    }
  }, /*#__PURE__*/React.createElement("p", null, f.a)))))));
}

/* ---------------- footer ---------------- */
function Footer({
  go
}) {
  return /*#__PURE__*/React.createElement("footer", {
    className: "footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "footer-grid"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("a", {
    href: "#inicio",
    className: "brand",
    onClick: e => {
      e.preventDefault();
      go("inicio");
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "brand-badge"
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/logo.png",
    alt: ""
  })), /*#__PURE__*/React.createElement("span", {
    className: "brand-name"
  }, "NAZZA", /*#__PURE__*/React.createElement("small", null, "BARBEARIA"))), /*#__PURE__*/React.createElement("p", {
    className: "footer-tag"
  }, "Capricho em cada corte, uma equipe que conhece voc\xEA pelo nome. Santo Ant\xF4nio, Osasco.")), /*#__PURE__*/React.createElement("div", {
    className: "footer-col"
  }, /*#__PURE__*/React.createElement("h4", null, "Navegue"), NAV_ITEMS.map(([id, label]) => /*#__PURE__*/React.createElement("a", {
    key: id,
    href: "#" + id,
    onClick: e => {
      e.preventDefault();
      go(id);
    }
  }, label)), /*#__PURE__*/React.createElement("a", {
    href: "#ajuda",
    onClick: e => {
      e.preventDefault();
      go("ajuda");
    }
  }, "Perguntas frequentes")), /*#__PURE__*/React.createElement("div", {
    className: "footer-col"
  }, /*#__PURE__*/React.createElement("h4", null, "Contato"), /*#__PURE__*/React.createElement("p", null, ADDRESS), /*#__PURE__*/React.createElement("a", {
    href: "https://wa.me/" + WHATS_NUMBER,
    target: "_blank",
    rel: "noopener noreferrer"
  }, "WhatsApp \xB7 (11) 98134-6370"), /*#__PURE__*/React.createElement("a", {
    href: INSTAGRAM_URL,
    target: "_blank",
    rel: "noopener noreferrer",
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(InstaIcon, null), "@nazza_barbearia"), /*#__PURE__*/React.createElement("a", {
    href: MAPS_URL,
    target: "_blank",
    rel: "noopener noreferrer"
  }, "Google Maps \xB7 4.9 (50 avalia\xE7\xF5es)"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--muted)"
    }
  }, "Seg a S\xE1b 9h \xE0s 19h30 \xB7 Dom fechado"))), /*#__PURE__*/React.createElement("div", {
    className: "footer-bottom"
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 ", new Date().getFullYear(), " Nazza Barbearia \xB7 Osasco/SP"), /*#__PURE__*/React.createElement("span", {
    className: "pole"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pole-icon"
  }), "Tradi\xE7\xE3o de barbearia, do cl\xE1ssico ao moderno"))));
}

/* ---------------- app ---------------- */
function App() {
  const [toasts, setToasts] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("inicio");
  const [form, setForm] = useState({
    ...EMPTY_FORM
  });
  const dismiss = useCallback(id => {
    setToasts(ts => ts.map(t => t.id === id ? {
      ...t,
      leaving: true
    } : t));
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 300);
  }, []);
  const notify = useCallback((msg, kind = "info") => {
    const id = ++toastSeq;
    setToasts(ts => [...ts.slice(-2), {
      id,
      msg,
      kind
    }]);
    setTimeout(() => dismiss(id), 4200);
  }, [dismiss]);
  const go = useCallback(id => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
    setMenuOpen(false);
  }, []);
  const pickService = useCallback(sid => {
    setForm(f => ({
      ...f,
      service: sid
    }));
    const s = SERVICES.find(x => x.id === sid);
    notify("Serviço selecionado: " + s.name + ". Complete data e horário.", "success");
    go("agendar");
    setTimeout(() => {
      const dateInput = document.getElementById("f-date");
      if (dateInput) dateInput.focus({
        preventScroll: true
      });
    }, 700);
  }, [notify, go]);
  useEffect(() => {
    const revealObs = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.setAttribute("data-shown", "true");
          revealObs.unobserve(en.target);
        }
      });
    }, {
      threshold: 0.12
    });
    document.querySelectorAll(".reveal").forEach(el => revealObs.observe(el));
    const sectionObs = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) setActive(en.target.id);
      });
    }, {
      rootMargin: "-38% 0px -55% 0px"
    });
    ["inicio", "servicos", "equipe", "galeria", "avaliacoes", "agendar", "ajuda"].forEach(id => {
      const el = document.getElementById(id);
      if (el) sectionObs.observe(el);
    });
    return () => {
      revealObs.disconnect();
      sectionObs.disconnect();
    };
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    className: "grain"
  }, /*#__PURE__*/React.createElement(Nav, {
    active: active,
    open: menuOpen,
    setOpen: setMenuOpen,
    go: go
  }), /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement(Hero, {
    go: go
  }), /*#__PURE__*/React.createElement(Marquee, null), /*#__PURE__*/React.createElement(Services, {
    pick: pickService
  }), /*#__PURE__*/React.createElement(Team, {
    go: go
  }), /*#__PURE__*/React.createElement(Gallery, {
    notify: notify
  }), /*#__PURE__*/React.createElement(Reviews, null), /*#__PURE__*/React.createElement(Contact, {
    form: form,
    setForm: setForm,
    notify: notify
  }), /*#__PURE__*/React.createElement(Faq, null)), /*#__PURE__*/React.createElement(Footer, {
    go: go
  }), /*#__PURE__*/React.createElement("a", {
    className: "whats-float",
    href: "https://wa.me/" + WHATS_NUMBER,
    target: "_blank",
    rel: "noopener noreferrer",
    "aria-label": "Falar no WhatsApp",
    title: "Falar no WhatsApp"
  }, /*#__PURE__*/React.createElement(WhatsIcon, null)), /*#__PURE__*/React.createElement(Toasts, {
    items: toasts,
    dismiss: dismiss
  }));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));