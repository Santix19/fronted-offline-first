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
 * que cambia es cuántas piezas hay que conectar.
 *
 *   true  (recomendado)  El fototransistor va directo a la placa y el umbral lo decide el
 *                        programa. Cuatro piezas, seis conexiones, sin chip y sin potenciómetro.
 *                        Es el armado de la guía de conexiones.
 *
 *   false                Con el comparador LM393 y el potenciómetro, que deciden el umbral por
 *                        hardware. Seis piezas y el doble de cables. Queda disponible por si el
 *                        armado simple diera problemas en campo.
 */
#define SENSOR_ANALOGICO true

// ---- si SENSOR_ANALOGICO es true ----
/*
 * Pin donde entra la señal del fototransistor. Tiene que ser uno del ADC1: del 32 al 39.
 *
 * No es un capricho. El ESP32 tiene dos conversores analógicos y el WiFi se apropia del segundo,
 * así que un pin del ADC2 (el 4, el 2, el 12 al 15, el 25 al 27) deja de leer en cuanto la placa
 * se conecta a la red. El 34 además es de solo entrada, que es justo lo que se necesita aquí.
 */
#define PIN_SENSOR 34

// ---- si SENSOR_ANALOGICO es false (el armado con LM393) ----
// Pin donde entra la salida del comparador. Casi cualquiera sirve de interrupción.
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
