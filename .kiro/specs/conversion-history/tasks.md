# Plan de Implementación: Historial de Conversiones

## Visión General

Implementación incremental del sistema de historial de conversiones para el Conversor de Temperaturas. Se crea un módulo `history.js` con funciones de almacenamiento, renderizado y reutilización, se extiende `index.html` con la sección de historial, se agregan estilos en `styles.css`, y se integra con `app.js`. Se usa JavaScript vanilla con localStorage y Jest + fast-check para testing.

## Tareas

- [x] 1. Crear el módulo history.js con modelo de datos y funciones de almacenamiento
  - [x] 1.1 Crear el archivo `history.js` con la estructura base, el typedef `EntradaDeHistorial`, y las funciones `esEntradaValida()`, `serializar()` y `deserializar()`
    - Implementar la validación de entradas: `valor` debe ser número finito, `desde` y `hacia` deben ser 'C', 'F' o 'K', `resultado` debe ser string no vacío
    - Implementar `serializar()` con `JSON.stringify` y `deserializar()` con `JSON.parse`, filtrando entradas inválidas
    - Usar try/catch en todas las funciones según convenciones
    - Mensajes de error en español
    - _Requisitos: 6.1, 6.2, 6.3, 1.2_

  - [ ]* 1.2 Escribir test de propiedad para serialización ida y vuelta
    - **Propiedad 10: Ida y vuelta de serialización**
    - `deserializar(serializar(lista))` debe producir una lista equivalente a la original para toda lista válida
    - **Valida: Requisitos 6.1, 6.2, 6.3**

  - [x] 1.3 Implementar `cargarDesdeStorage()` y `guardarEnStorage()` con manejo de localStorage no disponible
    - `cargarDesdeStorage()` lee de localStorage clave `"conversionHistory"`, deserializa y valida; retorna arreglo vacío si datos corruptos o inexistentes
    - `guardarEnStorage()` serializa y guarda en localStorage; captura errores si localStorage no disponible
    - Variable booleana `storageDisponible` para detectar disponibilidad de localStorage al inicio
    - Mensajes de consola en español cuando localStorage no está disponible
    - _Requisitos: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 1.4 Escribir test de propiedad para datos corruptos en localStorage
    - **Propiedad 6: Datos corruptos en localStorage producen lista vacía**
    - Para toda cadena que no sea JSON válido representando un arreglo de EntradaDeHistorial, la lista debe inicializarse vacía
    - **Valida: Requisito 3.3**

- [x] 2. Implementar lógica de agregar al historial y límite de 10 entradas
  - [x] 2.1 Implementar `agregarAlHistorial(entrada)` que inserta al inicio de la lista, recorta a máximo 10 entradas, guarda en storage y renderiza
    - Validar la entrada antes de agregarla; si es inválida, no modificar la lista
    - Insertar con `unshift()`, recortar con `splice(10)` si excede 10
    - Llamar a `guardarEnStorage()` y `renderizarHistorial()` después de agregar
    - Usar try/catch según convenciones
    - _Requisitos: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 2.2 Escribir test de propiedad para entrada correcta al inicio
    - **Propiedad 1: Agregar conversión crea entrada correcta al inicio**
    - La entrada en índice 0 debe contener el valor original, unidad de origen, unidad de destino y resultado
    - **Valida: Requisitos 1.1, 1.2**

  - [ ]* 2.3 Escribir test de propiedad para límite de 10 entradas
    - **Propiedad 2: La lista nunca excede 10 entradas**
    - Para toda secuencia de conversiones de longitud arbitraria, la lista debe tener longitud <= 10
    - **Valida: Requisito 1.3**

  - [ ]* 2.4 Escribir test de propiedad para conversiones fallidas
    - **Propiedad 3: Conversiones fallidas no modifican la lista**
    - Para todo valor inválido, la lista debe permanecer idéntica a su estado previo
    - **Valida: Requisito 1.4**

- [x] 3. Checkpoint - Verificar funciones core del historial
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

- [x] 4. Implementar renderizado del historial en el DOM
  - [x] 4.1 Implementar `renderizarHistorial(lista)` que genera los elementos `<li>` en `#history-list`
    - Formato de cada entrada: `"{valor} {símbolo_origen} → {resultado} {símbolo_destino}"` usando el mapa `simbolos` de app.js
    - Mostrar `"No hay conversiones en el historial"` cuando la lista está vacía
    - Mostrar/ocultar botón `#clear-history` según si la lista tiene entradas
    - Cada `<li>` debe ser clickeable y llamar a `reutilizarConversion(entrada)`
    - Agregar atributos de accesibilidad: `role="button"`, `tabindex="0"`, manejo de Enter/Space
    - _Requisitos: 2.1, 2.2, 2.3, 2.4, 4.5_

  - [ ]* 4.2 Escribir test de propiedad para formato de visualización
    - **Propiedad 4: Formato de visualización de entradas**
    - El texto renderizado debe coincidir con `"{valor} {símbolo_origen} → {resultado} {símbolo_destino}"`
    - **Valida: Requisito 2.2**

  - [ ]* 4.3 Escribir test de propiedad para visibilidad del botón limpiar
    - **Propiedad 8: Visibilidad del botón limpiar refleja estado de la lista**
    - El botón debe estar visible si y solo si la lista tiene al menos una entrada
    - **Valida: Requisito 4.5**

- [x] 5. Implementar limpiar historial y reutilizar conversión
  - [x] 5.1 Implementar `limpiarHistorial()` que vacía la lista, elimina la clave de localStorage y actualiza la interfaz
    - Asignar arreglo vacío a la lista en memoria
    - Llamar a `localStorage.removeItem("conversionHistory")`
    - Llamar a `renderizarHistorial([])` para mostrar mensaje vacío
    - Conectar al evento click del botón `#clear-history`
    - Usar try/catch según convenciones
    - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 5.2 Escribir test de propiedad para limpiar historial
    - **Propiedad 7: Limpiar historial elimina todo**
    - Tras limpiar, la lista debe estar vacía, la clave eliminada de localStorage, y el mensaje vacío visible
    - **Valida: Requisitos 4.2, 4.3, 4.4**

  - [x] 5.3 Implementar `reutilizarConversion(entrada)` que carga valores en el formulario y ejecuta la conversión
    - Asignar `entrada.valor` al campo `#value`
    - Asignar `entrada.desde` al selector `#from`
    - Asignar `entrada.hacia` al selector `#to`
    - Llamar a `convertir()` de app.js para ejecutar la conversión automáticamente
    - Usar try/catch según convenciones
    - _Requisitos: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 5.4 Escribir test de propiedad para reutilizar conversión
    - **Propiedad 9: Reutilizar entrada carga todos los campos y ejecuta conversión**
    - Al hacer clic, el campo Valor, selector De, selector A deben tener los valores de la entrada, y el resultado debe mostrarse
    - **Valida: Requisitos 5.1, 5.2, 5.3, 5.4**

- [x] 6. Implementar inicialización e integrar con app.js
  - [x] 6.1 Implementar `inicializarHistorial()` que carga datos de localStorage y renderiza el historial al inicio
    - Llamar a `cargarDesdeStorage()` para obtener la lista
    - Llamar a `renderizarHistorial()` con la lista cargada
    - Conectar evento click del botón `#clear-history` a `limpiarHistorial()`
    - Usar try/catch según convenciones
    - _Requisitos: 3.2, 3.3, 3.4_

  - [x] 6.2 Modificar `app.js` para integrar el historial
    - En `convertir()`: después de mostrar el resultado exitoso, llamar a `agregarAlHistorial()` con `{ valor, desde, hacia, resultado }`
    - En `inicializar()`: llamar a `inicializarHistorial()` al inicio
    - No agregar al historial si la conversión produce error
    - _Requisitos: 1.1, 1.4_

  - [ ]* 6.3 Escribir test de propiedad para sincronización de localStorage
    - **Propiedad 5: localStorage se sincroniza tras cada mutación**
    - Tras agregar o limpiar, el contenido de localStorage deserializado debe ser equivalente a la lista en memoria
    - **Valida: Requisito 3.1**

- [x] 7. Agregar sección de historial en index.html y estilos en styles.css
  - [x] 7.1 Modificar `index.html` para agregar la sección del historial y el script `history.js`
    - Agregar `<section class="history-card">` con encabezado, botón limpiar y lista `<ul id="history-list">`
    - Incluir `<script src="history.js"></script>` antes de `<script src="app.js"></script>`
    - Agregar atributos de accesibilidad: `aria-label`, `role="list"`, `aria-live="polite"`
    - _Requisitos: 2.1, 2.3, 4.1_

  - [x] 7.2 Agregar estilos CSS para la sección del historial en `styles.css`
    - Estilos para `.history-card` con apariencia consistente con `.card`
    - Estilos para entradas clickeables con hover y cursor pointer
    - Estilos para `.btn-clear` con color principal #FF9900
    - Estilos para `.history-empty` con texto centrado y color gris
    - Tipografía 'Roboto' según convenciones
    - Cambiar `body` de `align-items: center` a layout vertical para acomodar ambas tarjetas
    - _Requisitos: 2.1, 2.2, 4.1_

- [x] 8. Checkpoint final - Verificar integración completa
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los checkpoints aseguran validación incremental
- Los tests de propiedad validan propiedades universales de correctitud
- Los tests unitarios validan ejemplos específicos y casos borde
