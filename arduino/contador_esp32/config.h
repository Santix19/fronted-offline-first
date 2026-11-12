#pragma once

/*
 * Lo único de este sketch que hay que editar. Todo lo demás funciona igual en cualquier finca.
 *
 * Si dejas WIFI_SSID vacío, la placa trabaja solo por cable: escupe las tramas por el puerto USB
 * y la app las lee desde el computador. Con la red configurada, además sube los conteos al
 * servidor ella sola, y entonces el celular ni siquiera tiene que estar presente.
 */

// ---------------------------------------------------------------- la red
// El hotspot del celular sirve. Déjalo vacío para trabajar solo por cable.
#define WIFI_SSID ""
#define WIFI_PASSWORD ""

// ---------------------------------------------------------------- el servidor
// La misma dirección que la app tiene en Ajustes, sin barra al final.
#define BACKEND_URL "https://lacocha-backend.onrender.com"
// La misma API_KEY del panel de Render.
#define BACKEND_API_KEY "cambia-esta-clave"

// ---------------------------------------------------------------- qué está contando
// El lote al que pertenece este conteo. Se copia de la dirección de la app cuando se abre el
// lote: .../#/lotes/ESTE-ES-EL-CODIGO
#define LOTE_ID "00000000-0000-0000-0000-000000000000"
// Con qué nombre aparece esta placa en el servidor. Letras, números, punto, guion y guion bajo.
#define DISPOSITIVO_ID "esp32-contador-1"

// ---------------------------------------------------------------- cómo está armado el sensor
/*
 * Hay dos formas de armar la barrera, y esta línea decide cuál se usa. Las dos cuentan igual: lo
 * que cambia es quién decide a partir de qué sombra hay un pez.
 *
 *   false (el armado de la guía)  Con el comparador LM393 y el potenciómetro. El umbral lo
 *                        decide el hardware y se ajusta girando un tornillo, sin recompilar.
 *                        Es el montaje de CONEXIONES.md y del PDF de conexiones, y el que usa
 *                        todas las piezas que se compraron.
 *
 *   true                 El fototransistor va directo a la placa y el umbral lo decide este
 *                        programa, con los dos números de más abajo. Dos piezas menos, pero hay
 *                        que recompilar para cambiar el umbral. Queda disponible por si el
 *                        LM393 o el potenciómetro fallan lejos de una tienda de electrónica.
 */
#define SENSOR_ANALOGICO false

// ---- si SENSOR_ANALOGICO es true (el armado reducido, de respaldo) ----
/*
 * Pin donde entra la señal del fototransistor. Tiene que ser uno del ADC1: del 32 al 39.
 *
 * No es un capricho. El ESP32 tiene dos conversores analógicos y el WiFi se apropia del segundo,
 * así que un pin del ADC2 (el 4, el 2, el 12 al 15, el 25 al 27) deja de leer en cuanto la placa
 * se conecta a la red. El 34 además es de solo entrada, que es justo lo que se necesita aquí.
 */
#define PIN_SENSOR 34

/*
 * A partir de qué lectura se considera que el haz está cortado, y a partir de cuál que volvió.
 *
 * La lectura va de 0 (oscuro) a 4095 (luz plena). Con el haz libre el fototransistor conduce y el
 * número sube; cuando un alevín lo tapa, cae.
 *
 * Son dos números y no uno a propósito. Con un solo umbral, una lectura que quede justo encima
 * del borde tiembla entre cortado y libre y cuenta varios peces donde pasó uno. Dejando una
 * franja entre los dos, para decir "volvió la luz" hay que subir bastante más de lo que hizo
 * falta para decir "se cortó". Es lo mismo que hace el potenciómetro del otro armado, pero sin
 * tener que girar nada.
 *
 * Para saber qué números poner en TU montaje, pon MOSTRAR_LECTURAS en true (abajo).
 */
#define UMBRAL_CORTADO 1200
#define UMBRAL_LIBRE 2000

/*
 * Modo de calibración. En true, la placa deja de contar y se dedica a imprimir lo que está
 * leyendo, diez veces por segundo, junto con la duración de cada corte:
 *
 *     LECTURA;3412;libre
 *     LECTURA;180;cortado
 *     CORTE;84 ms
 *
 * Con eso se eligen los dos umbrales mirando datos en vez de a ojo: se anota cuánto marca con el
 * haz libre y cuánto con el dedo puesto, y los umbrales van repartidos entre esos dos valores.
 * La duración de los cortes sirve además para ajustar CORTE_LARGO_US más abajo.
 *
 * Acuérdate de volverlo a false para contar de verdad.
 */
#define MOSTRAR_LECTURAS false

// ---- si SENSOR_ANALOGICO es false (el armado de la guía, con LM393) ----
/*
 * Pin donde entra la salida del comparador.
 *
 * Aquí casi cualquier pin sirve, y eso es mérito del LM393: lo que llega es una señal digital,
 * un 0 o un 1, no un voltaje que haya que medir. Con el fototransistor conectado directo habría
 * que usar un pin del ADC1 (del 32 al 39), porque el WiFi se apropia del segundo conversor.
 */
#define PIN_BARRERA 4
// Si tu módulo entrega HIGH al cortar el haz en vez de LOW, pon esto en true.
#define BARRERA_INVERTIDA false

// ---------------------------------------------------------------- los tiempos
// Más largo que el ruido eléctrico y más corto que un alevín pasando.
#define ANTIRREBOTE_US 1500
// Un corte más largo que esto es más de un pez a la vez.
#define CORTE_LARGO_US 25000
// Cada cuánto se cierra una tanda y se manda al servidor.
#define TANDA_SEGUNDOS 30
