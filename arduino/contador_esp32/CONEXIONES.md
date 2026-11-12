# Cómo se conecta el contador

Barrera infrarroja con comparador LM393: cuatro piezas, tres resistencias y quince cables, todo
a 3,3 V. Esto va aquí y no solo en el PDF porque el sketch depende del montaje — `PIN_BARRERA`
tiene que ser el pin donde de verdad entra la salida del comparador.

El paso a paso con dibujos está en `conexiones-contador-alevinos.pdf`. Este archivo es la
referencia corta.

## Las piezas

| Pieza | Para qué |
|---|---|
| LED infrarrojo 940 nm (el transparente) | La linterna |
| Fototransistor 940 nm (el negro) | El ojo |
| Resistencia 220 Ω | Le pone freno a la corriente del LED |
| Resistencia 10 kΩ (carga) | Convierte la luz del sensor en un voltaje |
| LM393 | Compara ese voltaje contra el del potenciómetro y responde 0 o 1 |
| Potenciómetro 10 kΩ | Elige la frontera entre "hay luz" y "no hay luz" |
| Resistencia 10 kΩ (de subida) | La salida del LM393 no sabe subir sola; esta la sube |

## Las conexiones

El LM393 va **a caballo del canal del medio**, con la muesca a la izquierda: patas 1 a 4 en la
fila `F` y patas 8 a 5 en la fila `E`. Puesto entero de un lado, cada pata quedaría en corto con
la de enfrente.

| # | Pieza o cable | Un extremo | El otro |
|---|---|---|---|
| 1 | Cable negro | Pin `GND` del ESP32 | Línea `GND` de abajo |
| 2 | Cable naranja | Pin `3V3` del ESP32 | Línea `3,3 V` de abajo |
| 3 | Puente naranja | Línea `3,3 V` de abajo, columna 29 | Línea `3,3 V` de arriba, columna 29 |
| 4 | Puente negro | Línea `GND` de abajo, columna 31 | Línea `GND` de arriba, columna 31 |
| 5 | Resistencia 220 Ω | Línea `3,3 V` de abajo | `J-6` |
| 6 | LED transparente · pata **larga** | `I-6` | queda unida a la resistencia por dentro de la placa |
| 7 | LED transparente · pata **corta** | `I-9` | — |
| 8 | Cable negro | `J-9` | Línea `GND` de abajo |
| 9 | Fototransistor negro · pata **larga** | `I-22` | — |
| 10 | Fototransistor negro · pata **corta** | `I-25` | — |
| 11 | Cable naranja | `J-22` | Línea `3,3 V` de abajo |
| 12 | Resistencia 10 kΩ *(carga)* | `J-25` | Línea `GND` de abajo |
| 13 | LM393 | patas 1 a 4 en `F-16` … `F-19` | patas 8 a 5 en `E-16` … `E-19` |
| 14 | Cable naranja | `A-16` *(pata 8)* | Línea `3,3 V` de arriba |
| 15 | Cable negro | `J-19` *(pata 4)* | Línea `GND` de abajo |
| 16 | Cable negro | `A-18` *(pata 6)* | Línea `GND` de arriba |
| 17 | Cable negro | `B-19` *(pata 5)* | Línea `GND` de arriba |
| 18 | Potenciómetro 10 kΩ | las tres patas en `F-10`, `F-11` y `F-12` | la del medio es el cursor |
| 19 | Cable negro | `J-10` | Línea `GND` de abajo |
| 20 | Cable naranja | `J-12` | Línea `3,3 V` de abajo |
| 21 | Cable azul | `G-11` *(cursor del potenciómetro)* | `G-17` *(pata 2 del LM393)* |
| 22 | Cable verde | `H-25` *(señal del fototransistor)* | `H-18` *(pata 3 del LM393)* |
| 23 | Resistencia 10 kΩ *(de subida)* | `J-16` *(pata 1)* | Línea `3,3 V` de abajo |
| 24 | Cable rosado | Pin `D4` del ESP32 | `H-16` *(pata 1)* |

Son 24 filas y 22 cosas que meter: el LED y el fototransistor ocupan dos filas
cada uno, una por pata.

## Tres decisiones que no se ven en la tabla

**Por qué un comparador y no leer el sensor directo.** El fototransistor no entrega un sí o un
no, sino un voltaje que sube y baja de a poquitos — también con la luz del día o el agua turbia.
El LM393 lo convierte en un pulso limpio, y la frontera se ajusta con un destornillador en vez
de recompilando.

**Por qué sirve el pin 4.** Lo que llega es digital, así que casi cualquier pin vale. En el
armado reducido (`SENSOR_ANALOGICO true`) habría que usar uno del ADC1, del 32 al 39, porque el
WiFi se apropia del segundo conversor y un pin del ADC2 deja de leer en cuanto la placa se
conecta a la red.

**Por qué las patas 5 y 6 van a tierra.** El chip trae dos comparadores y aquí se usa uno. Las
entradas del que sobra, dejadas al aire, flotan y captan ruido que puede alterar al de al lado:
comparten la misma pastilla de silicio. La pata 7 sí se deja al aire — una salida sin conectar
no hace daño.

## Ajustar

Gire el tornillo del potenciómetro hasta que empiece a contar solo sin que pase nada: ese es un
extremo. Después al otro lado, hasta que deje de contar aunque tape el haz con el dedo: ese es el
otro. El punto bueno está en el medio, no en el borde — la luz del día cambia durante la jornada
y ese margen es lo que evita volver a ajustar a media mañana.

## El armado de respaldo

Con `SENSOR_ANALOGICO` en `true` el fototransistor va directo al pin 34 y el umbral lo deciden
`UMBRAL_CORTADO` y `UMBRAL_LIBRE`. Dos piezas menos, pero hay que recompilar para cambiar el
umbral. Está por si el LM393 o el potenciómetro fallan lejos de una tienda de electrónica.
