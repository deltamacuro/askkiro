(function () {
  'use strict';

  /** @type {number} Total de misiones (se calcula al leer index.html) */
  let total = 0;
  /** @type {BroadcastChannel|null} Canal compartido con el tutorial (workshop.js) */
  const channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel('askkiro') : null;

  /**
   * Notas de cada mision, leidas de los .pnote de index.html (fuente unica de contenido).
   * @type {Object<number, {phase: number, tag: string, title: string, say: string[], show: string[], ask: string[], check: string, budgetMin: number}>}
   */
  const missions = {};

  /** @type {number} Mision que muestra el tutorial (0 = sin datos) */
  let current = 0;
  /** @type {string} Pantalla que muestra el tutorial */
  let screen = '';
  /** @type {boolean} Hay un tutorial conectado */
  let linked = false;

  /** Cronometro de la sesion: arranca solo cuando el tutorial entra a las misiones */
  let sessionStart = 0;
  let sessionPausedAt = 0;
  let missionStart = 0;

  /**
   * Formatea milisegundos como mm:ss.
   * @param {number} ms - Milisegundos
   * @returns {string}
   */
  function fmt(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }

  /**
   * Extrae el tiempo sugerido en minutos de un texto como "~5 min" o "~15-20 min".
   * Usa el limite superior del rango.
   * @param {string} text - Texto de la nota de tiempo
   * @returns {number}
   */
  function parseBudget(text) {
    const m = /(\d+)(?:\s*-\s*(\d+))?\s*min/.exec(text || '');
    return m ? parseInt(m[2] || m[1]) : 0;
  }

  /**
   * Carga index.html y arma las notas de cada mision a partir de sus .pnote.
   * Primer parrafo = que decir; parrafos siguientes = que mostrar; .pnote-ask = preguntas.
   * @returns {Promise<void>}
   */
  function loadNotes() {
    return fetch('index.html').then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    }).then(function (html) {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      doc.querySelectorAll('.mission').forEach(function (m) {
        const n = parseInt(m.getAttribute('data-mission'));
        const note = m.querySelector('.pnote');
        const plain = note ? Array.from(note.querySelectorAll('p:not(.pnote-ask):not(.pnote-time)')) : [];
        const time = note ? note.querySelector('.pnote-time') : null;
        const check = m.querySelector('.mission-check-text');
        let checkHtml = '';
        if (check) {
          const clone = check.cloneNode(true);
          clone.querySelectorAll('strong, .mission-check-sub').forEach(function (el) { el.remove(); });
          checkHtml = clone.innerHTML.trim();
        }
        total = Math.max(total, n);
        missions[n] = {
          phase: parseInt(m.getAttribute('data-phase')) || 1,
          tag: (m.querySelector('.mission-tag') || {}).textContent || '',
          title: (m.querySelector('h2') || {}).textContent || 'Mision ' + n,
          say: plain.slice(0, 1).map(function (p) { return p.innerHTML; }),
          show: plain.slice(1).map(function (p) { return p.innerHTML; }),
          ask: note ? Array.from(note.querySelectorAll('.pnote-ask')).map(function (p) { return p.innerHTML.replace(/^Pregunta( a la audiencia)?:\s*/i, ''); }) : [],
          check: checkHtml,
          budgetMin: parseBudget(time ? time.textContent : '')
        };
      });
    });
  }

  /**
   * Llena un bloque con parrafos; lo oculta si no hay contenido.
   * @param {string} id - ID del contenedor
   * @param {string[]} items - HTML de cada parrafo
   */
  function fill(id, items) {
    const el = document.getElementById(id);
    const block = document.getElementById(id + '-block');
    el.innerHTML = items.map(function (h) { return '<p>' + h + '</p>'; }).join('');
    el.querySelectorAll('a').forEach(function (a) { a.target = '_blank'; a.rel = 'noopener noreferrer'; });
    if (block) block.hidden = items.length === 0;
  }

  /**
   * Redibuja la vista segun el estado recibido del tutorial.
   */
  function render() {
    const waiting = document.getElementById('sp-waiting');
    const cover = document.getElementById('sp-cover');
    const mission = document.getElementById('sp-mission');
    const link = document.getElementById('sp-link');
    const linkText = document.getElementById('sp-link-text');

    link.setAttribute('data-state', linked ? 'linked' : 'waiting');
    linkText.textContent = linked ? 'Conectado al tutorial' : 'Esperando el tutorial';

    waiting.hidden = linked;
    cover.hidden = !linked || screen === 'screen-play';
    mission.hidden = !linked || screen !== 'screen-play';

    if (linked && screen === 'screen-start') {
      document.getElementById('sp-cover-tag').textContent = 'Portada';
      document.getElementById('sp-cover-title').textContent = 'El tutorial esta en la portada';
      document.getElementById('sp-cover-text').textContent = 'Presenta el objetivo: en 55 minutos pasamos de vibe coding a software real. Presiona Siguiente para empezar la mision 1.';
    } else if (linked && screen === 'screen-end') {
      document.getElementById('sp-cover-tag').textContent = 'Cierre';
      document.getElementById('sp-cover-title').textContent = '"Eso no es vibe coding. Eso es software."';
      document.getElementById('sp-cover-text').textContent = 'Repasa el mapa de las 3 fases en pantalla, invita a compartir y abre preguntas. Tiempo total: ' + fmt(sessionElapsed()) + '.';
    }

    const m = missions[current];
    if (m && screen === 'screen-play') {
      document.getElementById('sp-tag').textContent = 'Mision ' + current + ' · ' + m.tag.replace(/^Fase \d+\s*·\s*/, '');
      document.getElementById('sp-title').textContent = m.title;
      document.getElementById('sp-budget').textContent = m.budgetMin ? '/ ~' + m.budgetMin + ' min' : '';
      fill('sp-say', m.say);
      fill('sp-do', m.show);
      fill('sp-ask', m.ask);
      document.getElementById('sp-check').innerHTML = m.check;
      document.getElementById('sp-check-block').hidden = !m.check;
    }

    const nextLabel = document.getElementById('sp-next-label');
    if (screen === 'screen-play' && current < total && missions[current + 1]) nextLabel.textContent = 'Sigue: ' + (current + 1) + ' · ' + missions[current + 1].tag.replace(/^Fase \d+\s*·\s*/, '');
    else if (screen === 'screen-play' && current === total) nextLabel.textContent = 'Sigue: cierre';
    else if (screen === 'screen-start') nextLabel.textContent = 'Sigue: 1 · Vibe Coding';
    else nextLabel.textContent = '';

    document.getElementById('sp-prev').disabled = !linked || screen === 'screen-start';
    document.getElementById('sp-next').disabled = !linked || screen === 'screen-end';
    document.querySelectorAll('.sp-jump-btn').forEach(function (b) {
      const n = parseInt(b.getAttribute('data-n'));
      b.classList.toggle('active', screen === 'screen-play' && n === current);
      b.disabled = !linked;
    });
    tick();
  }

  /**
   * Tiempo de sesion transcurrido, descontando pausas.
   * @returns {number}
   */
  function sessionElapsed() {
    if (!sessionStart) return 0;
    return (sessionPausedAt || Date.now()) - sessionStart;
  }

  /**
   * Actualiza los cronometros (se llama cada segundo).
   */
  function tick() {
    document.getElementById('sp-total').textContent = fmt(sessionElapsed());
    const m = missions[current];
    const elapsed = missionStart ? (sessionPausedAt || Date.now()) - missionStart : 0;
    document.getElementById('sp-elapsed').textContent = fmt(elapsed);
    const fillEl = document.getElementById('sp-bar-fill');
    const timer = document.getElementById('sp-timer');
    if (m && m.budgetMin) {
      const ratio = elapsed / (m.budgetMin * 60000);
      fillEl.style.width = Math.min(100, ratio * 100) + '%';
      timer.classList.toggle('near', ratio >= 0.8 && ratio < 1);
      timer.classList.toggle('over', ratio >= 1);
    } else {
      fillEl.style.width = '0%';
      timer.classList.remove('near', 'over');
    }
  }

  /**
   * Procesa un estado recibido del tutorial y reinicia el cronometro de mision si cambio.
   * @param {{current: number, screen: string}} msg - Estado del tutorial
   */
  function onState(msg) {
    const changed = msg.current !== current || msg.screen !== screen;
    linked = true;
    if (msg.screen === 'screen-play' && !sessionStart) sessionStart = Date.now();
    if (changed && msg.screen === 'screen-play') missionStart = sessionPausedAt || Date.now();
    current = msg.current;
    screen = msg.screen;
    render();
  }

  /**
   * Envia un comando al tutorial.
   * @param {Object} msg - Mensaje a enviar
   */
  function send(msg) {
    if (channel) channel.postMessage(msg);
  }

  /**
   * Construye los botones de salto directo a cada mision, con separadores entre fases.
   */
  function buildJump() {
    const c = document.getElementById('sp-jump');
    for (let i = 1; i <= total; i++) {
      if (i > 1 && missions[i] && missions[i - 1] && missions[i].phase !== missions[i - 1].phase) {
        const sep = document.createElement('span');
        sep.className = 'sp-jump-sep';
        sep.setAttribute('aria-hidden', 'true');
        c.appendChild(sep);
      }
      const b = document.createElement('button');
      b.className = 'sp-jump-btn';
      b.setAttribute('data-n', i);
      b.textContent = i;
      b.setAttribute('aria-label', 'Ir a la mision ' + i);
      b.addEventListener('click', function () { send({ type: 'goto', n: i }); });
      c.appendChild(b);
    }
  }

  /**
   * Configura botones, teclado (incluye clickers con PageUp/PageDown) y cronometro.
   */
  function setupControls() {
    document.getElementById('sp-prev').addEventListener('click', function () { send({ type: 'step', dir: -1 }); });
    document.getElementById('sp-next').addEventListener('click', function () { send({ type: 'step', dir: 1 }); });
    document.getElementById('sp-open-tutorial').addEventListener('click', function () {
      const w = window.open('index.html', 'askkiro-tutorial');
      if (w) w.focus();
    });
    document.addEventListener('keydown', function (e) {
      if (e.repeat || !linked) return;
      if (['ArrowRight', 'PageDown'].includes(e.key)) { e.preventDefault(); send({ type: 'step', dir: 1 }); }
      if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); send({ type: 'step', dir: -1 }); }
    });

    const pause = document.getElementById('sp-pause');
    pause.addEventListener('click', function () {
      if (!sessionStart) return;
      if (sessionPausedAt) {
        const pausedFor = Date.now() - sessionPausedAt;
        sessionStart += pausedFor;
        missionStart += pausedFor;
        sessionPausedAt = 0;
      } else {
        sessionPausedAt = Date.now();
      }
      pause.innerHTML = sessionPausedAt ? '<i class="fa-solid fa-play"></i>' : '<i class="fa-solid fa-pause"></i>';
      document.body.classList.toggle('sp-paused', !!sessionPausedAt);
      tick();
    });
    document.getElementById('sp-reset').addEventListener('click', function () {
      sessionStart = screen === 'screen-play' ? Date.now() : 0;
      missionStart = sessionStart;
      sessionPausedAt = 0;
      pause.innerHTML = '<i class="fa-solid fa-pause"></i>';
      document.body.classList.remove('sp-paused');
      tick();
    });
    setInterval(tick, 1000);
  }

  /**
   * Inicializa la vista de orador.
   */
  function init() {
    setupControls();
    if (!channel) {
      document.getElementById('sp-link-text').textContent = 'Tu browser no soporta sincronizacion';
      return;
    }
    channel.onmessage = function (e) {
      const msg = e.data || {};
      if (msg.type === 'state') onState(msg);
      if (msg.type === 'bye') { linked = false; render(); }
    };
    loadNotes().catch(function (err) {
      console.error('No se pudieron cargar las notas:', err);
      document.getElementById('sp-link-text').textContent = 'No se pudieron cargar las notas (abre el sitio desde un servidor)';
    }).then(function () {
      buildJump();
      render();
      send({ type: 'hello' });
    });
  }

  init();
})();
