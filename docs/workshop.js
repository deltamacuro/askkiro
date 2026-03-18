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
    configurarSetupTabs();
    configurarAskKiroBtn();
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
    document.body.className = 'mode-self-service';
    actualizarAskKiro('self-service');

    var cards = document.querySelectorAll('.other-mode-card');
    cards.forEach(function(card) {
      card.addEventListener('click', function(e) {
        try {
          e.preventDefault();
          var modo = card.getAttribute('data-mode');
          document.body.className = 'mode-' + modo;
          actualizarAskKiro(modo);
          var stickyMode = document.getElementById('sticky-mode');
          if (stickyMode) {
            var title = card.querySelector('.other-mode-title');
            if (title) stickyMode.textContent = title.textContent;
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
          console.error('Error: no se pudo cambiar de modo', error);
        }
      });
    });
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

/**
 * Configura los tabs del setup (Terminal, ZIP, Desde Kiro).
 */
function configurarSetupTabs() {
  try {
    var tabs = document.querySelectorAll('.setup-tab');
    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        try {
          tabs.forEach(function(t) { t.classList.remove('active'); });
          tab.classList.add('active');
          document.querySelectorAll('.setup-tab-content').forEach(function(c) {
            c.classList.remove('active');
          });
          var target = document.getElementById(tab.getAttribute('data-tab'));
          if (target) target.classList.add('active');
        } catch (error) {
          console.error('Error: no se pudo cambiar de tab', error);
        }
      });
    });
  } catch (error) {
    console.error('Error: no se pudieron configurar los tabs de setup', error);
  }
}

/**
 * Actualiza las URLs del setup segun el modo seleccionado.
 * @param {string} modo - El modo activo (self-service, presenter, remix).
 */
function actualizarSetupUrls(modo) {
  try {
    var branches = {
      'self-service': 'modo-self-service',
      'presenter': 'modo-presentador',
      'remix': 'modo-remix'
    };
    var branch = branches[modo] || 'modo-self-service';
    var base = 'https://github.com/deltamacuro/kiro-paso-a-paso';

    var cloneSetup = document.getElementById('clone-setup');
    if (cloneSetup) cloneSetup.textContent = 'git clone -b ' + branch + ' ' + base + '.git';

    var zipLink = document.getElementById('zip-link');
    if (zipLink) zipLink.href = base + '/archive/refs/heads/' + branch + '.zip';
  } catch (error) {
    console.error('Error: no se pudieron actualizar las URLs de setup', error);
  }
}

/** @type {Object.<string, {title: string, desc: string, btn: string, prompt: string}>} */
var askKiroContent = {
  'self-service': {
    title: 'Empieza el workshop',
    desc: 'Copia el prompt y pegalo en el chat de Kiro',
    btn: 'Ask Kiro',
    prompt: 'Eres mi instructor para un workshop de Kiro llamado "De vibe coding a software real". Vamos a construir un conversor de temperaturas juntos, y en cada sesion me vas a ensenar una feature de Kiro resolviendo un problema real.\n\nLas 9 sesiones son:\n1. Vibe Coding \u2014 Crear la app con un solo prompt\n2. Steering \u2014 Crear convenciones del equipo que se apliquen siempre\n3. Specs \u2014 Planificar una feature (historial) con requirements, design y tasks\n4. Hooks \u2014 Automatizar revision de codigo al guardar\n5. Agents \u2014 Crear un agente revisor con criterio propio\n6. Skills \u2014 Crear conocimiento de dominio (fisica de temperaturas)\n7. Web Search \u2014 Buscar datos reales sin salir del IDE\n8. MCP \u2014 Conectar con documentacion oficial de AWS\n9. Powers \u2014 Empaquetar todo en una unidad distribuible\n\nReglas:\n- Presentame UNA sesion a la vez\n- Explicame primero el PROBLEMA que resuelve, luego guiame a la solucion\n- Esperame antes de avanzar a la siguiente\n- Si me pierdo, ayudame sin saltarte pasos\n- Habla en espanol, se conciso y practico\n\nEmpecemos por la sesion 1.'
  },
  'remix': {
    title: 'Crea tu propia version',
    desc: 'Abre una carpeta vacia en Kiro y pega este prompt',
    btn: 'Ask Kiro',
    prompt: 'Quiero que me crees un workshop completo de Kiro para un dominio que yo elija, con la misma estructura que "De vibe coding a software real" pero aplicado a otro tema.\n\nPrimero preguntame que tipo de proyecto quiero. Ejemplos: conversor de monedas, calculadora de IMC, tracker de habitos, generador de paletas de color, dashboard de marketing, lista de tareas, calculadora de prestamos, etc.\n\nUna vez que elija, genera TODO esto en el workspace:\n\n1. La app base (index.html, app.js, styles.css) — funcional y con buena UI\n2. .kiro/steering/convenciones.md — convenciones adaptadas al dominio\n3. .kiro/skills/ — una skill con conocimiento de dominio relevante\n4. .kiro/agents/revisor.md — un agente revisor adaptado\n5. .kiro/hooks/ — un hook de validacion al guardar .js\n6. .kiro/specs/ — una spec completa (requirements, design, tasks) para una feature relevante\n7. powers/ — un Power que empaquete todo lo anterior con POWER.md\n8. README.md — con la guia del workshop adaptada al dominio, las 9 sesiones, y el cheat sheet\n\nEl README debe seguir esta estructura:\n- Titulo: "Kiro Demo — De vibe coding a software real"\n- Subtitulo: "Proyecto: [nombre del proyecto]"\n- Las 9 sesiones con el mismo formato: problema, solucion, prompt, "lo que dices"\n- Cheat sheet al final\n\nReglas:\n- Crea TODOS los archivos de una vez\n- El proyecto debe funcionar al abrir index.html en el browser\n- Usa las convenciones del steering que generes\n- Habla en espanol\n- Al terminar, dame un resumen de lo que creaste\n\nEmpecemos. Preguntame que proyecto quiero.'
  }
};

/**
 * Actualiza el contenido del Ask Kiro card segun el modo.
 * @param {string} modo - El modo activo.
 */
function actualizarAskKiro(modo) {
  try {
    var content = askKiroContent[modo];
    if (!content) return;

    var text = document.getElementById('ask-kiro-text');
    var status = document.getElementById('ask-kiro-status');
    var btnText = document.getElementById('hero-btn-text');

    if (text) text.textContent = content.prompt;
    if (status) status.textContent = content.desc;
    if (btnText) btnText.textContent = content.btn;
  } catch (error) {
    console.error('Error: no se pudo actualizar el Ask Kiro card', error);
  }
}

/**
 * Configura el boton principal de Ask Kiro.
 */
function configurarAskKiroBtn() {
  try {
    var btn = document.getElementById('ask-kiro-btn');
    if (!btn) return;

    btn.addEventListener('click', function() {
      try {
        var text = document.getElementById('ask-kiro-text');
        if (!text) return;

        navigator.clipboard.writeText(text.textContent.trim()).then(function() {
          var status = document.getElementById('ask-kiro-status');
          var btnText = document.getElementById('hero-btn-text');
          var btnSub = btn.querySelector('.hero-btn-sub');
          btn.classList.add('copied');
          if (btnText) btnText.textContent = 'Prompt copiado';
          if (btnSub) btnSub.textContent = 'Pega con Cmd+V en el chat de Kiro';
          if (status) {
            status.textContent = '';
            status.classList.add('active');
          }

          // Animate flow steps
          var steps = document.querySelectorAll('.hero-flow-step');
          steps.forEach(function(s) { s.classList.remove('active', 'done'); });
          if (steps[0]) steps[0].classList.add('done');
          if (steps[1]) steps[1].classList.add('active');
          setTimeout(function() {
            if (steps[1]) { steps[1].classList.remove('active'); steps[1].classList.add('done'); }
            if (steps[2]) steps[2].classList.add('active');
          }, 1500);

          setTimeout(function() {
            btn.classList.remove('copied');
            var mode = getCurrentMode();
            if (btnText) btnText.textContent = askKiroContent[mode].btn;
            if (btnSub) btnSub.textContent = 'Copia el prompt para el chat';
            if (status) {
              status.textContent = '';
              status.classList.remove('active');
            }
            steps.forEach(function(s) { s.classList.remove('active', 'done'); });
          }, 5000);
        });
      } catch (error) {
        console.error('Error: no se pudo copiar el prompt', error);
      }
    });
  } catch (error) {
    console.error('Error: no se pudo configurar el boton Ask Kiro', error);
  }
}

/**
 * Retorna el modo activo actual.
 * @returns {string}
 */
function getCurrentMode() {
  try {
    var active = document.querySelector('.mode-btn.active');
    return active ? active.getAttribute('data-mode') : 'self-service';
  } catch (error) {
    return 'self-service';
  }
}

inicializarWorkshop();
