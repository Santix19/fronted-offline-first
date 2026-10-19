/*
 * Contador de alevinos sobre ESP32. La barrera infrarroja y la forma de contar son las mismas del
 * sketch de Arduino; lo que cambia es que esta placa, además del cable, sabe subir sola.
 *
 * Dos modos, y no hay que elegir: funcionan a la vez.
 *
 *   Por cable. Escribe las mismas tramas que el Arduino, así que la app las lee igual:
 *       # contador de alevinos la cocha (esp32)
 *       CNT;<seq>;<alevinos>;<ambiguos>
 *     Sirve para calibrar y para contar viendo el número subir en la pantalla.
 *
 *   Por red. Cada tanda de TANDA_SEGUNDOS se vuelve un evento "conteo" y se manda al backend con
 *     el mismo POST /api/sync/push que usa el celular. Si no hay red, la tanda espera en la cola
 *     y se reintenta: el id del evento se crea aquí, así que un reenvío no duplica nada.
 *
 * Lo que la placa NO hace a propósito: guardar la cola en memoria permanente. Un corte de
 * corriente pierde lo que todavía no se subió. Para una jornada de conteo con un powerbank es un
 * riesgo aceptable, y dejarlo escrito es mejor que fingir que no existe.
 */
#include "config.h"

volatile unsigned long peces = 0;
volatile unsigned long ambiguos = 0;
volatile unsigned long cortadoDesdeUs = 0;
volatile unsigned long ultimoFlancoUs = 0;

unsigned long seq = 0;
unsigned long ultimaTandaMs = 0;

/** Nivel que tiene el pin mientras el haz está cortado. */
inline int nivelCortado() {
  return BARRERA_INVERTIDA ? HIGH : LOW;
}

/*
 * Los dos flancos comparten una sola ventana de antirrebote: un receptor que vibra los dispara
 * en pareja. En el ESP32 esto corre desde la RAM interna (IRAM_ATTR), que es lo que evita que la
 * interrupción llegue tarde cuando la placa está hablando por WiFi.
 */
void IRAM_ATTR alCambiarLaBarrera() {
  unsigned long ahora = micros();
  if (ahora - ultimoFlancoUs < ANTIRREBOTE_US) return;
  ultimoFlancoUs = ahora;

  if (digitalRead(PIN_BARRERA) == nivelCortado()) {
    cortadoDesdeUs = ahora;
    return;
  }

  // Se restableció el haz: terminó un cruce. Uno largo cuenta como un solo pez y queda marcado
  // como ambiguo, nunca como dos: adivinar ahí arruinaría la comparación con el conteo a mano.
  peces++;
  if (ahora - cortadoDesdeUs > CORTE_LARGO_US) ambiguos++;
}

void setup() {
  pinMode(PIN_BARRERA, INPUT_PULLUP);
  Serial.begin(115200);
  attachInterrupt(digitalPinToInterrupt(PIN_BARRERA), alCambiarLaBarrera, CHANGE);
  Serial.println("# contador de alevinos la cocha (esp32)");

  iniciarRed();
  ultimaTandaMs = millis();
}

void loop() {
  atenderRed();

  if (millis() - ultimaTandaMs < (unsigned long) TANDA_SEGUNDOS * 1000UL) return;
  ultimaTandaMs = millis();

  // Se leen y se ponen en cero de un solo golpe, con la interrupción apagada: si pasa un pez
  // justo aquí, o entra en esta tanda o entra en la siguiente, pero no se pierde ni se cuenta dos veces
  noInterrupts();
  unsigned long contados = peces;
  unsigned long cortes = ambiguos;
  peces = 0;
  ambiguos = 0;
  interrupts();

  if (contados == 0) return;

  seq++;
  Serial.printf("CNT;%lu;%lu;%lu\n", seq, contados, cortes);
  encolarConteo(contados, cortes);
}
