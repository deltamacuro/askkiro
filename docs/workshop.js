(function () {
  'use strict';

  /** @type {number} Mision actual (1-based) */
  let current = 1;
  /** @type {number} Total de misiones */
  const total = 9;
  /** @type {Object<number, boolean>} Misiones visitadas */
  let visited = {};
  /** @type {Object<number, boolean>} Misiones verificadas por el usuario */
  let checked = {};
  /** @type {number} Mision donde estaba el fantasma la ultima vez que se movio */
  let ghostAt = 0;
  /** @type {boolean} Indica si hay una transicion de pantalla en curso */
  let transitioning = false;
  /** @type {string|null} Pantalla guardada en localStorage */
  let savedScreen = null;
  /** @type {number} Duracion del fade-out en ms (debe coincidir con CSS transition) */
  const FADE_MS = 350;

  /** Primera mision de cada fase */
  const PHASE_START = { 1: 1, 2: 4, 3: 7 };

  /** @type {Object<string, string>} Clave de localStorage que marca cada overlay como visto al cerrarlo */
  const OVERLAY_SEEN_KEYS = { 'onboard-overlay': 'kiroOnboard' };
  /** @type {BroadcastChannel|null} Canal de sincronizacion con la vista de orador (orador.html) */
  const speakerChannel = typeof BroadcastChannel === 'function' ? new BroadcastChannel('askkiro') : null;
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
   * Marca la URL con #play para distinguir en analytics a quien hace el tutorial.
   */
  function setPlayHash() {
    if (location.hash && location.hash !== '#') return;
    try { history.replaceState(null, '', '#play'); } catch (e) {}
  }

  /**
   * Abre la vista de orador en una ventana aparte.
   * @param {string} source - Desde donde se abrio (para analytics)
   */
  function openSpeakerView(source) {
    trackEvent('mode_select', { mode: 'presenter', source: source });
    const win = window.open('orador.html', 'askkiro-orador', 'popup,width=600,height=860');
    if (win) win.focus();
    else location.href = 'orador.html';
  }

  /**
   * Envia el estado actual (mision y pantalla) a la vista de orador.
   * @param {string} [screenId] - Pantalla destino si hay una transicion en curso
   */
  function broadcastState(screenId) {
    if (!speakerChannel) return;
    const active = document.querySelector('.screen.active');
    speakerChannel.postMessage({ type: 'state', current: current, screen: screenId || (active ? active.id : 'screen-start') });
  }

  /**
   * Avanza o retrocede una mision, saliendo de la portada o del final si hace falta.
   * Lo usan las flechas, los clickers de presentacion y la vista de orador.
   * @param {number} dir - 1 para avanzar, -1 para retroceder
   */
  function step(dir) {
    const active = document.querySelector('.screen.active');
    const screen = active ? active.id : 'screen-start';
    if (screen === 'screen-start') { if (dir > 0) { setPlayHash(); switchScreen('screen-play'); } return; }
    if (screen === 'screen-end') { if (dir < 0) switchScreen('screen-play'); return; }
    if (dir > 0) { if (current < total) goTo(current + 1); else finishTutorial(); }
    else if (current > 1) goTo(current - 1);
  }

  /**
   * Escucha los comandos de la vista de orador: pedir estado, navegar o saltar a una mision.
   */
  function setupSpeakerSync() {
    if (!speakerChannel) return;
    speakerChannel.onmessage = function (e) {
      const msg = e.data || {};
      if (msg.type === 'hello') broadcastState();
      else if (msg.type === 'step') step(msg.dir);
      else if (msg.type === 'goto' && msg.n >= 1 && msg.n <= total) {
        const active = document.querySelector('.screen.active');
        if (!active || active.id !== 'screen-play') switchScreen('screen-play');
        goTo(msg.n);
      }
    };
    broadcastState();
    window.addEventListener('pagehide', function () { speakerChannel.postMessage({ type: 'bye' }); });
  }

  /**
   * Vuelve a la portada y actualiza sus botones al terminar la transicion.
   */
  function goHome() {
    switchScreen('screen-start');
    setTimeout(updateStartButtons, FADE_MS + 50);
  }

  /**
   * Inicializa la aplicacion.
   */
  function init() {
    try {
      if (location.hash === '#presenter') { try { history.replaceState(null, '', '#play'); } catch (e) {} }
      cacheMissionTitles();
      buildDots();
      setupNav();
      setupCopy();
      setupChecks();
      setupTree();
      setupScreens();
      setupHelp();
      loadState();
      updateUI();
      restoreScreen();
      setupSpeakerSync();
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
    const ghost = document.createElement('span');
    ghost.className = 'nav-ghost';
    ghost.id = 'nav-ghost';
    ghost.setAttribute('aria-hidden', 'true');
    ghost.innerHTML = '<img src="kiro.svg" alt="">';
    c.appendChild(ghost);
    if (typeof ResizeObserver === 'function') new ResizeObserver(function () { placeGhost(false); }).observe(c);
  }

  /**
   * Ubica el fantasma sobre el dot de la mision actual.
   * Si cambio de mision, salta en la direccion del movimiento (salto grande al cruzar de fase).
   * @param {boolean} animate - Si debe animar el salto
   */
  function placeGhost(animate) {
    const ghost = document.getElementById('nav-ghost');
    const dot = document.querySelector('.nav-dot[data-m="' + current + '"]');
    if (!ghost || !dot || !dot.offsetWidth) return;
    const x = dot.offsetLeft + dot.offsetWidth / 2 - ghost.offsetWidth / 2;
    ghost.style.setProperty('--ghost-x', x + 'px');
    if (animate && ghostAt && ghostAt !== current) {
      ghost.style.setProperty('--ghost-dir', current > ghostAt ? '-1' : '1');
      hop(ghost, phaseOf(current) !== phaseOf(ghostAt) ? 'jump-big' : 'jump');
    }
    ghostAt = current;
    /* Habilitar la transicion despues del primer posicionamiento para que no se deslice al cargar */
    requestAnimationFrame(function () { ghost.classList.add('ready'); });
  }

  /**
   * Reinicia una animacion del fantasma.
   * @param {HTMLElement} ghost - Elemento del fantasma
   * @param {string} cls - 'jump', 'jump-big' o 'cheer'
   */
  function hop(ghost, cls) {
    ghost.classList.remove('jump', 'jump-big', 'cheer');
    void ghost.offsetWidth; /* forzar reflow para reiniciar la animacion */
    ghost.classList.add(cls);
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
    trackEvent('tutorial_complete', { mode: 'play' });
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
      d.classList.remove('active', 'visited', 'done', 'dot-locked');
      if (locked) {
        d.classList.add('dot-locked');
      } else if (n === current) {
        d.classList.add('active');
      } else if (checked[n]) {
        d.classList.add('done');
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

    document.querySelectorAll('.mission-check-input').forEach(function (input) {
      input.checked = !!checked[missionOf(input)];
    });
    updateTree();
    placeGhost(true);
    broadcastState();
  }

  /**
   * Devuelve el numero de mision que contiene un elemento.
   * @param {Element} el - Elemento dentro de una mision
   * @returns {number}
   */
  function missionOf(el) {
    const m = el.closest('.mission');
    return m ? parseInt(m.getAttribute('data-mission')) : 0;
  }

  /**
   * Configura los checkbox "Verifica": guardan la mision como completada.
   */
  function setupChecks() {
    document.querySelectorAll('.mission-check-input').forEach(function (input) {
      input.addEventListener('change', function () {
        const n = missionOf(input);
        if (input.checked) checked[n] = true;
        else delete checked[n];
        trackEvent('mission_check', { mission: n, checked: input.checked });
        updateUI();
        saveState();
        const ghost = document.getElementById('nav-ghost');
        if (ghost && input.checked) hop(ghost, 'cheer');
      });
    });
  }

  /**
   * Abre el arbol del proyecto por defecto solo en pantallas anchas (en angostas queda colapsado bajo la mision).
   */
  function setupTree() {
    const tree = document.getElementById('kiro-tree');
    if (tree && window.matchMedia('(min-width: 1101px)').matches) tree.open = true;
  }

  /**
   * Actualiza el arbol del proyecto segun la mision actual:
   * lo ya creado se ve normal, lo nuevo se resalta y lo que viene queda atenuado.
   */
  function updateTree() {
    const tree = document.getElementById('kiro-tree');
    if (!tree) return;
    tree.querySelectorAll('.tree-item').forEach(function (item) {
      const from = parseInt(item.getAttribute('data-from'));
      item.classList.toggle('is-future', from > current);
      item.classList.toggle('is-new', from === current && !item.classList.contains('tree-root'));
    });
    tree.querySelectorAll('.tree-note').forEach(function (note) {
      note.classList.toggle('show', parseInt(note.getAttribute('data-only')) === current);
    });
    tree.classList.toggle('is-packed', current === total);
  }

  /**
   * Configura la navegacion: botones prev/next, flechas de teclado, tabs de fases.
   */
  function setupNav() {
    const prev = document.getElementById('btn-prev');
    const next = document.getElementById('btn-next');
    if (prev) prev.addEventListener('click', function () {
      if (current <= 1) goHome();
      else goTo(current - 1);
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

      if (e.repeat) return;
      /* PageDown/PageUp: los clickers de presentacion envian estas teclas */
      if (e.key === 'PageDown' || e.key === 'PageUp') { e.preventDefault(); step(e.key === 'PageDown' ? 1 : -1); return; }
      const play = document.getElementById('screen-play');
      if (!play || !play.classList.contains('active')) return;
      if (['BUTTON', 'A', 'SUMMARY'].includes(e.target.tagName)) return;
      if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); step(1); }
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
    broadcastState(id);

    if (currentScreen) {
      transitioning = true;
      currentScreen.classList.add('fading');
      setTimeout(function () {
        currentScreen.classList.remove('active', 'fading');
        nextScreen.classList.add('active');
        transitioning = false;
        broadcastState();
      }, FADE_MS);
    } else {
      nextScreen.classList.add('active');
    }
  }

  /**
   * Actualiza visibilidad de botones en screen-start segun progreso.
   * Sin progreso: solo "Empezar". Con progreso: "Continuar" (primario) + "Reiniciar" (destructivo).
   */
  function updateStartButtons() {
    const btnPlay = document.getElementById('btn-play');
    const btnContinue = document.getElementById('btn-continue');
    const btnReset = document.getElementById('btn-reset');
    const hasProgress = current > 1 || Object.keys(visited).length > 0 || Object.keys(checked).length > 0 || savedScreen === 'screen-end';
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
   * Configura los eventos de las pantallas: empezar, home, reiniciar, modos.
   */
  function setupScreens() {
    const play = document.getElementById('btn-play');
    const btnContinue = document.getElementById('btn-continue');
    const btnReset = document.getElementById('btn-reset');

    if (play) play.addEventListener('click', function () {
      current = 1;
      visited = {};
      checked = {};
      setPlayHash();
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
      setPlayHash();
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
      checked = {};
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
    if (home) home.addEventListener('click', goHome);

    const btnBackStart = document.getElementById('btn-back-start');
    if (btnBackStart) btnBackStart.addEventListener('click', goHome);

    const btnTeach = document.getElementById('btn-teach');
    if (btnTeach) btnTeach.addEventListener('click', function () { openSpeakerView('end_screen'); });

    const btnSpeaker = document.getElementById('btn-speaker');
    if (btnSpeaker) btnSpeaker.addEventListener('click', function (e) { e.preventDefault(); openSpeakerView('start_screen'); });
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
    try { localStorage.setItem('kiroWS', JSON.stringify({ current: current, visited: visited, checked: checked, screen: screen })); } catch (e) {}
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
      if (s.checked && typeof s.checked === 'object') checked = s.checked;
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
