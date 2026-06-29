/* =========================================================
   HECTOR FAMILY MEDICINE — script.js
   Vanilla JS: Nav scroll, Language toggle, FAQ, ARIA chatbot,
   Scroll reveals, Marquee duplication
   ========================================================= */

'use strict';

/* ── Scrolled nav ── */
(function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── Mobile hamburger menu ── */
(function initMobileMenu() {
  const btn      = document.getElementById('nav-hamburger');
  const menu     = document.getElementById('mobile-menu');
  const backdrop = document.getElementById('mobile-menu-backdrop');
  const closeBtn = document.getElementById('mobile-menu-close');
  if (!btn || !menu) return;

  function open() {
    menu.classList.add('open');
    backdrop.classList.add('open');
    btn.classList.add('open');
    menu.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    menu.classList.remove('open');
    backdrop.classList.remove('open');
    btn.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', () => menu.classList.contains('open') ? close() : open());
  if (closeBtn) closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

/* ── Language toggle ── */
(function initLang() {
  const btns = document.querySelectorAll('.lang-btn');
  let current = 'en';

  function setLang(lang) {
    current = lang;
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-en]').forEach(el => {
      el.innerHTML = lang === 'es' ? (el.dataset.es || el.dataset.en) : el.dataset.en;
    });
    document.querySelectorAll('[data-placeholder-en]').forEach(el => {
      el.placeholder = lang === 'es'
        ? (el.dataset.placeholderEs || el.dataset.placeholderEn)
        : el.dataset.placeholderEn;
    });
    btns.forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  }

  btns.forEach(btn => btn.addEventListener('click', () => setLang(btn.dataset.lang)));
  setLang('en');
})();

/* ── Scroll reveal (IntersectionObserver) ── */
(function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  items.forEach(el => observer.observe(el));
})();

/* ── Marquee duplication (ensures seamless loop) ── */
(function initMarquee() {
  const track = document.querySelector('.marquee-track');
  if (!track) return;
  track.innerHTML += track.innerHTML;
})();

/* ── FAQ accordion ── */
(function initFaq() {
  document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('toggle', () => {
      const toggle = item.querySelector('.faq-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', item.open ? 'true' : 'false');
    });
  });
})();

/* ── ARIA Chatbot ── */
(function initARIA() {
  const btn        = document.getElementById('aria-btn');
  const panel      = document.getElementById('aria-panel');
  const closeBtn   = document.getElementById('aria-close');
  const messagesEl = document.getElementById('aria-messages');
  const input      = document.getElementById('aria-input');
  const sendBtn    = document.getElementById('aria-send');
  const quickRow   = document.getElementById('aria-quick-replies');

  if (!btn || !panel) return;

  let isOpen = false;
  let quickShown = true;

  /* ── Knowledge base ── */
  const KB = {
    practice:  'Hector Family Medicine',
    doctor:    'Dr. Hector',
    address:   '1000 N State Road 135 Suite C, Greenwood, Indiana 46143',
    phone:     '(317) 888-2737',
    email:     'info@hectormd.com',
    website:   'https://www.hectormd.com',
    type:      'Direct Primary Care (DPC) — no insurance billing, flat monthly membership',
    services:  ['Annual Physicals', 'Preventive Screenings', 'Chronic Condition Management (diabetes, hypertension, thyroid, etc.)', 'Same-Week Sick Visits', 'Medication Reviews & Management', 'Family Health Across All Life Stages'],
    languages: ['English', 'Spanish'],
    insurance: 'Direct Primary Care model — patients pay a low monthly membership fee directly. HSA/FSA compatible.',
    hours: {
      'Mon–Fri': '8:00 AM – 5:00 PM',
      'Sat':     'By appointment',
      'Sun':     'Closed'
    },
    sameDay:      true,
    newPatients:  true,
    booking:      'Call (317) 888-2737 or submit the contact form on the website for same-week availability.',
    experience:   '20+ years'
  };

  /* ── Response logic ── */
  function getLang() {
    return document.documentElement.lang === 'es' ? 'es' : 'en';
  }

  const responses = {
    en: [
      { pattern: /hours|open|schedule|when/i,
        reply: `We're open Monday–Friday, 8 AM–5 PM, and Saturday by appointment. Same-week appointments are typically available. Call us at ${KB.phone} to book!` },
      { pattern: /address|location|where|directions|find/i,
        reply: `We're located at ${KB.address}. Conveniently serving Greenwood, Indianapolis, Bargersville, and surrounding areas.` },
      { pattern: /phone|call|number|contact/i,
        reply: `You can reach us by phone at ${KB.phone} or email us at ${KB.email}. We'd love to hear from you!` },
      { pattern: /insurance|cost|price|fee|billing|pay|membership|dpc|direct/i,
        reply: `Hector Family Medicine uses a Direct Primary Care (DPC) model — you pay a low monthly membership fee directly to the practice, no insurance billing needed. This means longer visits, direct access to Dr. Hector, and transparent pricing. HSA/FSA compatible.` },
      { pattern: /new patient|accepting|join|sign up/i,
        reply: `Yes! We are currently accepting new patients. ${KB.booking}` },
      { pattern: /same.?day|same.?week|urgent|sick|soon/i,
        reply: `Same-week appointments are typically available for sick visits and urgent concerns. Please call us at ${KB.phone} for the fastest booking.` },
      { pattern: /service|treat|offer|speciali|care|annual|physi|chronic|prevent/i,
        reply: `We offer: ${KB.services.join(', ')}. Dr. Hector provides comprehensive, personal care for patients of all ages.` },
      { pattern: /doctor|dr|hector|physician|who/i,
        reply: `Dr. Hector is a family medicine physician with ${KB.experience} of experience, serving Greenwood and the Indianapolis metro. He is known for attentive, thorough care and truly listening to his patients.` },
      { pattern: /language|spanish|español|habla/i,
        reply: `Dr. Hector's practice welcomes English and Spanish-speaking patients. ¡También hablamos español!` },
      { pattern: /book|appoint|visit|schedul|reserv/i,
        reply: `Ready to book? ${KB.booking} You can also fill out the contact form on this page and we'll get back to you quickly.` },
      { pattern: /hello|hi|hey|hola|greet/i,
        reply: `Hello! I'm ARIA, the virtual assistant for Hector Family Medicine. I can answer questions about our services, hours, location, and how to book an appointment. How can I help you today?` },
      { pattern: /thank|thanks|gracias/i,
        reply: `You're welcome! Is there anything else I can help you with? We look forward to seeing you at Hector Family Medicine.` }
    ],
    es: [
      { pattern: /horario|hora|abierto|cuándo|cuando|schedule/i,
        reply: `Estamos abiertos de lunes a viernes, de 8 AM a 5 PM, y los sábados con cita previa. Generalmente hay citas disponibles la misma semana. ¡Llámenos al ${KB.phone}!` },
      { pattern: /dirección|ubicación|dónde|donde|direc|localiz/i,
        reply: `Estamos ubicados en ${KB.address}. Servimos a Greenwood, Indianapolis, Bargersville y áreas cercanas.` },
      { pattern: /teléfono|llame|número|contacto|llamar/i,
        reply: `Puede comunicarse con nosotros al ${KB.phone} o por correo electrónico a ${KB.email}.` },
      { pattern: /seguro|costo|precio|pago|membresia|membresía|dpc|directo/i,
        reply: `Hector Family Medicine utiliza el modelo de Atención Primaria Directa (DPC): usted paga una cuota mensual baja directamente a la práctica, sin facturación de seguros. Compatible con HSA/FSA.` },
      { pattern: /nuevo paciente|aceptando|unirse|registrarse/i,
        reply: `¡Sí! Actualmente aceptamos nuevos pacientes. ${KB.booking}` },
      { pattern: /mismo día|misma semana|urgente|enfermo|rápido/i,
        reply: `Generalmente hay citas disponibles la misma semana para visitas urgentes. Llámenos al ${KB.phone} para reservar con mayor rapidez.` },
      { pattern: /servicio|trato|ofrece|especiali|cuidado|anual|físico|crónico|preventi/i,
        reply: `Ofrecemos: Exámenes Anuales, Detección Preventiva, Manejo de Enfermedades Crónicas, Visitas para Enfermos, Revisión de Medicamentos y Medicina Familiar para todas las edades.` },
      { pattern: /doctor|dr|hector|médico|quien|quién/i,
        reply: `El Dr. Hector es médico de familia con más de ${KB.experience} de experiencia, atendiendo a Greenwood y el área metropolitana de Indianapolis. Es conocido por su atención cercana y minuciosa.` },
      { pattern: /idioma|español|english|habla/i,
        reply: `¡Sí, hablamos español! The practice also welcomes English-speaking patients.` },
      { pattern: /cita|reservar|agendar|visita/i,
        reply: `Para agendar una cita: ${KB.booking}` },
      { pattern: /hola|buenos|buenas|saludo/i,
        reply: `¡Hola! Soy ARIA, la asistente virtual de Hector Family Medicine. ¿En qué puedo ayudarle hoy?` },
      { pattern: /gracias|thank/i,
        reply: `¡Con mucho gusto! ¿Hay algo más en lo que le pueda ayudar?` }
    ]
  };

  const fallback = {
    en: `I'd be happy to help! For specific questions, please call us at ${KB.phone} or email ${KB.email}. Our team is ready to assist Monday–Friday, 8 AM–5 PM.`,
    es: `¡Con gusto le ayudo! Para preguntas específicas, llámenos al ${KB.phone} o escríbanos a ${KB.email}. Estamos disponibles de lunes a viernes, de 8 AM a 5 PM.`
  };

  function getReply(text) {
    const lang = getLang();
    const pool = responses[lang];
    const match = pool.find(r => r.pattern.test(text));
    return match ? match.reply : fallback[lang];
  }

  /* ── DOM helpers ── */
  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function appendMessage(text, role) {
    const msg = document.createElement('div');
    msg.className = `msg msg-${role}`;
    msg.textContent = text;
    messagesEl.appendChild(msg);
    scrollToBottom();
    return msg;
  }

  function showTyping() {
    const dots = document.createElement('div');
    dots.className = 'msg msg-aria typing-dots';
    dots.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(dots);
    scrollToBottom();
    return dots;
  }

  function sendMessage(text) {
    if (!text.trim()) return;
    if (quickRow) quickRow.style.display = 'none';
    appendMessage(text, 'user');
    const typing = showTyping();
    setTimeout(() => {
      typing.remove();
      appendMessage(getReply(text), 'aria');
    }, 900 + Math.random() * 500);
  }

  /* ── Quick replies ── */
  if (quickRow) {
    quickRow.querySelectorAll('.quick-reply').forEach(el => {
      el.addEventListener('click', () => sendMessage(el.textContent));
    });
  }

  /* ── Panel open/close ── */
  function openPanel() {
    isOpen = true;
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
    if (input) input.focus();
  }
  function closePanel() {
    isOpen = false;
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', () => isOpen ? closePanel() : openPanel());
  if (closeBtn) closeBtn.addEventListener('click', closePanel);

  /* ── Send on button or Enter ── */
  if (sendBtn && input) {
    sendBtn.addEventListener('click', () => { sendMessage(input.value); input.value = ''; });
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input.value); input.value = ''; }
    });
  }

  /* ── Esc to close ── */
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) closePanel(); });
})();

/* ── Contact form submission (demo handler) ── */
(function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    const lang = document.documentElement.lang;
    const original = btn.textContent;
    btn.textContent = lang === 'es' ? '¡Enviado!' : 'Sent!';
    btn.disabled = true;
    btn.style.opacity = '0.7';
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
      btn.style.opacity = '';
      form.reset();
    }, 3500);
  });
})();
