/*
 * Sonda de diagnóstico para el contador de alevinos.
 *
 * No cuenta nada: sirve para averiguar por qué el montaje no responde, usando la propia tarjeta
 * como instrumento de medida en vez de pedir un multímetro.
 *
 * Hace dos cosas.
 *
 * ## 1. Interroga el pin de la señal sin tocar el montaje
 *
 * Lee PIN_SEÑAL tres veces seguidas, con la resistencia interna de la placa puesta arriba, luego
 * abajo, y luego sin nada. Comparando las tres respuestas se sabe quién manda en ese cable:
 *
 *   arriba=1  abajo=1   algo lo sostiene en alto con fuerza: la resistencia de subida está
 *                       puesta y el comparador NO está tirando hacia abajo.
 *   arriba=1  abajo=0   el cable está suelto: nadie manda, gana la resistencia interna. O falta
 *                       la resistencia de subida, o la salida del chip no llega hasta aquí.
 *   arriba=0  abajo=0   el comparador está tirando a tierra con fuerza, o hay un corto a GND.
 *
 * Esto solo necesita el cable que ya está puesto.
 *
 * ## 2. Mide voltajes en tres puntos del circuito
 *
 * Para los tres pines de abajo, que son del ADC1. Hay que llevarles un cable desde el punto que
 * se quiera medir; cada uno dice en qué hueco de la protoboard engancharlo. Medir no altera
 * nada: una entrada analógica del ESP32 casi no consume.
 *
 * Si no hay cable conectado, el valor que sale es basura flotante y hay que ignorarlo; por eso
 * cada línea avisa cuando la lectura parece la de un pin al aire.
 */

// El pin donde entra la salida del comparador. El mismo PIN_BARRERA del sketch de verdad.
#define PIN_SENAL 4

/*
 * Los tres puntos a medir, y de dónde traerles el cable.
 *
 * Tienen que ser pines del ADC1 (del 32 al 39): son los únicos que siguen midiendo con el WiFi
 * encendido, y además estos cuatro son de solo entrada, así que no hay forma de estropear nada
 * aunque el cable toque donde no debe.
 */
struct Punto {
  int pin;
  const char *nombre;
  const char *desde;
  float esperado;      // lo que debería marcar si todo está bien
};

Punto PUNTOS[] = {
  {34, "nodo del LED (entre la 220 y el LED)", "H-5", -1.0f},
  {35, "riel + de ABAJO",                      "columna 7 del riel + de abajo", 3.30f},
  {32, "sin usar",                             "la sonda que no hacia contacto", -1.0f},
};
const int CUANTOS = sizeof(PUNTOS) / sizeof(PUNTOS[0]);

/** Promedia unas cuantas lecturas: una sola viene con ruido de varios milivoltios. */
static float voltios(int pin) {
  uint32_t suma = 0;
  for (int i = 0; i < 16; i++) suma += analogReadMilliVolts(pin);
  return suma / 16.0f / 1000.0f;
}

/**
 * Quién manda en un pin, deducido de cómo responde a las resistencias internas.
 *
 * Es la prueba que un voltímetro no da: un pin al aire y un nodo sin corriente marcan voltajes
 * parecidos, pero reaccionan distinto cuando se tira de ellos.
 *
 *   arriba=1 abajo=1   algo lo sostiene arriba con fuerza
 *   arriba=1 abajo=0   NADIE manda: el cable no hace contacto
 *   arriba=0 abajo=0   algo lo sostiene abajo: hay una resistencia a tierra, o un corto
 */
static void interrogar(int pin, const char *nombre) {
  pinMode(pin, INPUT_PULLUP);  delay(30);  int arriba = digitalRead(pin);
  pinMode(pin, INPUT_PULLDOWN); delay(30); int abajo = digitalRead(pin);
  pinMode(pin, INPUT);          delay(30); int suelto = digitalRead(pin);

  const char *veredicto;
  if (arriba == 1 && abajo == 1)       veredicto = "SOSTENIDO ARRIBA";
  else if (arriba == 1 && abajo == 0)  veredicto = "AL AIRE: el cable no hace contacto";
  else if (arriba == 0 && abajo == 0)  veredicto = "SOSTENIDO ABAJO: hay camino a tierra";
  else                                  veredicto = "raro, revisar";

  Serial.printf("QUIEN;%s;arriba=%d;abajo=%d;suelto=%d;%s\n",
                nombre, arriba, abajo, suelto, veredicto);
  pinMode(pin, INPUT);
}

void setup() {
  Serial.begin(115200);
  delay(300);
  Serial.println("# sonda de diagnostico del contador de alevinos");
  Serial.println("# esta placa NO esta contando: solo mide");
  for (int i = 0; i < CUANTOS; i++) {
    analogSetPinAttenuation(PUNTOS[i].pin, ADC_11db);   // rango completo hasta 3,3 V
    Serial.printf("# G%d <- %s   (%s)\n", PUNTOS[i].pin, PUNTOS[i].desde, PUNTOS[i].nombre);
  }
  interrogar(PIN_SENAL, "pin de la senal (G4)");
  // G32 es un GPIO normal y tiene resistencias internas; G34 y G35 son de solo entrada y no.
  interrogar(32, "toma de medida (G32)");
  analogSetPinAttenuation(32, ADC_11db);
}

void loop() {
  static unsigned long ultimoMs = 0;
  if (millis() - ultimoMs < 400) return;
  ultimoMs = millis();

  // El nivel del pin de la señal, por si cambia mientras se gira el tornillo
  Serial.printf("NIVEL;%d\n", digitalRead(PIN_SENAL));

  for (int i = 0; i < CUANTOS; i++) {
    float v = voltios(PUNTOS[i].pin);
    // Un pin de entrada sin nada conectado se queda flotando cerca de cero y tiembla; avisarlo
    // evita leer como medida lo que en realidad es un cable que nadie puso.
    const char *nota = (v < 0.25f) ? "SIN CABLE o cero: un pin al aire ronda 0,15 V" : "";
    Serial.printf("V;G%d;%.2f;%s;%s\n", PUNTOS[i].pin, v, PUNTOS[i].nombre, nota);
  }
  interrogar(32, "toma de medida (G32)");
  analogSetPinAttenuation(32, ADC_11db);
  Serial.println("---");
}
