/**
 * Inicializa el workshop.
 */
function init() {
  try {
    setupCopyButtons();
    setupCheckboxes();
    setupMissionClicks();
    setupStickyBar();
    setupModes();
    loadState();
  } catch (e) {
    console.error('Error: no se pudo inicializar', e);
  }
}

/**
 * Configura todos los botones Ask Kiro para copiar.
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
            setTimeout(function() {
              btn.innerHTML = orig;
              btn.classList.remove('copied');
            }, 2000);
          });
        } catch (e) {
          console.error('Error: no se pudo copiar', e);
        }
      });
    });
  } catch (e) {
    console.error('Error: no se pudieron configurar los botones', e);
  }
}

/**
 * Configura los checkboxes para avanzar misiones.
 */
function setupCheckboxes() {
  try {
    document.querySelectorAll('.check-input').forEach(function(cb) {
      cb.addEventListener('change', function() {
        try {
          var mission = cb.closest('.mission');
          if (!mission) return;
          if (cb.checked) {
            mission.classList.remove('active');
            mission.classList.add('completed');
            var next = mission.nextElementSibling;
            while (next && !next.classList.contains('mission')) {
              next = next.nextElementSibling;
            }
            if (next && !next.classList.contains('completed')) {
              next.classList.add('active');
              setTimeout(function() {
                next.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 300);
            }
          } else {
            mission.classList.remove('completed');
            mission.classList.add('active');
          }
          updateProgress();
          saveState();
        } catch (e) {
          console.error('Error: no se pudo actualizar la mision', e);
        }
      });
    });
  } catch (e) {
    console.error('Error: no se pudieron configurar los checkboxes', e);
  }
}

/**
 * Permite hacer clic en el head de una mision para expandirla.
 */
function setupMissionClicks() {
  try {
    document.querySelectorAll('.mission-head').forEach(function(head) {
      head.addEventListener('click', function() {
        try {
          var mission = head.closest('.mission');
          if (!mission || mission.classList.contains('active')) return;
          document.querySelectorAll('.mission.active').forEach(function(m) {
            if (!m.classList.contains('completed')) {
              m.classList.remove('active');
            }
          });
          mission.classList.add('active');
        } catch (e) {
          console.error('Error: no se pudo expandir la mision', e);
        }
      });
    });
  } catch (e) {
    console.error('Error: no se pudieron configurar los clics', e);
  }
}

/**
 * Actualiza la barra de progreso.
 */
function updateProgress() {
  try {
    var total = document.querySelectorAll('.check-input').length;
    var done = document.querySelectorAll('.check-input:checked').length;
    var pct = total > 0 ? ((done + 1) / (total + 1)) * 100 : 0;
    if (done === total) pct = 100;

    var stickyFill = document.getElementById('sticky-fill');
    var stickyCount = document.getElementById('sticky-count');
    if (stickyFill) stickyFill.style.width = Math.max(pct, 11) + '%';
    if (stickyCount) stickyCount.textContent = done + '/' + total;
  } catch (e) {
    console.error('Error: no se pudo actualizar el progreso', e);
  }
}

/**
 * Configura la sticky bar.
 */
function setupStickyBar() {
  try {
    var bar = document.getElementById('sticky-bar');
    var hero = document.querySelector('.hero');
    if (!bar || !hero) return;
    window.addEventListener('scroll', function() {
      try {
        if (hero.getBoundingClientRect().bottom < 0) {
          bar.classList.add('visible');
        } else {
          bar.classList.remove('visible');
        }
      } catch (e) {}
    }, { passive: true });
  } catch (e) {
    console.error('Error: no se pudo configurar la sticky bar', e);
  }
}

/**
 * Configura los modos (presentador/remix).
 */
function setupModes() {
  try {
    document.querySelectorAll('.other-mode-card').forEach(function(card) {
      card.addEventListener('click', function(e) {
        try {
          e.preventDefault();
          var mode = card.getAttribute('data-mode');
          document.body.className = 'mode-' + mode;
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (e) {
          console.error('Error: no se pudo cambiar de modo', e);
        }
      });
    });
  } catch (e) {
    console.error('Error: no se pudieron configurar los modos', e);
  }
}

/**
 * Guarda el estado.
 */
function saveState() {
  try {
    var checks = [];
    document.querySelectorAll('.check-input').forEach(function(c) {
      checks.push(c.checked);
    });
    localStorage.setItem('kiroWorkshop', JSON.stringify({ checks: checks }));
  } catch (e) {
    console.error('Error: no se pudo guardar', e);
  }
}

/**
 * Carga el estado guardado.
 */
function loadState() {
  try {
    var data = localStorage.getItem('kiroWorkshop');
    if (!data) { updateProgress(); return; }
    var state = JSON.parse(data);
    if (state.checks && Array.isArray(state.checks)) {
      var cbs = document.querySelectorAll('.check-input');
      var lastCompleted = -1;
      state.checks.forEach(function(val, i) {
        if (cbs[i] && val) {
          cbs[i].checked = true;
          var m = cbs[i].closest('.mission');
          if (m) {
            m.classList.remove('active');
            m.classList.add('completed');
          }
          lastCompleted = i;
        }
      });
      if (lastCompleted >= 0 && lastCompleted < cbs.length - 1) {
        var next = cbs[lastCompleted + 1].closest('.mission');
        if (next) next.classList.add('active');
      }
    }
    updateProgress();
  } catch (e) {
    console.error('Error: no se pudo cargar el estado', e);
    updateProgress();
  }
}

init();
