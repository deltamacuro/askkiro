# Documento de Requisitos

## Introducción

El Conversor de Temperaturas actualmente permite convertir valores entre Celsius, Fahrenheit y Kelvin, pero no conserva un registro de las conversiones realizadas. Esta funcionalidad agrega un historial que muestra las últimas 10 conversiones, permite limpiar el historial y reutilizar una conversión anterior con un clic. Los datos persisten entre sesiones usando localStorage.

## Glosario

- **Conversor**: La aplicación web existente de conversión de temperaturas.
- **Historial**: Sección de la interfaz que muestra la lista de conversiones realizadas previamente.
- **Entrada_De_Historial**: Un registro individual dentro del Historial que contiene el valor original, la unidad de origen, la unidad de destino y el resultado de una conversión.
- **Almacenamiento_Local**: El mecanismo localStorage del navegador utilizado para persistir los datos del Historial entre sesiones.
- **Lista_De_Conversiones**: La estructura de datos (arreglo) que contiene las Entradas_De_Historial almacenadas en el Almacenamiento_Local.

## Requisitos

### Requisito 1: Registrar conversión en el historial

**User Story:** Como usuario, quiero que cada conversión que realizo se guarde automáticamente en un historial, para poder consultarla después.

#### Criterios de Aceptación

1. WHEN el usuario ejecuta una conversión exitosa, THE Conversor SHALL agregar una nueva Entrada_De_Historial al inicio de la Lista_De_Conversiones.
2. THE Conversor SHALL almacenar en cada Entrada_De_Historial el valor original, la unidad de origen, la unidad de destino y el resultado formateado.
3. WHEN la Lista_De_Conversiones contiene más de 10 elementos, THE Conversor SHALL eliminar la Entrada_De_Historial más antigua para mantener un máximo de 10 registros.
4. IF la conversión produce un error, THEN THE Conversor SHALL mantener la Lista_De_Conversiones sin cambios.

### Requisito 2: Mostrar el historial en la interfaz

**User Story:** Como usuario, quiero ver mis últimas conversiones en pantalla, para tener un registro visual de lo que he convertido.

#### Criterios de Aceptación

1. THE Conversor SHALL mostrar el Historial debajo de la tarjeta principal de conversión.
2. THE Conversor SHALL mostrar cada Entrada_De_Historial con el formato "{valor} {símbolo_origen} → {resultado} {símbolo_destino}".
3. WHEN la Lista_De_Conversiones está vacía, THE Conversor SHALL mostrar el mensaje "No hay conversiones en el historial".
4. WHEN se agrega una nueva Entrada_De_Historial, THE Conversor SHALL actualizar el Historial en la interfaz de forma inmediata sin recargar la página.

### Requisito 3: Persistir el historial con localStorage

**User Story:** Como usuario, quiero que mi historial se conserve al cerrar y reabrir el navegador, para no perder mis conversiones anteriores.

#### Criterios de Aceptación

1. WHEN se agrega o elimina una Entrada_De_Historial, THE Conversor SHALL guardar la Lista_De_Conversiones en el Almacenamiento_Local usando la clave "conversionHistory".
2. WHEN la aplicación se carga, THE Conversor SHALL leer la Lista_De_Conversiones desde el Almacenamiento_Local y mostrar el Historial correspondiente.
3. IF el Almacenamiento_Local contiene datos corruptos o no válidos para la clave "conversionHistory", THEN THE Conversor SHALL inicializar la Lista_De_Conversiones como un arreglo vacío y mostrar el mensaje "No hay conversiones en el historial".
4. IF el Almacenamiento_Local no está disponible, THEN THE Conversor SHALL mantener el Historial funcional solo durante la sesión activa y mostrar el mensaje "Error: no se pudo acceder al almacenamiento local" en la consola.

### Requisito 4: Limpiar el historial

**User Story:** Como usuario, quiero poder borrar todo mi historial de conversiones, para empezar de cero cuando lo necesite.

#### Criterios de Aceptación

1. THE Conversor SHALL mostrar un botón "Limpiar historial" visible junto al Historial.
2. WHEN el usuario hace clic en el botón "Limpiar historial", THE Conversor SHALL eliminar todas las Entradas_De_Historial de la Lista_De_Conversiones.
3. WHEN el usuario hace clic en el botón "Limpiar historial", THE Conversor SHALL eliminar la clave "conversionHistory" del Almacenamiento_Local.
4. WHEN el usuario hace clic en el botón "Limpiar historial", THE Conversor SHALL actualizar la interfaz mostrando el mensaje "No hay conversiones en el historial".
5. WHILE la Lista_De_Conversiones está vacía, THE Conversor SHALL ocultar el botón "Limpiar historial".

### Requisito 5: Reutilizar una conversión del historial

**User Story:** Como usuario, quiero hacer clic en una conversión anterior para cargar sus valores en el formulario, para repetirla o modificarla fácilmente.

#### Criterios de Aceptación

1. WHEN el usuario hace clic en una Entrada_De_Historial, THE Conversor SHALL cargar el valor original en el campo de entrada "Valor".
2. WHEN el usuario hace clic en una Entrada_De_Historial, THE Conversor SHALL seleccionar la unidad de origen en el selector "De".
3. WHEN el usuario hace clic en una Entrada_De_Historial, THE Conversor SHALL seleccionar la unidad de destino en el selector "A".
4. WHEN el usuario hace clic en una Entrada_De_Historial, THE Conversor SHALL ejecutar la conversión automáticamente y mostrar el resultado.

### Requisito 6: Serialización y deserialización del historial

**User Story:** Como usuario, quiero que mis datos de historial se guarden y recuperen correctamente, para que no se pierdan ni se corrompan entre sesiones.

#### Criterios de Aceptación

1. THE Conversor SHALL serializar la Lista_De_Conversiones a formato JSON antes de guardarla en el Almacenamiento_Local.
2. THE Conversor SHALL deserializar la cadena JSON del Almacenamiento_Local para reconstruir la Lista_De_Conversiones al cargar la aplicación.
3. FOR ALL Lista_De_Conversiones válidas, serializar y luego deserializar SHALL producir una Lista_De_Conversiones equivalente a la original (propiedad de ida y vuelta).
