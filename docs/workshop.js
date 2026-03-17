/**
 * Inicializa la logica interactiva del workshop.
 */
function inicializarWorkshop() {
  try {
    configurarModos();
    configurarPasos();
    configurarProgreso();
    configurarCopyButtons();
    configurarStickyBar();
    configurarReset();
    cargarEstado();
  } catch (error) {
    console.error('Error: no se pudo inicializar el workshop', error);
  }
}

/**
 * Configura los botones de seleccion de modo.
 */
function configurarModos() {
  try {
    var botones = document.querySelectorAll('.mode-btn');
    botones.forEach(function(btn) {
      btn.addEventListener('click', function() {
        try {
          botones.forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          var modo = btn.getAttribute('data-mode');
          document.body.className = 'mode-' + modo;
          document.querySelectorAll('.mode-description').forEach(function(d) {
            d.classList.add('hidden');
          });
          var desc = document.getElementById('desc-' + modo);
          if (desc) desc.classList.remove('hidden');
          var stickyMode = document.getElementById('sticky-mode');
          if (stickyMode) stickyMode.textContent = btn.childNodes[0].textContent.trim();
          guardarEstado();
        } catch (error) {
          console.error('Error: no se pudo cambiar de modo', error);
        }
      });
    });
    document.body.className = 'mode-self-service';
  } catch (error) {
    console.error('Error: no se pudieron configurar los modos', error);
  }
}

/**
 * Configura la interaccion de expandir/colapsar pasos.
 */
function configurarPasos() {
  try {
    var headers = document.querySelectorAll('.step-header');
    headers.forEach(function(header) {
      header.addEventListener('click', function() {
        try {
          var step = header.parentElement;
          step.classList.toggle('open');
          header.setAttribute('aria-expanded', step.classList.contains('open'));
        } catch (error) {
          console.error('Error: no se pudo alternar el paso', error);
        }
      });
      header.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          header.click();
        }
      });
    });
  } catch (error) {
    console.error('Error: no se pudieron configurar los pasos', error);
  }
}

/**
 * Configura los checkboxes para actualizar progreso y marcar pasos completados.
 */
function configurarProgreso() {
  try {
    var checks = document.querySelectorAll('.step-check');
    checks.forEach(function(check) {
      check.addEventListener('change', function() {
        try {
          var step = check.closest('.step');
          if (step) {
            if (check.checked) {
              step.classList.add('completed');
            } else {
              step.classList.remove('completed');
            }
          }
          actualizarProgreso();
          guardarEstado();
        } catch (error) {
          console.error('Error: no se pudo actualizar el progreso', error);
        }
      });
    });
  } catch (error) {
    console.error('Error: no se pudo configurar el progreso', error);
  }
}

/**
 * Actualiza la barra de progreso, texto y sticky bar.
 */
function actualizarProgreso() {
  try {
    var checks = document.querySelectorAll('.step-check');
    var total = checks.length;
    var completados = 0;
    checks.forEach(function(c) { if (c.checked) completados++; });
    var porcentaje = total > 0 ? (completados / total) * 100 : 0;

    var fill = document.getElementById('progress-fill');
    var text = document.getElementById('progress-text');
    var stickyFill = document.getElementById('sticky-progress-fill');
    var stickyCount = document.getElementById('sticky-count');

    if (fill) fill.style.width = porcentaje + '%';
    if (text) text.textContent = completados + ' de ' + total + ' completados';
    if (stickyFill) stickyFill.style.width = porcentaje + '%';
    if (stickyCount) stickyCount.textContent = completados + '/' + total;
  } catch (error) {
    console.error('Error: no se pudo actualizar el progreso', error);
  }
}

/**
 * Configura todos los botones de copiar.
 */
function configurarCopyButtons() {
  try {
    document.querySelectorAll('.copy-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        try {
          e.stopPropagation();
          var target = btn.getAttribute('data-target');
          var texto = '';
          if (target) {
            var el = document.getElementById(target);
            if (el) texto = el.textContent;
          } else {
            var codeEl = btn.parentElement.querySelector('code');
            if (codeEl) texto = codeEl.textContent;
          }
          if (texto) {
            navigator.clipboard.writeText(texto.trim()).then(function() {
              var original = btn.textContent;
              btn.textContent = 'Copiado';
              btn.classList.add('copied');
              setTimeout(function() {
                btn.textContent = original;
                btn.classList.remove('copied');
              }, 1500);
            });
          }
        } catch (error) {
          console.error('Error: no se pudo copiar al portapapeles', error);
        }
      });
    });
  } catch (error) {
    console.error('Error: no se pudieron configurar los botones de copiar', error);
  }
}

/**
 * Configura la sticky bar que aparece al scrollear.
 */
function configurarStickyBar() {
  try {
    var stickyBar = document.getElementById('sticky-bar');
    var hero = document.querySelector('.hero');
    if (!stickyBar || !hero) return;

    window.addEventListener('scroll', function() {
      try {
        var heroBottom = hero.getBoundingClientRect().bottom;
        if (heroBottom < 0) {
          stickyBar.classList.add('visible');
        } else {
          stickyBar.classList.remove('visible');
        }
      } catch (error) {
        console.error('Error: no se pudo actualizar la sticky bar', error);
      }
    }, { passive: true });
  } catch (error) {
    console.error('Error: no se pudo configurar la sticky bar', error);
  }
}

/**
 * Configura el boton de reiniciar progreso.
 */
function configurarReset() {
  try {
    var btn = document.getElementById('reset-btn');
    if (!btn) return;
    btn.addEventListener('click', function() {
      try {
        document.querySelectorAll('.step-check').forEach(function(c) {
          c.checked = false;
        });
        document.querySelectorAll('.step').forEach(function(s) {
          s.classList.remove('completed');
        });
        actualizarProgreso();
        guardarEstado();
      } catch (error) {
        console.error('Error: no se pudo reiniciar el progreso', error);
      }
    });
  } catch (error) {
    console.error('Error: no se pudo configurar el boton de reset', error);
  }
}

/**
 * Guarda el estado actual en localStorage.
 */
function guardarEstado() {
  try {
    var modoActivo = document.querySelector('.mode-btn.active');
    var modo = modoActivo ? modoActivo.getAttribute('data-mode') : 'self-service';
    var checks = [];
    document.querySelectorAll('.step-check').forEach(function(c) {
      checks.push(c.checked);
    });
    localStorage.setItem('kiroWorkshop', JSON.stringify({ modo: modo, checks: checks }));
  } catch (error) {
    console.error('Error: no se pudo guardar el estado', error);
  }
}

/**
 * Carga el estado guardado desde localStorage.
 */
function cargarEstado() {
  try {
    var datos = localStorage.getItem('kiroWorkshop');
    if (!datos) {
      actualizarProgreso();
      return;
    }
    var estado = JSON.parse(datos);
    if (estado.modo) {
      var btn = document.querySelector('.mode-btn[data-mode="' + estado.modo + '"]');
      if (btn) btn.click();
    }
    if (estado.checks && Array.isArray(estado.checks)) {
      var checkboxes = document.querySelectorAll('.step-check');
      estado.checks.forEach(function(val, i) {
        if (checkboxes[i]) {
          checkboxes[i].checked = val;
          if (val) {
            var step = checkboxes[i].closest('.step');
            if (step) step.classList.add('completed');
          }
        }
      });
    }
    actualizarProgreso();
  } catch (error) {
    console.error('Error: no se pudo cargar el estado guardado', error);
    actualizarProgreso();
  }
}

inicializarWorkshop();
