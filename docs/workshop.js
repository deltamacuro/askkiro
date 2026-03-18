/**
 * Estado del workshop.
 */
var state = { phase: 1, steps: {} };

/**
 * Inicializa.
 */
function init() {
  try {
    loadState();
    setupPhaseTabs();
    setupStepDots();
    setupCheckboxes();
    setupCopyButtons();
    setupModes();
    setupHeroStart();
  } catch (e) { console.error('Error al inicializar', e); }
}

/**
 * Muestra una fase.
 * @param {number} num
 */
function showPhase(num) {
  try {
    document.body.classList.add('immersive');

    document.querySelectorAll('.phase').forEach(function(p) { p.classList.remove('active'); });
    var phase = document.getElementById('phase-' + num);
    if (phase) phase.classList.add('active');

    document.querySelectorAll('.phase-tab').forEach(function(t) { t.classList.remove('active'); });
    var tab = document.querySelector('.phase-tab[data-phase="' + num + '"]');
    if (tab) tab.classList.add('active');

    state.phase = num;
    saveState();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (e) { console.error('Error al mostrar fase', e); }
}

/**
 * Muestra un paso dentro de la fase activa.
 * @param {number} stepNum
 */
function showStep(stepNum) {
  try {
    var phase = document.querySelector('.phase.active');
    if (!phase) return;

    phase.querySelectorAll('.step').forEach(function(s) { s.classList.remove('active'); });
    var step = phase.querySelector('.step[data-step="' + stepNum + '"]');
    if (step) step.classList.add('active');

    phase.querySelectorAll('.step-dot').forEach(function(d) {
      var dStep = parseInt(d.getAttribute('data-step'));
      d.classList.remove('active');
      if (dStep === stepNum) d.classList.add('active');
    });
  } catch (e) { console.error('Error al mostrar paso', e); }
}

/**
 * Configura los tabs de fase.
 */
function setupPhaseTabs() {
  try {
    document.querySelectorAll('.phase-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        if (tab.classList.contains('locked')) return;
        showPhase(parseInt(tab.getAttribute('data-phase')));
      });
    });
  } catch (e) { console.error('Error en tabs', e); }
}

/**
 * Configura los dots de paso.
 */
function setupStepDots() {
  try {
    document.querySelectorAll('.step-dot').forEach(function(dot) {
      dot.addEventListener('click', function() {
        showStep(parseInt(dot.getAttribute('data-step')));
      });
    });
  } catch (e) { console.error('Error en dots', e); }
}

/**
 * Configura checkboxes.
 */
function setupCheckboxes() {
  try {
    document.querySelectorAll('.check-input').forEach(function(cb) {
      cb.addEventListener('change', function() {
        try {
          var stepNum = parseInt(cb.getAttribute('data-step'));
          state.steps[stepNum] = cb.checked;

          var dot = document.querySelector('.step-dot[data-step="' + stepNum + '"]');
          if (dot) {
            if (cb.checked) { dot.classList.add('done'); dot.classList.remove('active'); }
            else { dot.classList.remove('done'); }
          }

          // Mark line as done
          updateLines();

          if (cb.checked) {
            var phase = cb.closest('.phase');
            var phaseNum = parseInt(phase.getAttribute('data-phase'));
            var stepsInPhase = phase.querySelectorAll('.check-input');
            var allDone = true;
            stepsInPhase.forEach(function(c) { if (!c.checked) allDone = false; });

            if (allDone) {
              unlockNextPhase(phaseNum);
              // Check if ALL phases done
              var totalDone = document.querySelectorAll('.check-input:checked').length;
              var totalSteps = document.querySelectorAll('.check-input').length;
              if (totalDone === totalSteps) {
                setTimeout(function() {
                  document.body.classList.remove('immersive');
                  document.querySelectorAll('.phase').forEach(function(p) { p.classList.remove('active'); });
                  var finale = document.getElementById('finale');
                  if (finale) finale.classList.add('visible');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 1000);
              }
            } else {
              // Advance to next step in phase
              var nextStep = stepNum + 1;
              var nextStepEl = phase.querySelector('.step[data-step="' + nextStep + '"]');
              if (nextStepEl) {
                setTimeout(function() { showStep(nextStep); }, 400);
              }
            }
          }
          saveState();
        } catch (e) { console.error('Error en checkbox', e); }
      });
    });
  } catch (e) { console.error('Error en checkboxes', e); }
}

/**
 * Desbloquea la siguiente fase.
 * @param {number} completedPhase
 */
function unlockNextPhase(completedPhase) {
  try {
    var nextPhaseNum = completedPhase + 1;
    var nextTab = document.querySelector('.phase-tab[data-phase="' + nextPhaseNum + '"]');
    if (!nextTab) return;

    // Mark current tab as completed
    var currentTab = document.querySelector('.phase-tab[data-phase="' + completedPhase + '"]');
    if (currentTab) currentTab.classList.add('completed');

    // Unlock next
    nextTab.classList.remove('locked');
    nextTab.classList.add('unlocked');

    // Auto-switch after delay
    setTimeout(function() { showPhase(nextPhaseNum); }, 800);
  } catch (e) { console.error('Error al desbloquear fase', e); }
}

/**
 * Actualiza las lineas entre dots.
 */
function updateLines() {
  try {
    document.querySelectorAll('.step-indicators').forEach(function(ind) {
      var dots = ind.querySelectorAll('.step-dot');
      var lines = ind.querySelectorAll('.step-line');
      dots.forEach(function(d, i) {
        if (i < lines.length && d.classList.contains('done')) {
          lines[i].classList.add('done');
        }
      });
    });
  } catch (e) {}
}

/**
 * Configura botones de copiar.
 */
function setupCopyButtons() {
  try {
    document.querySelectorAll('.ask-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        try {
          e.stopPropagation();
          var code = btn.parentElement.querySelector('code');
          if (!code) return;
          navigator.clipboard.writeText(code.textContent.trim()).then(function() {
            var orig = btn.innerHTML;
            btn.classList.add('copied');
            btn.textContent = 'Copiado';
            setTimeout(function() { btn.innerHTML = orig; btn.classList.remove('copied'); }, 2000);
          });
        } catch (e) { console.error('Error al copiar', e); }
      });
    });
  } catch (e) { console.error('Error en copy buttons', e); }
}

/**
 * Configura el boton Empezar del hero.
 */
function setupHeroStart() {
  try {
    var btn = document.getElementById('hero-start-btn');
    if (!btn) return;
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      var hero = document.querySelector('.hero');
      if (hero) {
        hero.classList.add('exiting');
        setTimeout(function() {
          showPhase(state.phase || 1);
        }, 400);
      }
    });

    // Hero mode links
    document.querySelectorAll('.hero-mode').forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        var mode = link.getAttribute('data-mode');
        document.body.className = 'mode-' + mode;
        var hero = document.querySelector('.hero');
        if (hero) {
          hero.classList.add('exiting');
          setTimeout(function() { showPhase(1); }, 400);
        }
      });
    });

    // Finale restart
    var restart = document.getElementById('finale-restart');
    if (restart) {
      restart.addEventListener('click', function() {
        localStorage.removeItem('kiroWS');
        location.reload();
      });
    }
  } catch (e) { console.error('Error en hero start', e); }
}

/**
 * Configura modos (ahora en hero).
 */
function setupModes() {}

/**
 * Guarda estado.
 */
function saveState() {
  try {
    localStorage.setItem('kiroWS', JSON.stringify(state));
  } catch (e) {}
}

/**
 * Carga estado.
 */
function loadState() {
  try {
    var data = localStorage.getItem('kiroWS');
    if (!data) return;
    var saved = JSON.parse(data);
    if (saved.steps) {
      Object.keys(saved.steps).forEach(function(key) {
        var stepNum = parseInt(key);
        if (saved.steps[key]) {
          var cb = document.querySelector('.check-input[data-step="' + stepNum + '"]');
          if (cb) { cb.checked = true; }
          var dot = document.querySelector('.step-dot[data-step="' + stepNum + '"]');
          if (dot) { dot.classList.add('done'); dot.classList.remove('active'); }
        }
      });
      updateLines();

      // Unlock phases based on completed steps
      [1, 2, 3].forEach(function(phaseNum) {
        var phase = document.getElementById('phase-' + phaseNum);
        if (!phase) return;
        var checks = phase.querySelectorAll('.check-input');
        var allDone = true;
        checks.forEach(function(c) { if (!c.checked) allDone = false; });
        if (allDone && phaseNum < 3) {
          var tab = document.querySelector('.phase-tab[data-phase="' + phaseNum + '"]');
          if (tab) tab.classList.add('completed');
          var nextTab = document.querySelector('.phase-tab[data-phase="' + (phaseNum + 1) + '"]');
          if (nextTab) { nextTab.classList.remove('locked'); nextTab.classList.add('unlocked'); }
        }
      });
    }
    if (saved.phase) showPhase(saved.phase);
  } catch (e) { console.error('Error al cargar estado', e); }
}

init();
