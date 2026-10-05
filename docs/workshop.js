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
  /** @type {string|null} Pantalla guardada en localStorage */
  let savedScreen = null;
  /** @type {number} Duracion del fade-out en ms (debe coincidir con CSS transition) */
  const FADE_MS = 350;

  /** Primera mision de cada fase */
  const PHASE_START = { 1: 1, 2: 4, 3: 7 };

  /** @type {Object<string, string>} Clave de localStorage que marca cada overlay como visto al cerrarlo */
  const OVERLAY_SEEN_KEYS = { 'onboard-overlay': 'kiroOnboard', 'presenter-onboard-overlay': 'kiroPresenterOnboard' };
  /** @type {Element|null} Elemento con foco antes de abrir un overlay */
  let lastFocus = null;

  /**
   * Titulos de cada mision para aria-labels.
   * @type {string[]}
   */
  const missionTitles = [];

  /**
   * Envia un evento a Google Analytics 4 si gtag esta disponible.
   * @param {string} eventName - Nombre del evento
   * @param {Object} [params] - Parametros adicionales
   */
  function trackEvent(eventName, params) {
    if (typeof gtag === 'function') {
      gtag('event', eventName, params || {});
    }
  }

  /**
   * Devuelve la fase (1-3) a la que pertenece una mision.
   * @param {number} n - Numero de mision (1-based)
   * @returns {number}
   */
  function phaseOf(n) {
    return n >= PHASE_START[3] ? 3 : n >= PHASE_START[2] ? 2 : 1;
  }

  /**
   * Abre un overlay y mueve el foco a un elemento dentro de el.
   * @param {HTMLElement} overlay - Overlay a abrir
   * @param {HTMLElement|null} [focusEl] - Elemento que recibe el foco
   */
  function openOverlay(overlay, focusEl) {
    lastFocus = document.activeElement;
    overlay.classList.add('open');
    if (focusEl) focusEl.focus();
  }

  /**
   * Cierra un overlay, lo marca como visto si corresponde y devuelve el foco.
   * @param {HTMLElement} overlay - Overlay a cerrar
   */
  function closeOverlay(overlay) {
    overlay.classList.remove('open');
    const key = OVERLAY_SEEN_KEYS[overlay.id];
    if (key) { try { localStorage.setItem(key, '1'); } catch (e) {} }
    if (lastFocus && document.contains(lastFocus) && typeof lastFocus.focus === 'function') lastFocus.focus();
    lastFocus = null;
  }

  /**
   * Devuelve el overlay abierto, si hay alguno.
   * @returns {HTMLElement|null}
   */
  function getOpenOverlay() {
    return document.querySelector('.help-overlay.open, .onboard-overlay.open');
  }

  /**
   * Actualiza el hash de la URL segun el modo activo.
   * Permite trackear en analytics si el usuario juega o ensena.
   * @param {string} mode - 'play' o 'presenter'
   */
  function setModeHash(mode) {
    try { history.replaceState(null, '', '#' + mode); } catch (e) {}
  }

  /**
   * Lee el hash de la URL y activa el modo correspondiente al cargar.
   */
  function restoreMode() {
    if (location.hash === '#presenter') document.body.classList.add('mode-presenter');
  }

  /**
   * Inicializa la aplicacion.
   */
  function init() {
    try {
      restoreMode();
      cacheMissionTitles();
      buildDots();
      setupNav();
      setupCopy();
      setupScreens();
      setupHelp();
      setupPresenterOnboard();
      loadState();
      updateUI();
      updateModeLinks();
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
      if (i === PHASE_START[2] || i === PHASE_START[3]) {
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
        if (!isPhaseUnlocked(phaseOf(i))) return;
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
    trackEvent('mission_view', { mission: n, phase: phaseOf(n), title: missionTitles[n] || '' });
    updateUI();
    saveState();
  }

  /**
   * Finaliza el tutorial: marca la ultima mision, trackea el evento y navega a screen-end.
   */
  function finishTutorial() {
    visited[current] = true;
    trackEvent('tutorial_complete', { mode: location.hash.replace('#', '') || 'play' });
    switchScreen('screen-end');
    setTimeout(saveState, FADE_MS + 50);
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
      const locked = !isPhaseUnlocked(phaseOf(n));
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
    if (prev) {
      if (current <= 1) {
        prev.textContent = 'Volver al inicio';
        prev.disabled = false;
        prev.classList.add('nav-btn-home');
      } else {
        prev.textContent = 'Anterior';
        prev.disabled = false;
        prev.classList.remove('nav-btn-home');
      }
    }
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
    if (prev) prev.addEventListener('click', function () {
      if (current <= 1) { switchScreen('screen-start'); setTimeout(function () { updateStartButtons(); updateModeLinks(); }, FADE_MS + 50); }
      else { goTo(current - 1); }
    });
    if (next) next.addEventListener('click', function () {
      if (current >= total) { finishTutorial(); }
      else { goTo(current + 1); }
    });

    document.addEventListener('keydown', function (e) {
      /* Con un overlay abierto: Escape lo cierra, Tab queda atrapado y no se navega por detras */
      const overlay = getOpenOverlay();
      if (overlay) {
        if (e.key === 'Escape') { closeOverlay(overlay); return; }
        if (e.key === 'Tab') trapFocus(overlay, e);
        return;
      }

      const play = document.getElementById('screen-play');
      if (!play || !play.classList.contains('active')) return;
      if (e.repeat) return;
      if (['BUTTON', 'A', 'SUMMARY'].includes(e.target.tagName)) return;
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        if (current < total) goTo(current + 1);
        else if (current >= total) { finishTutorial(); }
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
   * Mantiene el foco de Tab/Shift+Tab dentro de un overlay.
   * @param {HTMLElement} overlay - Overlay abierto
   * @param {KeyboardEvent} e - Evento de teclado
   */
  function trapFocus(overlay, e) {
    const focusable = overlay.querySelectorAll('button, a, summary, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!overlay.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
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
          trackEvent('prompt_copy', { mission: current, text: text.substring(0, 80) });
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
    trackEvent('screen_view', { screen: id });

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
   * Muestra el modal de onboarding del presentador si no lo ha visto antes.
   * Guarda en localStorage para no repetir.
   */
  function showPresenterOnboard() {
    let seen = false;
    try { seen = localStorage.getItem('kiroPresenterOnboard') === '1'; } catch (e) {}
    if (seen) return;
    const overlay = document.getElementById('presenter-onboard-overlay');
    if (!overlay) return;
    setTimeout(function () {
      openOverlay(overlay, document.getElementById('btn-presenter-go'));
    }, FADE_MS + 50);
  }

  /**
   * Configura el boton de cerrar del modal de presentador.
   */
  function setupPresenterOnboard() {
    const goBtn = document.getElementById('btn-presenter-go');
    const overlay = document.getElementById('presenter-onboard-overlay');
    if (goBtn && overlay) goBtn.addEventListener('click', function () { closeOverlay(overlay); });
    if (overlay) overlay.addEventListener('click', function (e) { if (e.target === overlay) closeOverlay(overlay); });
  }

  /**
   * Actualiza visibilidad de botones en screen-start segun progreso.
   * Sin progreso: solo "Empezar". Con progreso: "Continuar" (primario) + "Reiniciar" (destructivo).
   */
  function updateStartButtons() {
    const btnPlay = document.getElementById('btn-play');
    const btnContinue = document.getElementById('btn-continue');
    const btnReset = document.getElementById('btn-reset');
    const hasProgress = current > 1 || Object.keys(visited).length > 0 || savedScreen === 'screen-end';
    if (btnPlay) {
      const wasHidden = btnPlay.hidden;
      btnPlay.hidden = hasProgress;
      if (wasHidden && !hasProgress) {
        btnPlay.style.animation = 'none';
        btnPlay.offsetHeight; /* forzar reflow */
        btnPlay.style.animation = '';
      }
    }
    if (btnContinue) btnContinue.hidden = !hasProgress;
    if (btnReset) btnReset.hidden = !hasProgress;
  }

  /**
   * Actualiza el estado visual del toggle de modo presentador.
   * Sincroniza aria-checked con el estado real del body.
   */
  function updateModeLinks() {
    const toggle = document.getElementById('toggle-presenter');
    if (toggle) {
      const isActive = document.body.classList.contains('mode-presenter');
      toggle.setAttribute('aria-checked', isActive ? 'true' : 'false');
    }
  }

  /**
   * Configura los eventos de las pantallas: empezar, home, reiniciar, modos.
   */
  function setupScreens() {
    const play = document.getElementById('btn-play');
    const btnContinue = document.getElementById('btn-continue');
    const btnReset = document.getElementById('btn-reset');

    if (play) play.addEventListener('click', function () {
      current = 1;
      visited = {};
      if (!location.hash || location.hash === '#') setModeHash('play');
      trackEvent('mode_select', { mode: 'play' });
      updateUI();
      saveState();
      switchScreen('screen-play');
      let seen = false;
      try { seen = localStorage.getItem('kiroOnboard') === '1'; } catch (e) {}
      if (!seen) {
        setTimeout(function () {
          const overlay = document.getElementById('onboard-overlay');
          if (overlay) openOverlay(overlay, document.getElementById('btn-onboard-go'));
        }, FADE_MS + 50);
      }
    });

    if (btnContinue) btnContinue.addEventListener('click', function () {
      if (!location.hash || location.hash === '#') setModeHash('play');
      trackEvent('mode_select', { mode: 'continue' });
      switchScreen('screen-play');
    });

    if (btnReset) btnReset.addEventListener('click', function () {
      const overlay = document.getElementById('reset-overlay');
      if (overlay) openOverlay(overlay, document.getElementById('btn-reset-cancel'));
    });

    const resetCancel = document.getElementById('btn-reset-cancel');
    const resetConfirm = document.getElementById('btn-reset-confirm');
    const resetOverlay = document.getElementById('reset-overlay');

    if (resetCancel && resetOverlay) resetCancel.addEventListener('click', function () { closeOverlay(resetOverlay); });

    if (resetConfirm && resetOverlay) resetConfirm.addEventListener('click', function () {
      closeOverlay(resetOverlay);
      current = 1;
      visited = {};
      savedScreen = null;
      try { localStorage.removeItem('kiroWS'); } catch (e) {}
      updateUI();
      updateStartButtons();
    });

    if (resetOverlay) resetOverlay.addEventListener('click', function (e) { if (e.target === resetOverlay) closeOverlay(resetOverlay); });

    const onboardGo = document.getElementById('btn-onboard-go');
    if (onboardGo) onboardGo.addEventListener('click', function () {
      const overlay = document.getElementById('onboard-overlay');
      if (overlay) closeOverlay(overlay);
    });

    const home = document.getElementById('btn-home');
    if (home) home.addEventListener('click', function () { switchScreen('screen-start'); setTimeout(function () { updateStartButtons(); updateModeLinks(); }, FADE_MS + 50); });

    const btnBackStart = document.getElementById('btn-back-start');
    if (btnBackStart) btnBackStart.addEventListener('click', function () { switchScreen('screen-start'); setTimeout(function () { updateStartButtons(); updateModeLinks(); }, FADE_MS + 50); });

    const btnTeach = document.getElementById('btn-teach');
    if (btnTeach) btnTeach.addEventListener('click', function () {
      document.body.classList.add('mode-presenter');
      setModeHash('presenter');
      trackEvent('mode_select', { mode: 'presenter', source: 'end_screen' });
      switchScreen('screen-start');
      setTimeout(function () { updateStartButtons(); updateModeLinks(); }, FADE_MS + 50);
      showPresenterOnboard();
    });

    const togglePresenter = document.getElementById('toggle-presenter');
    if (togglePresenter) togglePresenter.addEventListener('click', function () {
      const isActive = document.body.classList.contains('mode-presenter');
      document.body.classList.remove('mode-presenter');
      if (isActive) {
        setModeHash('play');
        trackEvent('mode_select', { mode: 'play', source: 'toggle_off' });
        updateModeLinks();
        return;
      }
      document.body.classList.add('mode-presenter');
      setModeHash('presenter');
      trackEvent('mode_select', { mode: 'presenter' });
      updateModeLinks();
      switchScreen('screen-play');
      showPresenterOnboard();
    });
  }

  /**
   * Configura el overlay de ayuda: abrir desde inicio o topbar, cerrar, clic fuera.
   */
  function setupHelp() {
    const overlay = document.getElementById('help-overlay');
    const btnHelp = document.getElementById('btn-help');
    const btnClose = document.getElementById('help-close');
    const btnTopbarHelp = document.getElementById('btn-topbar-help');
    if (!overlay) return;
    if (btnHelp) btnHelp.addEventListener('click', function (e) { e.preventDefault(); openOverlay(overlay, btnClose); });
    if (btnTopbarHelp) btnTopbarHelp.addEventListener('click', function () { openOverlay(overlay, btnClose); });
    if (btnClose) btnClose.addEventListener('click', function () { closeOverlay(overlay); });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeOverlay(overlay); });
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
  function loadState() {
    try {
      const data = localStorage.getItem('kiroWS');
      if (!data) return;
      const s = JSON.parse(data);
      if (Number.isInteger(s.current) && s.current >= 1 && s.current <= total) current = s.current;
      if (s.visited && typeof s.visited === 'object') visited = s.visited;
      if (typeof s.screen === 'string') savedScreen = s.screen;
    } catch (e) {}
  }

  /**
   * Restaura la pantalla activa segun el estado guardado.
   * Siempre arranca en screen-start. Si hay progreso guardado,
   * muestra botones "Continuar" y "Reiniciar".
   * Solo restaura screen-end directamente.
   */
  function restoreScreen() {
    updateStartButtons();

    if (savedScreen === 'screen-end') {
      const start = document.getElementById('screen-start');
      const target = document.getElementById('screen-end');
      if (start) start.classList.remove('active');
      if (target) target.classList.add('active');
    }
  }

  init();
})();
