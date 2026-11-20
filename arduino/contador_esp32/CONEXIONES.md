# Cómo se conecta el contador

Barrera infrarroja **sin comparador**: el ESP32 lee el voltaje crudo del fototransistor por una
entrada analógica y decide por programa. Cuatro piezas, dos resistencias y seis cables.

Esto va aquí y no solo en el PDF porque el sketch depende del montaje: `PIN_SENSOR` tiene que
ser el pin donde de verdad entra la señal, y `SENSOR_ANALOGICO` tiene que estar en `true`.

El montaje se hace **por etapas**, y cada etapa termina en una medida. No se pasa a la
siguiente sin ese número: si la etapa 1 no da 3,1 V, montar el sensor encima es trabajar a
ciegas. Esa fue la lección de los dos intentos anteriores, en los que se armaba todo y solo al
final se probaba — y entonces el fallo podía estar en cualquiera de las conexiones.

El paso a paso con dibujos está en `conexiones alvinos por etapas.pdf`, en el Escritorio.

> Generado desde `armar_escalera.py`. Si cambia el montaje, se regenera: el PDF y este archivo
> salen de la misma lista y no pueden decir cosas distintas.

## Las piezas

| Pieza | Para qué |
|---|---|
| Fototransistor 940 nm (el negro) | El ojo. Su polaridad no se puede saber por fuera: se prueba en las dos posiciones |
| Resistencia 10 kΩ | Convierte en voltaje la corriente que el sensor deja pasar |
| LED infrarrojo 940 nm (el transparente) | La linterna. Encendido no se ve: se comprueba con la cámara del celular |
| Resistencia 220 Ω | Le pone freno a la corriente del LED |

Ya **no** se usan el LM393 ni el potenciómetro. Con el comparador en medio solo se veía un 0 o
un 1, y cuando ese bit no cambia no hay forma de saber cuál conexión falla. Sin él, cada fallo
es un número que se puede mirar.

## El corte de los rieles

Esta protoboard parte las cuatro líneas largas en las columnas 30 y 31. Todo el montaje va
entre la columna 1 y la 22, así que queda del lado alimentado y no hacen falta puentes.

## Etapa 1 · La corriente y el camino de medida

Tres cables. El tercero no es del circuito: se pone, se mide y se quita.

| # | Pieza o cable | Un extremo | El otro | Para qué |
|---|---|---|---|---|
| 1 | Cable naranja | Pin `3V3` del ESP32 | Riel `+` de **abajo**, columna 2 | La corriente de todo el circuito. |
| 2 | Cable negro | Pin `GND` del ESP32 | Riel `−` de **abajo**, columna 4 | La tierra: el «cero» contra el que se mide todo. |
| 3 | Cable de prueba (se quita después) | Riel `+` de abajo, columna 7 | Pin `G34` del ESP32 | No es parte del circuito. Sirve para que la placa me diga si los rieles tienen corriente de verdad, antes de montar nada encima. |

**Comprobación.** Cargar `escaneo` y leer `G34`. Tiene que dar **≈ 3,1 V**, y **0,00 V** al pasar la punta del cable de prueba al riel `−`. Los dos números, no uno.

## Etapa 2 · El ojo, probado solo

Quitar el cable de prueba. El fototransistor solo, sin linterna infrarroja todavía.

| # | Pieza o cable | Un extremo | El otro | Para qué |
|---|---|---|---|---|
| 4 | Fototransistor · **una** de sus patas | `I-9` | — | Cualquiera de las dos. Su polaridad no se puede saber por fuera, y probar al revés no lo daña. |
| 5 | Fototransistor · **la otra** pata | `I-12` | — | Por esta columna va a salir la señal del proyecto. |
| 6 | Cable naranja | `J-9` | Riel `+` de abajo | Le da corriente al sensor. La columna 9 ya trae unidos `I-9` y `J-9` por dentro: no hace falta más. |
| 7 | Resistencia **10 kΩ** | `J-12` | Riel `−` de abajo | Convierte en voltaje la corriente que el sensor deja pasar. Mucha luz, voltaje alto; tapado, voltaje bajo. |
| 8 | Cable de señal | `H-12` | Pin `G34` del ESP32 | El único cable de datos de todo el proyecto. |

**Comprobación.** Leer `G34` con la luz del cuarto. Vale cualquier número entre 0,2 y 3,1 siempre que **se mueva** al taparlo con el dedo.

**0,00 exacto y quieto no es un sensor muerto**: con la 10 kΩ a tierra puesta, eso es lo que da un fototransistor que no conduce. Primero apuntarle el control del televisor (la linterna del celular casi no emite infrarrojo); si no salta, invertirle las patas. No se daña en ninguna de las dos posiciones. Un cable de verdad suelto da otra cosa: unos 0,15 V temblando.

## Etapa 3 · La linterna infrarroja

El LED enfrentado al fototransistor, a uno o dos centímetros.

| # | Pieza o cable | Un extremo | El otro | Para qué |
|---|---|---|---|---|
| 9 | Resistencia **220 Ω** | Riel `+` de abajo | `J-19` | Le pone freno a la corriente del LED. Sin ella se quema. |
| 10 | LED transparente · cable de la pata **larga** | `I-19` | — | Queda unido a la resistencia por dentro de la placa. |
| 11 | LED transparente · cable de la pata **corta** | `I-22` | — | Si la cámara no lo ve encendido, intercambia sus dos cables. |
| 12 | Cable negro | `J-22` | Riel `−` de abajo | Cierra el camino de la corriente. |

**Comprobación.** Comprobar con la cámara del celular que el LED alumbra (se ve violeta pálido; si no, intercambiarle los dos cables). Después leer `G34`: tiene que **subir** con el LED y **bajar** al pasar el dedo entre los dos.

## Etapa 4 · Los umbrales

No tiene conexiones nuevas. Con los dos números de la etapa 3 (haz libre y haz tapado) se
calculan `UMBRAL_CORTADO` y `UMBRAL_LIBRE` en `config.h`. El programa trabaja en cuentas de 0 a
4095, no en voltios:

    cuentas ≈ voltios × 1241

Son dos umbrales y no uno a propósito: con uno solo, una lectura que quede justo en el borde
tiembla y cuenta varios peces donde pasó uno.

## Red de seguridad

Si el bloque óptico no responde, el sistema completo —conteo, tandas, cola de envío, reintento
y pantalla— se puede demostrar sin óptica, y sin falsear nada:

- La 10 kΩ del riel `+` de abajo a `J-12` (en vez de al riel `−`)
- El cable de señal de `H-12` a `G34`, que ya está puesto
- Un cable suelto con una punta en el riel `−`

Cada toque de la punta suelta en la columna 12 suma un pez por el mismo camino que recorrería
la señal del sensor: se acciona a mano, no se inventa el dato.

Y si ni eso, `MODO_DEMOSTRACION` en `config.h` inventa cruces con duraciones realistas, los
hace entrar por el camino de verdad y los rotula como simulados en el arranque, en cada cruce
y en cada tanda.
