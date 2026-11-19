/* global React, ReactDOM */
const { useState, useEffect, useRef, useCallback, useMemo } = React;

/* ---------------- dados ---------------- */
const WHATS_NUMBER = "5511981346370";
const MAPS_URL = "https://maps.app.goo.gl/GfpdgcHVXvJEF7316";
const INSTAGRAM_URL = "https://www.instagram.com/nazza_barbearia/";
const ADDRESS = "Av. João de Andrade, 685 — Santo Antônio, Osasco/SP · 06132-002";
const LAT = -23.5534, LON = -46.8009;

const SERVICES = [
  { id: "classico", num: "01", name: "Corte Clássico", time: "40 min", desc: "Tesoura e máquina com acabamento na navalha. O corte atemporal, alinhado ao seu estilo e finalizado com produto na medida." },
  { id: "moderno", num: "02", name: "Corte Moderno", time: "45 min", desc: "Fade, degradê, texturizado e riscos. As tendências do momento executadas com precisão milimétrica.", hot: true },
  { id: "combo", num: "03", name: "Corte + Barba", time: "1h15", desc: "O ritual completo: corte sob medida mais barba desenhada com toalha quente, navalha e finalização com balm." },
  { id: "infantil", num: "04", name: "Corte Infantil", time: "30 min", desc: "Paciência e cuidado com os pequenos. Um corte caprichado para o filho sair se sentindo gente grande." },
  { id: "barba", num: "05", name: "Barba", time: "30 min", desc: "Desenho completo com toalha quente, navalha e hidratação. Contornos definidos e pele confortável." },
  { id: "sobrancelha", num: "06", name: "Sobrancelha", time: "15 min", desc: "Limpeza e alinhamento na navalha, respeitando o formato natural. O detalhe que muda o olhar." },
];

const GALLERY = [
  { src: "assets/g1.jpg", cap: "Degradê infantil", sub: "Fade limpo + contorno natural" },
  { src: "assets/g2.jpg", cap: "Máquina & tesoura", sub: "Acabamento fio a fio na cadeira" },
  { src: "assets/g3.jpg", cap: "Black power alinhado", sub: "Topo volumoso + fade na lateral" },
  { src: "assets/g4.jpg", cap: "Buzz cut na régua", sub: "Máquina baixa + contorno definido" },
  { src: "assets/g5.jpg", cap: "Social moderno", sub: "Penteado + laterais baixas" },
  { src: "assets/g6.jpg", cap: "Taper em cabelo crespo", sub: "Transição suave na nuca" },
];

const REVIEWS = [
  { name: "Edmilson Lima", meta: "Local Guide · 60 avaliações", color: "#e9b83d", text: "O Naza para mim é um excelente cabeleireiro, com atendimento muito bacana. A gente percebe como ele naturalmente tem capricho para fazer uma ótima entrega. Sabe aquela sensação de contentamento por um trabalho bem feito? É assim que me sinto quando corto com ele, que aliás faz alguns anos." },
  { name: "Douglas Marques", meta: "8 avaliações", color: "#dca43c", text: "Bons profissionais e excelente atendimento. Lugar limpo e organizado." },
  { name: "Caique Marchetti", meta: "6 avaliações", color: "#eed3a0", text: "Excelentes profissionais, entregam com qualidade o corte que o cliente pede." },
];

const FAQ = [
  { q: "Preciso agendar ou posso chegar direto?", a: "Os dois funcionam! Encaixes são bem-vindos conforme a disponibilidade da cadeira. Mas agendar pelo formulário ou WhatsApp garante o seu horário, sem espera." },
  { q: "Como funciona o agendamento pelo site?", a: "Em 3 passos: você preenche nome, WhatsApp, serviço e horário; confere o resumo; e confirma enviando a mensagem pronta pelo WhatsApp. A barbearia responde confirmando o horário em minutos, dentro do expediente." },
  { q: "Quais formas de pagamento vocês aceitam?", a: "Cartão de crédito, cartão de débito e pagamento por aproximação (NFC / celular). Também aceitamos Pix e dinheiro." },
  { q: "Cortam cabelo infantil? A partir de que idade?", a: "Sim! O corte infantil é feito com paciência e cuidado, para qualquer idade em que a criança já consiga ficar sentada na cadeira. Agende num horário mais tranquilo para uma experiência ainda melhor." },
  { q: "E se eu precisar cancelar ou remarcar?", a: "Sem burocracia: é só avisar pelo WhatsApp (11) 98134-6370 com o máximo de antecedência que conseguir. A gente reagenda sem custo nenhum." },
];

const OPEN_MIN = 9 * 60, CLOSE_MIN = 19 * 60 + 30;
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
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
}
function maskPhone(v) {
  const n = v.replace(/\D/g, "").slice(0, 11);
  if (n.length <= 2) return n;
  if (n.length <= 6) return "(" + n.slice(0, 2) + ") " + n.slice(2);
  if (n.length <= 10) return "(" + n.slice(0, 2) + ") " + n.slice(2, 6) + "-" + n.slice(6);
  return "(" + n.slice(0, 2) + ") " + n.slice(2, 7) + "-" + n.slice(7);
}

/* ---------------- ícones ---------------- */
const WhatsIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m0 1.67c2.2 0 4.27.86 5.82 2.42a8.2 8.2 0 0 1 2.42 5.82c0 4.54-3.7 8.24-8.25 8.24-1.48 0-2.93-.4-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24M8.53 7.33c-.16 0-.43.06-.66.31-.22.25-.87.85-.87 2.07 0 1.22.89 2.4 1 2.56.13.17 1.76 2.67 4.25 3.73 2.08.88 2.5.7 2.95.66.45-.04 1.45-.59 1.65-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.47-.28-.25-.13-1.45-.72-1.68-.8-.22-.08-.39-.12-.55.12-.16.25-.63.8-.77.96-.14.17-.29.19-.53.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.55-1.34-.76-1.84-.2-.48-.4-.42-.55-.42-.14-.01-.3-.02-.46-.02"/></svg>
);
const InstaIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>
);

/* ---------------- toasts ---------------- */
let toastSeq = 0;
function Toasts({ items, dismiss }) {
  return (
    <div className="toasts" role="status" aria-live="polite">
      {items.map(t => (
        <div key={t.id} className={"toast " + t.kind + (t.leaving ? " leaving" : "")}>
          <span className="t-icon">{t.kind === "success" ? "✔" : t.kind === "error" ? "✖" : "✂"}</span>
          <span>{t.msg}</span>
          <button onClick={() => dismiss(t.id)} aria-label="Fechar aviso">✕</button>
        </div>
      ))}
    </div>
  );
}

/* ---------------- nav ---------------- */
const NAV_ITEMS = [
  ["inicio", "Início"], ["servicos", "Serviços"], ["equipe", "A Equipe"],
  ["galeria", "Galeria"], ["avaliacoes", "Avaliações"], ["agendar", "Contato"],
];

function Nav({ active, open, setOpen, go }) {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => { window.removeEventListener("scroll", onScroll); clearInterval(timer); };
  }, []);
  const aberto = isOpenNow(now);
  return (
    <React.Fragment>
      <div className="progress" style={{ width: progress + "%" }} />
      <header className={"nav" + (scrolled ? " scrolled" : "")}>
        <div className="nav-inner">
          <a href="#inicio" className="brand" onClick={e => { e.preventDefault(); go("inicio"); }} aria-label="Nazza Barbearia — voltar ao início">
            <span className="brand-badge"><img src="assets/logo.png" alt="Logo Nazza Barbearia" /></span>
            <span className="brand-name">NAZZA<small>BARBEARIA</small></span>
          </a>
          <nav className="nav-links" aria-label="Seções do site">
            {NAV_ITEMS.map(([id, label]) => (
              <a key={id} href={"#" + id} className={active === id ? "active" : ""}
                 onClick={e => { e.preventDefault(); go(id); }}>{label}</a>
            ))}
          </nav>
          <div className="nav-cta">
            <span className={"status-pill " + (aberto ? "open" : "closed")} title="Seg a Sáb, 9h às 19h30 · Domingo fechado">
              <span className="status-dot" />
              {aberto ? "Aberto · até 19h30" : "Fechado agora"}
            </span>
            <a href="#agendar" className="btn btn-primary btn-sm" onClick={e => { e.preventDefault(); go("agendar"); }}>Agendar</a>
            <button className={"burger" + (open ? " open" : "")} onClick={() => setOpen(!open)}
                    aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open}>
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>
      {open && (
        <div className="mobile-menu">
          {NAV_ITEMS.map(([id, label]) => (
            <a key={id} href={"#" + id} className={active === id ? "active" : ""}
               onClick={e => { e.preventDefault(); go(id); setOpen(false); }}>
              {label}<span style={{ color: "var(--brass)" }}>→</span>
            </a>
          ))}
          <span className={"status-pill " + (aberto ? "open" : "closed")} style={{ marginTop: 14, alignSelf: "flex-start" }}>
            <span className="status-dot" />{aberto ? "Aberto agora · fecha às 19h30" : "Fechado agora · Seg–Sáb 9h–19h30"}
          </span>
          <a href="#agendar" className="btn btn-primary" onClick={e => { e.preventDefault(); go("agendar"); setOpen(false); }}>Agendar horário</a>
        </div>
      )}
    </React.Fragment>
  );
}

/* ---------------- hero ---------------- */
function Hero({ go }) {
  return (
    <section className="hero" id="inicio">
      <div className="hero-bg"><img src="assets/hero.jpg" alt="" fetchpriority="high" /></div>
      <div className="wrap">
        <div className="hero-content">
          <span className="eyebrow rise d1">Santo Antônio · Osasco — dentro do Posto Ipiranga</span>
          <h1 className="rise d2">Cortes que<br />revelam<span className="accent">seu estilo</span></h1>
          <p className="hero-sub rise d3">Um time de barbeiros com capricho em cada detalhe e atendimento de gente que conhece você pelo nome. Corte clássico ou moderno, barba e sobrancelha — do jeito que você pede.</p>
          <div className="hero-ctas rise d4">
            <a href="#agendar" className="btn btn-primary" onClick={e => { e.preventDefault(); go("agendar"); }}>Agendar horário</a>
            <a href="#servicos" className="btn btn-ghost" onClick={e => { e.preventDefault(); go("servicos"); }}>Serviços</a>
          </div>
          <div className="hero-stats rise d5">
            <div className="stat"><b>4.9<span className="star">★</span></b><span>Nota no Google</span></div>
            <div className="stat"><b>50+</b><span>Avaliações reais</span></div>
            <div className="stat"><b>6</b><span>Serviços completos</span></div>
            <div className="stat"><b>1min</b><span>Para agendar</span></div>
          </div>
        </div>
      </div>
      <span className="scroll-hint rise d6">role para explorar</span>
    </section>
  );
}

function Marquee() {
  const items = ["Corte Clássico", "Corte Moderno", "Fade & Degradê", "Corte Infantil", "Barba na Navalha", "Sobrancelha", "Toalha Quente"];
  const row = items.map((t, i) => <span key={i}>{t}<i>✂</i></span>);
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">{row}{row}</div>
    </div>
  );
}

/* ---------------- serviços ---------------- */
function Services({ pick }) {
  return (
    <section className="section" id="servicos">
      <div className="wrap">
        <div className="section-head center reveal">
          <span className="eyebrow">O que fazemos</span>
          <h2 className="h2">Serviços & <em>rituais</em></h2>
          <p className="section-sub">Escolha um serviço e o formulário de agendamento já vem preenchido para você. Valores na cadeira ou pelo WhatsApp.</p>
        </div>
        <div className="services-grid">
          {SERVICES.map((s, i) => (
            <article className="service-card reveal" key={s.id} style={{ transitionDelay: (i % 3) * 0.08 + "s" }}>
              <div className="service-top">
                <span className="service-num">{s.num}</span>
                {s.hot && <span className="badge-hot">Mais pedido</span>}
              </div>
              <h3>{s.name}</h3>
              <p>{s.desc}</p>
              <div className="service-meta">
                <span className="service-time">≈ {s.time}</span>
                <button className="service-book" onClick={() => pick(s.id)}>Agendar →</button>
              </div>
            </article>
          ))}
        </div>
        <p className="services-note reveal">Encaixes são bem-vindos quando a cadeira está livre — <b>mas agendar garante o seu horário.</b></p>
      </div>
    </section>
  );
}

/* ---------------- equipe ---------------- */
function Team({ go }) {
  return (
    <section className="section" id="equipe">
      <div className="wrap team-grid">
        <div className="team-photo reveal">
          <img src="assets/team.jpg" alt="Equipe de barbeiros da Nazza Barbearia reunida na loja" loading="lazy" />
          <img className="team-photo-extra" src="assets/team2.jpg" alt="Barbeiro da equipe Nazza fazendo um corte infantil" loading="lazy" />
          <div className="exp-chip"><b>Equipe</b><span>unida pelo capricho</span></div>
        </div>
        <div className="team-copy reveal">
          <span className="eyebrow">Quem segura a tesoura</span>
          <h2 className="h2">A <em>equipe</em> Nazza</h2>
          <p className="team-role">Barbeiros · Um só padrão de qualidade</p>
          <p>A Nazza não depende de um único par de mãos: é um time de barbeiros que trabalha junto, com o mesmo capricho e o mesmo padrão de acabamento. Quem chega pela primeira vez é recebido pelo nome; quem volta há anos sabe que pode sentar em qualquer cadeira.</p>
          <p>Do clássico na tesoura ao fade navalhado, do corte infantil à barba desenhada, a equipe se complementa — e a loja, limpa e organizada, virou ponto de encontro do bairro Santo Antônio.</p>
          <ul className="team-values">
            <li><span className="v-ic">✂</span><span><b>Mão treinada, olho no detalhe</b>Cada barbeiro domina do clássico ao moderno, com acabamento conferido antes de você sair da cadeira.</span></li>
            <li><span className="v-ic">✔</span><span><b>Cadeira limpa e organizada</b>Material higienizado e bancada em ordem a cada atendimento — ponto elogiado nas avaliações.</span></li>
            <li><span className="v-ic">★</span><span><b>Atendimento que conhece você</b>Time unido pelo mesmo capricho: o corte que você pediu, do jeito que você pediu.</span></li>
          </ul>
          <blockquote className="team-quote">
            “Bons profissionais e excelente atendimento. Lugar limpo e organizado.”
            <footer>— Douglas Marques · avaliação no Google</footer>
          </blockquote>
          <div className="chips">
            <span className="chip">Cortes clássicos</span>
            <span className="chip">Fades & modernos</span>
            <span className="chip">Barba na navalha</span>
            <span className="chip">Corte infantil</span>
          </div>
          <div style={{ marginTop: 28 }}>
            <a href="#agendar" className="btn btn-primary" onClick={e => { e.preventDefault(); go("agendar"); }}>Agendar com a equipe</a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- galeria + lightbox ---------------- */
function Gallery({ notify }) {
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
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [idx, close, step]);

  return (
    <section className="section" id="galeria">
      <div className="wrap">
        <div className="section-head center reveal">
          <span className="eyebrow">Trabalhos recentes</span>
          <h2 className="h2">Na <em>cadeira</em></h2>
          <p className="section-sub">Cada corte conta uma história. Toque em uma foto para ampliar — use ← → para navegar e Esc para fechar.</p>
        </div>
        <div className="gallery-grid">
          {GALLERY.map((g, i) => (
            <button className="gallery-item reveal" key={g.src} onClick={() => setIdx(i)}
                    style={{ transitionDelay: (i % 3) * 0.08 + "s" }}
                    aria-label={"Ampliar foto: " + g.cap}>
              <img src={g.src} alt={g.cap + " — " + g.sub} loading="lazy" />
              <span className="g-cap">{g.cap}<i>⤢</i></span>
            </button>
          ))}
        </div>
      </div>
      {idx !== null && (
        <div className="lightbox" onClick={close} role="dialog" aria-modal="true" aria-label="Foto ampliada">
          <span className="lb-count">{String(idx + 1).padStart(2, "0")} / {String(GALLERY.length).padStart(2, "0")}</span>
          <button className="lb-close" onClick={close} aria-label="Fechar foto (Esc)">✕</button>
          <button className="lb-btn lb-prev" onClick={e => { e.stopPropagation(); step(-1); }} aria-label="Foto anterior (seta esquerda)">‹</button>
          <figure onClick={e => e.stopPropagation()}>
            <img key={idx} src={GALLERY[idx].src} alt={GALLERY[idx].cap} />
            <figcaption>{GALLERY[idx].cap}<small>{GALLERY[idx].sub} · Esc fecha · ← → navega</small></figcaption>
          </figure>
          <button className="lb-btn lb-next" onClick={e => { e.stopPropagation(); step(1); }} aria-label="Próxima foto (seta direita)">›</button>
        </div>
      )}
    </section>
  );
}

/* ---------------- avaliações ---------------- */
function Reviews() {
  return (
    <section className="section" id="avaliacoes">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow">Quem senta, volta</span>
          <h2 className="h2">A palavra dos <em>clientes</em></h2>
        </div>
        <div className="reviews-layout">
          <aside className="rating-panel reveal">
            <div className="rating-big">4.9</div>
            <div className="rating-stars" aria-label="4,9 de 5 estrelas">★★★★★</div>
            <p className="rating-count">50 avaliações no Google</p>
            <div className="rating-tags">
              <span className="chip">Profissionais</span>
              <span className="chip">Limpeza</span>
              <span className="chip">Capricho</span>
              <span className="chip">Atendimento</span>
              <span className="chip">Qualidade</span>
            </div>
            <a className="btn btn-ghost btn-sm" href={MAPS_URL} target="_blank" rel="noopener noreferrer">Ver no Google ↗</a>
            <p className="rating-src"><span className="g-badge" />Avaliações verificadas do Google Maps</p>
          </aside>
          <div className="reviews-col">
            {REVIEWS.map((r, i) => (
              <article className="review-card reveal" key={r.name} style={{ transitionDelay: i * 0.08 + "s" }}>
                <div className="review-head">
                  <span className="avatar" style={{ background: "linear-gradient(135deg," + r.color + ", #eed3a0)" }}>
                    {r.name.split(" ").map(p => p[0]).slice(0, 2).join("")}
                  </span>
                  <div><b>{r.name}</b><small>{r.meta}</small></div>
                  <span className="review-stars" aria-label="5 estrelas">★★★★★</span>
                </div>
                <p>“{r.text}”</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- agendamento ---------------- */
const EMPTY_FORM = { name: "", phone: "", service: "", date: "", time: "" };

function Booking({ form, setForm, notify }) {
  const [stage, setStage] = useState("form"); // form | review | done
  const [errors, setErrors] = useState({});
  const cardRef = useRef(null);
  const minDate = todayISO();

  const set = (key, val) => {
    setForm(f => key === "date" ? { ...f, date: val, time: "" } : { ...f, [key]: val });
    setErrors(e => { const n = { ...e }; delete n[key]; if (key === "date") delete n.time; return n; });
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
    if (!form.date) e.date = "Escolha o dia da sua visita.";
    else if (form.date < minDate) e.date = "Essa data já passou. Escolha hoje ou um dia futuro.";
    else if (isSunday) e.date = "Domingo a barbearia está fechada. Escolha de segunda a sábado.";
    if (!e.date && !form.time) e.time = "Toque em um horário disponível acima.";
    setErrors(e);
    if (Object.keys(e).length) {
      notify("Alguns campos precisam de atenção — veja as dicas em vermelho.", "error");
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

  const serviceName = (SERVICES.find(s => s.id === form.service) || {}).name || "—";
  const whatsText = encodeURIComponent(
    "Olá, Nazza Barbearia! Quero agendar um horário.\n\n" +
    "✂ Serviço: " + serviceName + "\n" +
    "📅 Data: " + fmtDate(form.date) + "\n" +
    "🕐 Horário: " + form.time + "\n" +
    "🙋 Nome: " + form.name.trim() + "\n" +
    "📱 WhatsApp: " + form.phone + "\n\n" +
    "Podem confirmar? Obrigado!"
  );
  const whatsLink = "https://wa.me/" + WHATS_NUMBER + "?text=" + whatsText;

  const confirm = () => {
    setStage("done");
    notify("Pedido montado! Envie pelo WhatsApp para confirmar.", "success");
    window.open(whatsLink, "_blank", "noopener");
  };

  const reset = () => {
    setForm({ ...EMPTY_FORM });
    setErrors({});
    setStage("form");
    notify("Formulário limpo. Pode começar de novo.", "info");
  };

  const stepIdx = stage === "form" ? 0 : stage === "review" ? 1 : 2;

  return (
    <div className="form-card reveal" ref={cardRef}>
      <div className="steps" aria-label="Etapas do agendamento">
        {["Seus dados", "Conferir", "Confirmar"].map((label, i) => (
          <div key={label} className={"step" + (i < stepIdx ? " done" : i === stepIdx ? " current" : "")}>
            <span className="step-dot">{i < stepIdx ? "✓" : i + 1}</span>
            <label>{label}</label>
          </div>
        ))}
      </div>

      {stage === "form" && (
        <form onSubmit={toReview} noValidate>
          <div className="form-row">
            <div className={"field" + (errors.name ? " error" : "")}>
              <label htmlFor="f-name">Seu nome <i>*</i></label>
              <input id="f-name" type="text" placeholder="Como te chamamos?" autoComplete="name"
                     value={form.name} onChange={e => set("name", e.target.value)} />
              {errors.name && <span className="field-msg">{errors.name}</span>}
            </div>
            <div className={"field" + (errors.phone ? " error" : "")}>
              <label htmlFor="f-phone">WhatsApp <i>*</i></label>
              <input id="f-phone" type="tel" inputMode="tel" placeholder="(11) 90000-0000" autoComplete="tel"
                     value={form.phone} onChange={e => set("phone", maskPhone(e.target.value))} />
              {errors.phone && <span className="field-msg">{errors.phone}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className={"field" + (errors.service ? " error" : "")}>
              <label htmlFor="f-service">Serviço <i>*</i></label>
              <select id="f-service" value={form.service} onChange={e => set("service", e.target.value)}>
                <option value="">Escolha um serviço…</option>
                {SERVICES.map(s => <option key={s.id} value={s.id}>{s.name} · ≈{s.time}</option>)}
              </select>
              {errors.service && <span className="field-msg">{errors.service}</span>}
            </div>
            <div className={"field" + (errors.date ? " error" : "")}>
              <label htmlFor="f-date">Data <i>*</i></label>
              <input id="f-date" type="date" min={minDate} value={form.date} onChange={e => set("date", e.target.value)} />
              {errors.date
                ? <span className="field-msg">{errors.date}</span>
                : isSunday
                  ? <span className="field-msg">Domingo estamos fechados — escolha de segunda a sábado.</span>
                  : <span className="field-hint">Seg a Sáb · 9h às 19h30 · domingo fechado</span>}
            </div>
          </div>
          <div className={"field" + (errors.time ? " error" : "")}>
            <label>Horário <i>*</i></label>
            {!form.date || isSunday ? (
              <p className="field-hint info">Escolha uma data acima para ver os horários livres.</p>
            ) : (
              <div className="time-slots" role="radiogroup" aria-label="Horários disponíveis">
                {SLOTS.map(s => (
                  <button type="button" key={s} role="radio" aria-checked={form.time === s}
                          className={"slot" + (form.time === s ? " selected" : "")}
                          disabled={slotDisabled(s)}
                          title={slotDisabled(s) ? "Horário indisponível" : "Selecionar " + s}
                          onClick={() => set("time", s)}>{s}</button>
                ))}
              </div>
            )}
            {errors.time && <span className="field-msg">{errors.time}</span>}
            {isToday && form.date && !isSunday && <p className="field-hint">Horários riscados já passaram — mostramos só o que ainda dá tempo.</p>}
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Conferir pedido →</button>
            <button type="button" className="link-btn" onClick={reset}>Limpar formulário</button>
          </div>
          <p className="privacy-note">Seus dados são usados apenas para montar a mensagem de agendamento no WhatsApp. Nada é enviado sem você confirmar.</p>
        </form>
      )}

      {stage === "review" && (
        <div>
          <h3 className="state-title">Confira seu pedido</h3>
          <p className="state-sub">Está tudo certo? Se precisar ajustar algo, volte sem perder nada do que preencheu.</p>
          <dl className="summary-list">
            <div><dt>Serviço</dt><dd>{serviceName}</dd></div>
            <div><dt>Data</dt><dd style={{ textTransform: "capitalize" }}>{fmtDate(form.date)}</dd></div>
            <div><dt>Horário</dt><dd>{form.time}</dd></div>
            <div><dt>Nome</dt><dd>{form.name.trim()}</dd></div>
            <div><dt>WhatsApp</dt><dd>{form.phone}</dd></div>
          </dl>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={confirm}>
              Confirmar pelo WhatsApp
            </button>
            <button className="link-btn" onClick={() => setStage("form")}>← Voltar e editar</button>
          </div>
        </div>
      )}

      {stage === "done" && (
        <div>
          <h3 className="state-title"><span className="ok-ring">✓</span>Pedido pronto!</h3>
          <p className="state-sub">Abrimos o WhatsApp com sua mensagem preenchida — é só tocar em enviar. A barbearia confirma seu horário por lá, dentro do expediente.</p>
          <dl className="summary-list">
            <div><dt>Serviço</dt><dd>{serviceName}</dd></div>
            <div><dt>Data</dt><dd style={{ textTransform: "capitalize" }}>{fmtDate(form.date)} · {form.time}</dd></div>
          </dl>
          <div className="form-actions">
            <a className="btn btn-whats" href={whatsLink} target="_blank" rel="noopener noreferrer">
              <span style={{ width: 18, height: 18, display: "inline-flex" }}><WhatsIcon /></span>
              Reabrir WhatsApp
            </a>
            <button className="link-btn" onClick={() => setStage("review")}>← Editar pedido</button>
            <button className="link-btn" onClick={reset}>Fazer novo pedido</button>
          </div>
          <p className="field-hint" style={{ marginTop: 18 }}>Não abriu? Chame direto: <a href={"tel:+5511981346370"} style={{ color: "var(--gold)" }}>(11) 98134-6370</a></p>
        </div>
      )}
    </div>
  );
}

function Contact({ form, setForm, notify }) {
  const bbox = (LON - 0.008) + "," + (LAT - 0.005) + "," + (LON + 0.008) + "," + (LAT + 0.005);
  const mapSrc = "https://www.openstreetmap.org/export/embed.html?bbox=" + encodeURIComponent(bbox) + "&layer=mapnik&marker=" + LAT + "," + LON;
  return (
    <section className="section" id="agendar">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow">Visite a barbearia</span>
          <h2 className="h2">Agende sua <em>cadeira</em></h2>
          <p className="section-sub">Preencha, confira e confirme pelo WhatsApp em menos de um minuto. Prefere chegar direto? Encaixes conforme disponibilidade.</p>
        </div>
        <div className="booking-grid">
          <Booking form={form} setForm={setForm} notify={notify} />
          <div className="reveal">
            <dl className="info-list">
              <div className="info-item"><dt>Endereço</dt><dd>{ADDRESS}<br /><span style={{ color: "var(--muted)", fontSize: 13 }}>Dentro do Posto Ipiranga</span></dd></div>
              <div className="info-item"><dt>WhatsApp</dt><dd><a href={"https://wa.me/" + WHATS_NUMBER} target="_blank" rel="noopener noreferrer">(11) 98134-6370</a></dd></div>
              <div className="info-item"><dt>Horários</dt><dd>Seg–Sáb · 9h00 – 19h30<br />Domingo · fechado</dd></div>
              <div className="info-item"><dt>Instagram</dt><dd><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">@nazza_barbearia</a></dd></div>
              <div className="info-item"><dt>Pagamento</dt><dd className="pay-chips"><span className="chip">Crédito</span><span className="chip">Débito</span><span className="chip">Aproximação / NFC</span><span className="chip">Pix</span></dd></div>
            </dl>
            <div className="map-frame">
              <iframe src={mapSrc} title="Mapa — Nazza Barbearia, Av. João de Andrade 685, Osasco" loading="lazy" />
              <a className="btn btn-primary btn-sm map-link" href={MAPS_URL} target="_blank" rel="noopener noreferrer">Como chegar ↗</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="section" id="ajuda">
      <div className="wrap">
        <div className="section-head center reveal">
          <span className="eyebrow">Ajuda rápida</span>
          <h2 className="h2">Perguntas <em>frequentes</em></h2>
        </div>
        <div className="faq-list">
          {FAQ.map((f, i) => (
            <div className={"faq-item reveal" + (open === i ? " open" : "")} key={i}>
              <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                {f.q}<span className="fx">＋</span>
              </button>
              <div className="faq-a" style={{ maxHeight: open === i ? 240 : 0 }}>
                <p>{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- footer ---------------- */
function Footer({ go }) {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <a href="#inicio" className="brand" onClick={e => { e.preventDefault(); go("inicio"); }}>
              <span className="brand-badge"><img src="assets/logo.png" alt="" /></span>
              <span className="brand-name">NAZZA<small>BARBEARIA</small></span>
            </a>
            <p className="footer-tag">Capricho em cada corte, uma equipe que conhece você pelo nome. Santo Antônio, Osasco.</p>
          </div>
          <div className="footer-col">
            <h4>Navegue</h4>
            {NAV_ITEMS.map(([id, label]) => (
              <a key={id} href={"#" + id} onClick={e => { e.preventDefault(); go(id); }}>{label}</a>
            ))}
            <a href="#ajuda" onClick={e => { e.preventDefault(); go("ajuda"); }}>Perguntas frequentes</a>
          </div>
          <div className="footer-col">
            <h4>Contato</h4>
            <p>{ADDRESS}</p>
            <a href={"https://wa.me/" + WHATS_NUMBER} target="_blank" rel="noopener noreferrer">WhatsApp · (11) 98134-6370</a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><InstaIcon />@nazza_barbearia</a>
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer">Google Maps · 4.9 ★ (50)</a>
            <p style={{ color: "var(--muted)" }}>Seg–Sáb 9h–19h30 · Dom fechado</p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Nazza Barbearia · Osasco/SP</span>
          <span className="pole"><span className="pole-icon" />Tradição de barbearia, do clássico ao moderno</span>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- app ---------------- */
function App() {
  const [toasts, setToasts] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("inicio");
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const dismiss = useCallback(id => {
    setToasts(ts => ts.map(t => t.id === id ? { ...t, leaving: true } : t));
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 300);
  }, []);

  const notify = useCallback((msg, kind = "info") => {
    const id = ++toastSeq;
    setToasts(ts => [...ts.slice(-2), { id, msg, kind }]);
    setTimeout(() => dismiss(id), 4200);
  }, [dismiss]);

  const go = useCallback(id => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  }, []);

  const pickService = useCallback(sid => {
    setForm(f => ({ ...f, service: sid }));
    const s = SERVICES.find(x => x.id === sid);
    notify("Serviço selecionado: " + s.name + ". Complete data e horário.", "success");
    go("agendar");
    setTimeout(() => {
      const dateInput = document.getElementById("f-date");
      if (dateInput) dateInput.focus({ preventScroll: true });
    }, 700);
  }, [notify, go]);

  useEffect(() => {
    const revealObs = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.setAttribute("data-shown", "true"); revealObs.unobserve(en.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(el => revealObs.observe(el));

    const sectionObs = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: "-38% 0px -55% 0px" });
    ["inicio", "servicos", "equipe", "galeria", "avaliacoes", "agendar", "ajuda"].forEach(id => {
      const el = document.getElementById(id);
      if (el) sectionObs.observe(el);
    });
    return () => { revealObs.disconnect(); sectionObs.disconnect(); };
  }, []);

  return (
    <div className="grain">
      <Nav active={active} open={menuOpen} setOpen={setMenuOpen} go={go} />
      <main>
        <Hero go={go} />
        <Marquee />
        <Services pick={pickService} />
        <Team go={go} />
        <Gallery notify={notify} />
        <Reviews />
        <Contact form={form} setForm={setForm} notify={notify} />
        <Faq />
      </main>
      <Footer go={go} />
      <a className="whats-float" href={"https://wa.me/" + WHATS_NUMBER} target="_blank" rel="noopener noreferrer"
         aria-label="Falar no WhatsApp" title="Falar no WhatsApp">
        <WhatsIcon />
      </a>
      <Toasts items={toasts} dismiss={dismiss} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);