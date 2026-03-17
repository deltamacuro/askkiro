---
name: fisica-temperaturas
description: Conocimiento sobre escalas de temperatura, rangos fisicos validos y casos extremos como el cero absoluto. Util para validaciones y logica de conversion de temperaturas.
metadata:
  author: proyecto-conversor
  version: "1.0"
---

# Fisica de Temperaturas

## Escalas de temperatura

### Celsius (°C)
- Definida por el punto de congelacion del agua (0 °C) y el punto de ebullicion (100 °C) a presion atmosferica estandar.
- Rango valido: desde -273.15 °C (cero absoluto) en adelante. No existe limite superior teorico.

### Fahrenheit (°F)
- Punto de congelacion del agua: 32 °F. Punto de ebullicion: 212 °F.
- Rango valido: desde -459.67 °F (cero absoluto) en adelante.

### Kelvin (K)
- Escala absoluta. 0 K es el cero absoluto, la temperatura mas baja posible.
- Rango valido: desde 0 K en adelante. No existen valores negativos en Kelvin.
- 273.15 K = 0 °C.

## Cero absoluto
- Es el limite inferior de temperatura: 0 K = -273.15 °C = -459.67 °F.
- A esta temperatura, las particulas tienen la minima energia cinetica posible.
- Ningun valor de temperatura puede estar por debajo del cero absoluto.

## Casos extremos y referencias utiles

| Referencia                        | °C        | °F        | K        |
|-----------------------------------|-----------|-----------|----------|
| Cero absoluto                     | -273.15   | -459.67   | 0        |
| Nitrogeno liquido                 | -196      | -320.8    | 77.15    |
| Congelacion del agua              | 0         | 32        | 273.15   |
| Temperatura corporal humana       | 37        | 98.6      | 310.15   |
| Ebullicion del agua               | 100       | 212       | 373.15   |
| Superficie del Sol                | ~5,500    | ~9,932    | ~5,773   |

## Validaciones recomendadas
- Rechazar cualquier valor por debajo del cero absoluto en la escala correspondiente.
- Rechazar valores negativos en Kelvin.
- Mostrar advertencias para temperaturas extremas que puedan indicar un error de entrada del usuario (por ejemplo, valores superiores a 10,000 °C o inferiores a -273 °C).
