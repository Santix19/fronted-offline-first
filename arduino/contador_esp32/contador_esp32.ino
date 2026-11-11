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
 *
 * ## Dos formas de armar la barrera, y por qué el sketch soporta las dos
 *
 * Con SENSOR_ANALOGICO en true el fototransistor va directo a la placa y el umbral lo decide este
 * programa. Son cuatro piezas y seis conexiones. Es el armado recomendado, y existe porque la
 * versión con comparador tenía el doble de cables y un chip de ocho patas donde es fácil
 * equivocarse de una: armarlo era la parte difícil de todo el proyecto.
 *
 * Con SENSOR_ANALOGICO en false se usa el LM393 y el potenciómetro, que hacen esa misma decisión
 * por hardware. Queda disponible como respaldo: si el armado simple diera problemas en campo, se
 * cambia una línea de config.h y se vuelve al otro sin tocar nada más.
 *
 *
 * ## Por qué el conteo corre en el otro núcleo
 *
 * Esto importa y no se ve. Subir una tanda al servidor puede tardar hasta minuto y medio cuando
 * Render tiene el servicio dormido, y durante esa espera el programa está detenido ahí.
 *
 * En el armado con LM393 eso daba igual: el comparador entrega un flanco digital y una
 * interrupción lo atiende aunque el programa principal esté ocupado. Leyendo el voltaje no hay
 * interrupción que valga, hay que ir a mirar, y si el único hilo está esperando al servidor nadie
 * mira: el contador quedaría ciego justo mientras sube, y los alevinos que pasen en ese minuto y
 * medio no existen para nadie.
 *
 * Por eso el conteo vive en su propia tarea, clavada en el núcleo 0, y la red se queda en loop(),
 * que Arduino corre en el núcleo 1. Mientras uno espera al servidor, el otro sigue mirando el haz.
 *
 * Lo que la placa NO hace a propósito: guardar la cola en memoria permanente. Un corte de
 * corriente pierde lo que todavía no se subió. Para una jornada de conteo con un powerbank es un
 * riesgo aceptable, y dejarlo escrito es mejor que fingir que no existe.
 */
#include "config.h"
#include "red.h"

volatile unsigned long peces = 0;
volatile unsigned long ambiguos = 0;
volatile unsigned long cortadoDesdeUs = 0;
volatile unsigned long ultimoFlancoUs = 0;
/** Si el haz está cortado ahora mismo. Solo lo usa el modo analógico. */
volatile bool cortado = false;

unsigned long seq = 0;
unsigned long ultimaTandaMs = 0;

/*
 * El candado de los contadores.
 *
 * Los dos núcleos tocan `peces` y `ambiguos`: uno los suma y el otro los lee y los pone en cero
 * al cerrar la tanda. Apagar interrupciones no sirve aquí, porque eso solo calla al núcleo
 * propio; hace falta un candado que los dos respeten.
 */
portMUX_TYPE candado = portMUX_INITIALIZER_UNLOCKED;

/** Da por terminado un cruce: suma un pez, y lo marca ambiguo si duró demasiado. */
static inline void terminarCruce(unsigned long ahora) {
  // Un corte largo cuenta como un solo pez y queda marcado, nunca como dos: adivinar ahí
  // arruinaría la comparación con el conteo a mano, que es lo que la tesis mide.
  bool largo = (ahora - cortadoDesdeUs) > CORTE_LARGO_US;
  portENTER_CRITICAL(&candado);
  peces++;
  if (largo) ambiguos++;
  portEXIT_CRITICAL(&candado);
}

#if SENSOR_ANALOGICO

/*
 * La tarea que mira el haz, en el núcleo 0.
 *
 * Mira mil veces por segundo. Es de sobra: un alevín de cuatro centímetros cruzando a medio metro
 * por segundo tapa el haz ochenta milisegundos, así que lo ven ochenta lecturas seguidas. Y
 * analogRead tarda unos cien microsegundos, de modo que la tarea pasa la mayor parte del tiempo
 * dormida y le deja el núcleo a lo que haga falta.
 */
void tareaSensor(void *) {
  for (;;) {
    int lectura = analogRead(PIN_SENSOR);
    unsigned long ahora = micros();

    if (MOSTRAR_LECTURAS) {
      // En calibración no se cuenta: se muestra lo que se está leyendo
      static unsigned long ultimoAvisoMs = 0;
      if (millis() - ultimoAvisoMs >= 100) {
        ultimoAvisoMs = millis();
        Serial.printf("LECTURA;%d;%s\n", lectura, cortado ? "cortado" : "libre");
      }
    }

    if (!cortado && lectura < UMBRAL_CORTADO) {
      // Se cortó el haz. El antirrebote evita contar dos veces un receptor que vibra.
      if (ahora - ultimoFlancoUs >= ANTIRREBOTE_US) {
        ultimoFlancoUs = ahora;
        cortadoDesdeUs = ahora;
        cortado = true;
      }
    } else if (cortado && lectura > UMBRAL_LIBRE) {
      if (ahora - ultimoFlancoUs >= ANTIRREBOTE_US) {
        ultimoFlancoUs = ahora;
        cortado = false;
        if (MOSTRAR_LECTURAS) {
          Serial.printf("CORTE;%lu ms\n", (ahora - cortadoDesdeUs) / 1000UL);
        } else {
          terminarCruce(ahora);
        }
      }
    }

    vTaskDelay(1 / portTICK_PERIOD_MS);
  }
}

static void iniciarSensor() {
  // El rango completo hasta 3,3 V. Sin esto el ADC satura cerca de 1 V y la mitad de arriba de la
  // escala no se distingue, que es justo donde está "haz libre".
  analogSetPinAttenuation(PIN_SENSOR, ADC_11db);
  // Clavada en el núcleo 0: loop() corre en el 1 y es el que se queda esperando al servidor
  xTaskCreatePinnedToCore(tareaSensor, "sensor", 2048, NULL, 1, NULL, 0);
}

#else  // el armado con LM393

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
  terminarCruce(ahora);
}

static void iniciarSensor() {
  pinMode(PIN_BARRERA, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PIN_BARRERA), alCambiarLaBarrera, CHANGE);
}

#endif

void setup() {
  Serial.begin(115200);
  Serial.println("# contador de alevinos la cocha (esp32)");
  if (SENSOR_ANALOGICO) {
    Serial.printf("# sensor directo en el pin %d\n", PIN_SENSOR);
    if (MOSTRAR_LECTURAS) {
      Serial.println("# MODO CALIBRACION: no se esta contando");
      Serial.printf("# umbrales de hoy: cortado por debajo de %d, libre por encima de %d\n",
                    UMBRAL_CORTADO, UMBRAL_LIBRE);
    }
  } else {
    Serial.printf("# comparador LM393 en el pin %d\n", PIN_BARRERA);
  }

  iniciarSensor();
  iniciarRed();
  ultimaTandaMs = millis();
}

void loop() {
  atenderRed();

  if (MOSTRAR_LECTURAS) return;  // en calibración no se cierran tandas
  if (millis() - ultimaTandaMs < (unsigned long) TANDA_SEGUNDOS * 1000UL) return;
  ultimaTandaMs = millis();

  // Se leen y se ponen en cero de un solo golpe, con el candado puesto: si pasa un pez justo
  // aquí, o entra en esta tanda o entra en la siguiente, pero no se pierde ni se cuenta dos veces
  portENTER_CRITICAL(&candado);
  unsigned long contados = peces;
  unsigned long cortes = ambiguos;
  peces = 0;
  ambiguos = 0;
  portEXIT_CRITICAL(&candado);

  if (contados == 0) return;

  seq++;
  Serial.printf("CNT;%lu;%lu;%lu\n", seq, contados, cortes);
  encolarConteo(contados, cortes);
}
