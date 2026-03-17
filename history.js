/**
 * Módulo de historial de conversiones.
 * Gestiona el almacenamiento, serialización y renderizado del historial.
 */

/**
 * @typedef {Object} EntradaDeHistorial
 * @property {number} valor - Valor numérico original ingresado por el usuario.
 * @property {string} desde - Unidad de origen ('C', 'F' o 'K').
 * @property {string} hacia - Unidad de destino ('C', 'F' o 'K').
 * @property {string} resultado - Resultado de la conversión formateado como string.
 */

/** @type {Array<EntradaDeHistorial>} */
let listaDeConversiones = [];

/** @type {boolean} Detecta disponibilidad de localStorage al cargar el módulo */
let storageDisponible = (function() {
  try {
    const clavePrueba = '__storage_test__';
    localStorage.setItem(clavePrueba, '1');
    localStorage.removeItem(clavePrueba);
    return true;
  } catch (error) {
    console.error('Error: no se pudo acceder al almacenamiento local');
    return false;
  }
})();

/** @type {string[]} Unidades de temperatura válidas */
const unidadesValidas = ['C', 'F', 'K'];

/**
 * Valida que un objeto tenga la estructura de EntradaDeHistorial.
 * @param {*} obj - El objeto a validar.
 * @returns {boolean} true si es válido.
 */
function esEntradaValida(obj) {
  try {
    if (obj === null || typeof obj !== 'object') {
      return false;
    }

    if (typeof obj.valor !== 'number' || !isFinite(obj.valor)) {
      return false;
    }

    if (typeof obj.desde !== 'string' || !unidadesValidas.includes(obj.desde)) {
      return false;
    }

    if (typeof obj.hacia !== 'string' || !unidadesValidas.includes(obj.hacia)) {
      return false;
    }

    if (typeof obj.resultado !== 'string' || obj.resultado.length === 0) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error: no se pudo validar la entrada del historial', error);
    return false;
  }
}

/**
 * Serializa la lista de conversiones a JSON.
 * @param {Array<EntradaDeHistorial>} lista - La lista a serializar.
 * @returns {string} La cadena JSON.
 */
function serializar(lista) {
  try {
    return JSON.stringify(lista);
  } catch (error) {
    console.error('Error: no se pudieron procesar los datos del historial', error);
    return '[]';
  }
}

/**
 * Deserializa una cadena JSON a lista de conversiones.
 * Filtra entradas inválidas del resultado.
 * Retorna un arreglo vacío si la cadena es inválida.
 * @param {string} json - La cadena JSON.
 * @returns {Array<EntradaDeHistorial>}
 */
function deserializar(json) {
  try {
    const datos = JSON.parse(json);

    if (!Array.isArray(datos)) {
      return [];
    }

    return datos.filter(esEntradaValida);
  } catch (error) {
    console.error('Error: no se pudieron procesar los datos del historial', error);
    return [];
  }
}

/**
 * Lee la lista de conversiones desde localStorage.
 * Retorna un arreglo vacío si los datos son inválidos o no existen.
 * @returns {Array<EntradaDeHistorial>}
 */
function cargarDesdeStorage() {
  try {
    if (!storageDisponible) {
      console.error('Error: no se pudo acceder al almacenamiento local');
      return [];
    }

    const datos = localStorage.getItem('conversionHistory');

    if (datos === null) {
      return [];
    }

    return deserializar(datos);
  } catch (error) {
    console.error('Error: no se pudo acceder al almacenamiento local', error);
    return [];
  }
}

/**
 * Guarda la lista de conversiones en localStorage como JSON.
 * @param {Array<EntradaDeHistorial>} lista - La lista a guardar.
 * @returns {void}
 */
function guardarEnStorage(lista) {
  try {
    if (!storageDisponible) {
      console.error('Error: no se pudo acceder al almacenamiento local');
      return;
    }

    localStorage.setItem('conversionHistory', serializar(lista));
  } catch (error) {
    console.error('Error: no se pudo acceder al almacenamiento local', error);
  }
}

/**
 * Agrega una entrada al historial después de una conversión exitosa.
 * Valida la entrada, inserta al inicio, recorta a máximo 10 y persiste.
 * @param {EntradaDeHistorial} entrada - La entrada de historial a agregar.
 * @returns {void}
 */
function agregarAlHistorial(entrada) {
  try {
    if (!esEntradaValida(entrada)) {
      return;
    }

    listaDeConversiones.unshift(entrada);

    if (listaDeConversiones.length > 10) {
      listaDeConversiones.splice(10);
    }

    guardarEnStorage(listaDeConversiones);
    renderizarHistorial(listaDeConversiones);
  } catch (error) {
    console.error('Error: no se pudo agregar la entrada al historial', error);
  }
}

/**
 * Renderiza la lista de conversiones en el DOM.
 * Muestra mensaje vacío si no hay entradas.
 * Oculta/muestra el botón "Limpiar historial" según corresponda.
 * @param {Array<EntradaDeHistorial>} lista - La lista a renderizar.
 * @returns {void}
 */
function renderizarHistorial(lista) {
  try {
    const listaElemento = document.getElementById('history-list');
    const botonLimpiar = document.getElementById('clear-history');

    if (!listaElemento) {
      return;
    }

    listaElemento.innerHTML = '';

    if (!lista || lista.length === 0) {
      const liVacio = document.createElement('li');
      liVacio.className = 'history-empty';
      liVacio.textContent = 'No hay conversiones en el historial';
      listaElemento.appendChild(liVacio);

      if (botonLimpiar) {
        botonLimpiar.style.display = 'none';
      }
      return;
    }

    if (botonLimpiar) {
      botonLimpiar.style.display = '';
    }

    lista.forEach(function(entrada) {
      const li = document.createElement('li');
      li.className = 'history-entry';
      const textoEntrada = entrada.valor + ' ' + simbolos[entrada.desde] + ' → ' + entrada.resultado + ' ' + simbolos[entrada.hacia];
      li.textContent = textoEntrada;
      li.setAttribute('role', 'button');
      li.setAttribute('tabindex', '0');

      li.addEventListener('click', function() {
        reutilizarConversion(entrada);
      });

      li.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          reutilizarConversion(entrada);
        }
      });

      listaElemento.appendChild(li);
    });
  } catch (error) {
    console.error('Error: no se pudo renderizar el historial', error);
  }
}

/**
 * Elimina todas las entradas del historial y limpia localStorage.
 * Actualiza la interfaz mostrando el mensaje de historial vacío.
 * @returns {void}
 */
function limpiarHistorial() {
  try {
    listaDeConversiones = [];

    if (storageDisponible) {
      localStorage.removeItem('conversionHistory');
    }

    renderizarHistorial([]);
  } catch (error) {
    console.error('Error: no se pudo limpiar el historial', error);
  }
}

/**
 * Maneja el clic en una entrada del historial.
 * Carga los valores en el formulario y ejecuta la conversión automáticamente.
 * @param {EntradaDeHistorial} entrada - La entrada seleccionada.
 * @returns {void}
 */
function reutilizarConversion(entrada) {
  try {
    document.getElementById('value').value = entrada.valor;
    document.getElementById('from').value = entrada.desde;
    document.getElementById('to').value = entrada.hacia;

    convertir();
  } catch (error) {
    console.error('Error: no se pudo reutilizar la conversión', error);
  }
}

/**
 * Inicializa el historial: carga datos de localStorage y renderiza.
 * Conecta el evento click del botón limpiar a limpiarHistorial.
 * @returns {void}
 */
function inicializarHistorial() {
  try {
    listaDeConversiones = cargarDesdeStorage();
    renderizarHistorial(listaDeConversiones);

    const botonLimpiar = document.getElementById('clear-history');
    if (botonLimpiar) {
      botonLimpiar.addEventListener('click', limpiarHistorial);
    }
  } catch (error) {
    console.error('Error: no se pudo inicializar el historial', error);
  }
}
