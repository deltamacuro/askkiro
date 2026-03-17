const simbolos = { C: '°C', F: '°F', K: 'K' };

/**
 * Convierte un valor de cualquier unidad de temperatura a Celsius.
 * @param {number} valor - El valor numérico a convertir.
 * @param {string} unidad - La unidad de origen ('C', 'F' o 'K').
 * @returns {number} El valor convertido a Celsius.
 */
function aCelsius(valor, unidad) {
  try {
    if (unidad === 'C') return valor;
    if (unidad === 'F') return (valor - 32) * 5 / 9;
    if (unidad === 'K') return valor - 273.15;
    throw new Error('Unidad no válida');
  } catch (error) {
    throw new Error('Error: no se pudo convertir a Celsius');
  }
}

/**
 * Valida que una temperatura no esté por debajo del cero absoluto.
 * @param {number} valor - El valor numérico a validar.
 * @param {string} unidad - La unidad de la temperatura ('C', 'F' o 'K').
 * @returns {boolean} true si el valor es válido, false si está por debajo del cero absoluto.
 */
function esTemperaturaValida(valor, unidad) {
  try {
    const limites = { C: -273.15, F: -459.67, K: 0 };
    return valor >= limites[unidad];
  } catch (error) {
    return false;
  }
}


/**
 * Convierte un valor en Celsius a la unidad de destino.
 * @param {number} celsius - El valor en Celsius.
 * @param {string} unidad - La unidad de destino ('C', 'F' o 'K').
 * @returns {number} El valor convertido a la unidad de destino.
 */
function desdeCelsius(celsius, unidad) {
  try {
    if (unidad === 'C') return celsius;
    if (unidad === 'F') return celsius * 9 / 5 + 32;
    if (unidad === 'K') return celsius + 273.15;
    throw new Error('Unidad no válida');
  } catch (error) {
    throw new Error('Error: no se pudo convertir desde Celsius');
  }
}

/**
 * Lee los valores del formulario, realiza la conversión y muestra el resultado.
 */
function convertir() {
  try {
    const valor = parseFloat(document.getElementById('value').value);
    const desde = document.getElementById('from').value;
    const hacia = document.getElementById('to').value;
    const resultado = document.getElementById('result');

    if (isNaN(valor)) {
      resultado.textContent = 'Error: ingresa un valor numérico válido';
      return;
    }

    if (!esTemperaturaValida(valor, desde)) {
      resultado.textContent = `Error: el valor está por debajo del cero absoluto para ${simbolos[desde]}`;
      return;
    }

    const convertido = desdeCelsius(aCelsius(valor, desde), hacia);
    resultado.textContent = `${valor} ${simbolos[desde]} = ${parseFloat(convertido.toFixed(2))} ${simbolos[hacia]}`;
    agregarAlHistorial({
      valor: valor,
      desde: desde,
      hacia: hacia,
      resultado: String(parseFloat(convertido.toFixed(2)))
    });
  } catch (error) {
    document.getElementById('result').textContent = 'Error: ocurrió un problema al convertir';
  }
}

/**
 * Inicializa los event listeners de la aplicación.
 */
function inicializar() {
  try {
    inicializarHistorial();
    document.getElementById('convert').addEventListener('click', convertir);
    document.getElementById('value').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') convertir();
    });
  } catch (error) {
    console.error('Error: no se pudieron inicializar los eventos', error);
  }
}

inicializar();
