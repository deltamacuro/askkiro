# Convenciones del Proyecto

## Idioma
- Todos los mensajes de error deben estar en espanol.

## Nomenclatura
- Usar camelCase para variables y funciones.

## Documentacion
- Todas las funciones deben tener comentarios JSDoc completos con @param y @returns cuando aplique.

## Manejo de errores
- Siempre manejar errores con try/catch.
- Los mensajes dentro del catch deben estar en espanol.

## Estructura de archivos
- El codigo debe estar separado en archivos independientes: HTML (.html), CSS (.css) y JavaScript (.js).
- No mezclar estilos inline ni scripts inline en el HTML.

## Estilos visuales
- Color principal: #FF9900
- Color secundario: #000000
- Tipografia principal: 'Roboto', sans-serif (importar desde Google Fonts)
- Usar `font-family: 'Roboto', sans-serif` en body y en inputs/botones.

## Ejemplo de funcion correcta

```javascript
/**
 * Convierte un valor de Celsius a Fahrenheit.
 * @param {number} celsius - El valor en grados Celsius.
 * @returns {number} El valor convertido a Fahrenheit.
 */
function celsiusAFahrenheit(celsius) {
  try {
    if (typeof celsius !== 'number' || isNaN(celsius)) {
      throw new Error('El valor debe ser un numero valido');
    }
    return celsius * 9 / 5 + 32;
  } catch (error) {
    throw new Error('Error: no se pudo convertir de Celsius a Fahrenheit');
  }
}
```
