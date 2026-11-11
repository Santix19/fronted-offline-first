# Cómo se conecta el contador

Cuatro piezas y nueve conexiones, todo a 3,3 V. Esto va aquí y no solo en el PDF porque el
sketch depende del montaje: `PIN_SENSOR` tiene que ser el pin donde de verdad entra la señal, y
los umbrales de `config.h` dependen de la resistencia de carga que se haya puesto.

## Las piezas

| Pieza | Para qué |
|---|---|
| LED infrarrojo (el transparente) | La linterna |
| Fototransistor (el oscuro) | El ojo |
| Resistencia 220 Ω | Le pone freno a la corriente del LED |
| Resistencia 10 kΩ | Convierte la luz del sensor en un voltaje |

El LM393 y el potenciómetro **no se usan** en este montaje. Quedan como respaldo: con
`SENSOR_ANALOGICO` en `false` el sketch vuelve al armado con comparador.

## Las conexiones

Todo va en la mitad de abajo de la protoboard (filas `F`–`J`) y en las dos líneas largas de
abajo. La mitad de arriba y el riel de 5 V quedan sin usar.

| # | Pieza o cable | Un extremo | El otro |
|---|---|---|---|
| 1 | Cable | Pin `GND` del ESP32 | Línea `GND` |
| 2 | Cable | Pin `3V3` del ESP32 | Línea `3,3 V` |
| 3 | Resistencia 220 Ω | Línea `3,3 V` | `J-6` |
| 4 | LED · pata larga | `I-6` | — |
| 5 | LED · pata corta | `I-9` | — |
| 6 | Cable | `J-9` | Línea `GND` |
| 7 | Fototransistor · pata larga | `I-20` | — |
| 8 | Fototransistor · pata corta | `I-23` | — |
| 9 | Cable | `J-20` | Línea `3,3 V` |
| 10 | Resistencia 10 kΩ | `J-23` | Línea `GND` |
| 11 | Cable | Pin `D34` del ESP32 | `G-23` |

Son once filas y nueve piezas: el LED y el fototransistor ocupan dos filas cada uno, una por
pata, pero se meten de una vez.

La columna 23 es el punto que importa: ahí se juntan la pata corta del sensor, la resistencia de
10 kΩ y el cable que va al ESP32. Ese es el voltaje que `tareaSensor()` lee mil veces por
segundo.

## Dos decisiones que no se ven en el dibujo

**Por qué el pin 34.** El ESP32 tiene dos conversores analógicos y el WiFi se queda con el
segundo. Un pin del ADC2 (el 4, el 2, del 12 al 15, del 25 al 27) deja de leer en cuanto la
placa se conecta a la red, y el contador quedaría mudo justo cuando empieza a subir datos. El 34
es del ADC1 y además es de solo entrada.

**Por qué todo a 3,3 V.** El LED infrarrojo cae alrededor de 1,2 V, así que con 220 Ω le entran
unos 9 mA: de sobra para los pocos centímetros del tubo. Alimentarlo de 3,3 V en vez de 5 V
ahorra el riel de 5 V entero y el puente entre los dos GND — dos conexiones menos y una
tensión menos que seguir en el dibujo.

## Calibrar

Los umbrales de `config.h` son un punto de partida, no un valor universal: dependen del LED, de
la distancia y de la luz del sitio. Para medirlos, ponga `MOSTRAR_LECTURAS` en `true`, abra el
Monitor Serie a 115200 y anote cuánto marca con el haz libre y cuánto tapado. Los dos umbrales
van repartidos entre esos valores, dejando una franja ancha entre ellos.

El paso a paso completo, con dibujos, está en `conexiones-contador-alevinos.pdf`.
