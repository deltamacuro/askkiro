(function () {
  'use strict';

  /** @type {number} Mision actual (1-based) */
  let current = 1;
  /** @type {number} Total de misiones */
  const total = 9;
  /** @type {Object<number, boolean>} Misiones visitadas */
  let visited = {};
  /** @type {boolean} Indica si hay una transicion de pantalla en curso */
  let transitioning = false;
  /** @type {number} Duracion del fade-out en ms (debe coincidir con CSS transition) */
  const FADE_MS = 350;

  /** Primera mision de cada fase */
  const PHASE_START = { 1: 1, 2: 4, 3: 7 };

  /**
   * Titulos de cada mision para aria-labels.
   * @type {string[]}
   */
  const missionTitles = [];

  /**
   * Inicializa la aplicacion.
   */
  function init() {
    try {
      cacheMissionTitles();
      buildDots();
      setupNav();
      setupCopy();
      setupScreens();
      setupHelp();
      loadState();
      updateUI();
      restoreScreen();
    } catch (e) { console.error('Error al inicializar:', e); }
  }

  /**
   * Cachea los titulos de las misiones para usar en aria-labels.
   */
  function cacheMissionTitles() {
    document.querySelectorAll('.mission').forEach(function (m) {
      const idx = parseInt(m.getAttribute('data-mission'));
      const h2 = m.querySelector('h2');
      missionTitles[idx] = h2 ? h2.textContent : 'Mision ' + idx;
    });
  }

  /**
   * Construye los dots de navegacion con separadores entre fases.
   */
  function buildDots() {
    const c = document.getElementById('nav-dots');
    if (!c) return;
    for (let i = 1; i <= total; i++) {
      if (i === 4 || i === 7) {
        const sep = document.createElement('span');
        sep.className = 'nav-sep';
        sep.setAttribute('aria-hidden', 'true');
        c.appendChild(sep);
      }
      const d = document.createElement('button');
      d.className = 'nav-dot';
      d.setAttribute('data-m', i);
      d.setAttribute('aria-label', 'Mision ' + i + ': ' + (missionTitles[i] || ''));
      d.addEventListener('click', function () {
        const phase = i <= 3 ? 1 : i <= 6 ? 2 : 3;
        if (!isPhaseUnlocked(phase)) return;
        goTo(i);
      });
      c.appendChild(d);
    }
  }

  /**
   * Navega a una mision especifica.
   * @param {number} n - Numero de mision (1-based)
   */
  function goTo(n) {
    if (n < 1 || n > total) return;
    visited[current] = true;
    current = n;
    updateUI();
    saveState();
  }

  /**
   * Determina si una fase esta desbloqueada.
   * Fase 1 siempre desbloqueada. Fase N se desbloquea al visitar la ultima mision de la fase anterior.
   * @param {number} phase - Numero de fase (1-3)
   * @returns {boolean}
   */
  function isPhaseUnlocked(phase) {
    if (phase <= 1) return true;
    const lastOfPrev = PHASE_START[phase] - 1;
    return !!visited[lastOfPrev];
  }

  /**
   * Actualiza toda la UI: mision activa, dots, fases, contador.
   */
  function updateUI() {
    document.querySelectorAll('.mission').forEach(function (m) { m.classList.remove('active'); });
    const active = document.querySelector('.mission[data-mission="' + current + '"]');
    if (active) active.classList.add('active');

    document.querySelectorAll('.nav-dot').forEach(function (d) {
      const n = parseInt(d.getAttribute('data-m'));
      const dotPhase = n <= 3 ? 1 : n <= 6 ? 2 : 3;
      const locked = !isPhaseUnlocked(dotPhase);
      d.classList.remove('active', 'visited', 'dot-locked');
      if (locked) {
        d.classList.add('dot-locked');
      } else if (n === current) {
        d.classList.add('active');
      } else if (visited[n]) {
        d.classList.add('visited');
      }
      d.setAttribute('aria-current', n === current ? 'step' : 'false');
      d.setAttribute('aria-disabled', locked ? 'true' : 'false');
    });

    const prev = document.getElementById('btn-prev');
    const next = document.getElementById('btn-next');
    if (prev) prev.disabled = (current <= 1);
    if (next) {
      if (current >= total) { next.textContent = 'Finalizar'; next.classList.add('finish'); }
      else { next.textContent = 'Siguiente'; next.classList.remove('finish'); }
    }

    const phase = active ? parseInt(active.getAttribute('data-phase')) : 1;
    document.querySelectorAll('.topbar-phase').forEach(function (t) {
      const p = parseInt(t.getAttribute('data-phase'));
      t.classList.remove('active', 'locked', 'unlocked', 'done');
      if (p === phase) {
        t.classList.add('active');
        t.removeAttribute('aria-disabled');
        t.removeAttribute('tabindex');
      } else if (p < phase) {
        t.classList.add('done');
        t.removeAttribute('aria-disabled');
        t.removeAttribute('tabindex');
      } else if (isPhaseUnlocked(p)) {
        t.classList.add('unlocked');
        t.removeAttribute('aria-disabled');
        t.removeAttribute('tabindex');
      } else {
        t.classList.add('locked');
        t.setAttribute('aria-disabled', 'true');
        t.setAttribute('tabindex', '-1');
      }
    });

    const counter = document.getElementById('topbar-count');
    if (counter) counter.textContent = current + '/' + total;
  }

  /**
   * Configura la navegacion: botones prev/next, flechas de teclado, tabs de fases.
   */
  function setupNav() {
    const prev = document.getElementById('btn-prev');
    const next = document.getElementById('btn-next');
    if (prev) prev.addEventListener('click', function () { goTo(current - 1); });
    if (next) next.addEventListener('click', function () {
      if (current >= total) { visited[current] = true; switchScreen('screen-end'); saveState(); }
      else { goTo(current + 1); }
    });

    document.addEventListener('keydown', function (e) {
      /* Cerrar help con Escape */
      const overlay = document.getElementById('help-overlay');
      if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) {
        overlay.classList.remove('open');
        return;
      }

      const play = document.getElementById('screen-play');
      if (!play || !play.classList.contains('active')) return;
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        if (current < total) goTo(current + 1);
        else if (current >= total) { visited[current] = true; switchScreen('screen-end'); saveState(); }
      }
      if (e.key === 'ArrowLeft') { e.preventDefault(); if (current > 1) goTo(current - 1); }
    });

    document.querySelectorAll('.topbar-phase').forEach(function (tab) {
      tab.addEventListener('click', function () {
        if (tab.classList.contains('locked')) return;
        const p = parseInt(tab.getAttribute('data-phase'));
        goTo(PHASE_START[p] || 1);
      });
    });
  }

  /**
   * Configura los botones "Ask Kiro" / "Copiar" con clipboard y fallback.
   */
  function setupCopy() {
    document.querySelectorAll('.ask-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const code = btn.parentElement.querySelector('code');
        if (!code) return;
        const text = code.textContent.trim();
        const orig = btn.textContent;
        copyToClipboard(text).then(function () {
          btn.classList.add('copied');
          btn.textContent = 'Copiado';
          setTimeout(function () { btn.textContent = orig; btn.classList.remove('copied'); }, 2000);
        }).catch(function () {
          btn.textContent = 'Error';
          setTimeout(function () { btn.textContent = orig; }, 2000);
        });
      });
    });
  }

  /**
   * Copia texto al clipboard con fallback para contextos sin HTTPS.
   * @param {string} text - Texto a copiar
   * @returns {Promise<void>}
   */
  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        resolve();
      } catch (err) { reject(err); }
    });
  }

  /**
   * Cambia de pantalla con transicion fade-out/fade-in.
   * Protegido contra doble-clic con flag transitioning.
   * @param {string} id - ID de la pantalla destino
   */
  function switchScreen(id) {
    if (transitioning) return;
    const currentScreen = document.querySelector('.screen.active');
    const nextScreen = document.getElementById(id);
    if (!nextScreen || currentScreen === nextScreen) return;

    if (currentScreen) {
      transitioning = true;
      currentScreen.classList.add('fading');
      setTimeout(function () {
        currentScreen.classList.remove('active', 'fading');
        nextScreen.classList.add('active');
        transitioning = false;
      }, FADE_MS);
    } else {
      nextScreen.classList.add('active');
    }
  }

  /**
   * Configura los eventos de las pantallas: empezar, home, reiniciar, modos.
   */
  function setupScreens() {
    const play = document.getElementById('btn-play');
    if (play) play.addEventListener('click', function () { switchScreen('screen-play'); });

    const home = document.getElementById('btn-home');
    if (home) home.addEventListener('click', function () { switchScreen('screen-start'); });

    const backStart = document.getElementById('btn-back-start');
    if (backStart) backStart.addEventListener('click', function () { switchScreen('screen-start'); });

    document.querySelectorAll('.start-mode').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        if (link.getAttribute('aria-disabled') === 'true') return;
        document.body.className = 'mode-' + link.getAttribute('data-mode');
        switchScreen('screen-play');
      });
    });
  }

  /**
   * Configura el overlay de ayuda: abrir, cerrar, clic fuera, focus trap.
   */
  function setupHelp() {
    const overlay = document.getElementById('help-overlay');
    const btnHelp = document.getElementById('btn-help');
    const btnClose = document.getElementById('help-close');
    if (btnHelp && overlay) btnHelp.addEventListener('click', function (e) { e.preventDefault(); overlay.classList.add('open'); if (btnClose) btnClose.focus(); });
    if (btnClose && overlay) btnClose.addEventListener('click', function () { overlay.classList.remove('open'); if (btnHelp) btnHelp.focus(); });
    if (overlay) overlay.addEventListener('click', function (e) { if (e.target === overlay) { overlay.classList.remove('open'); if (btnHelp) btnHelp.focus(); } });

    /* Focus trap dentro del help panel */
    if (overlay) overlay.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      const focusable = overlay.querySelectorAll('button, a, summary, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /**
   * Guarda el estado actual en localStorage.
   */
  function saveState() {
    const activeScreen = document.querySelector('.screen.active');
    const screen = activeScreen ? activeScreen.id : 'screen-start';
    try { localStorage.setItem('kiroWS', JSON.stringify({ current: current, visited: visited, screen: screen })); } catch (e) {}
  }

  /**
   * Restaura el estado desde localStorage.
   */
  /** @type {string|null} Pantalla guardada en localStorage */
  let savedScreen = null;

  function loadState() {
    try {
      const data = localStorage.getItem('kiroWS');
      if (!data) return;
      const s = JSON.parse(data);
      if (s.current) current = s.current;
      if (s.visited) visited = s.visited;
      if (s.screen) savedScreen = s.screen;
    } catch (e) {}
  }

  /**
   * Restaura la pantalla activa segun el estado guardado.
   * Swap directo de clases sin transicion para evitar flash.
   */
  function restoreScreen() {
    if (!savedScreen || savedScreen === 'screen-start') return;
    const start = document.getElementById('screen-start');
    const target = document.getElementById(savedScreen);
    if (start) start.classList.remove('active');
    if (target) target.classList.add('active');
  }

  init();
})();
