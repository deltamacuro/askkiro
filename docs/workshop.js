/**
 * Inicializa la lógica interactiva del workshop.
 */
function inicializarWorkshop() {
  try {
    configurarModos();
    configurarPasos();
    configurarProgreso();
    cargarEstado();
  } catch (error) {
    console.error('Error: no se pudo inicializar el workshop', error);
  }
}

/**
 * Configura los botones de selección de modo (self-service, presenter, remix).
 */
function configurarModos() {
  try {
    const botones = document.querySelectorAll('.mode-btn');
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
 * Configura la interacción de expandir/colapsar pasos.
 */
function configurarPasos() {
  try {
    var headers = document.querySelectorAll('.step-header');
    headers.forEach(function(header) {
      header.addEventListener('click', function() {
        try {
          var step = header.parentElement;
          step.classList.toggle('open');
          var expanded = step.classList.contains('open');
          header.setAttribute('aria-expanded', expanded);
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
 * Configura los checkboxes para actualizar la barra de progreso.
 */
function configurarProgreso() {
  try {
    var checks = document.querySelectorAll('.step-check');
    checks.forEach(function(check) {
      check.addEventListener('change', function() {
        try {
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
 * Actualiza la barra de progreso y el texto según los checkboxes marcados.
 */
function actualizarProgreso() {
  try {
    var checks = document.querySelectorAll('.step-check');
    var total = checks.length;
    var completados = 0;
    checks.forEach(function(c) {
      if (c.checked) completados++;
    });

    var porcentaje = total > 0 ? (completados / total) * 100 : 0;
    var fill = document.getElementById('progress-fill');
    var text = document.getElementById('progress-text');

    if (fill) fill.style.width = porcentaje + '%';
    if (text) text.textContent = 'Paso ' + completados + ' de ' + total;
  } catch (error) {
    console.error('Error: no se pudo actualizar el progreso', error);
  }
}

/**
 * Guarda el estado actual (modo y checkboxes) en localStorage.
 */
function guardarEstado() {
  try {
    var modoActivo = document.querySelector('.mode-btn.active');
    var modo = modoActivo ? modoActivo.getAttribute('data-mode') : 'self-service';

    var checks = [];
    document.querySelectorAll('.step-check').forEach(function(c, i) {
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
        if (checkboxes[i]) checkboxes[i].checked = val;
      });
    }

    actualizarProgreso();
  } catch (error) {
    console.error('Error: no se pudo cargar el estado guardado', error);
    actualizarProgreso();
  }
}

inicializarWorkshop();
