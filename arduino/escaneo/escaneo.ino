/*
 * Lee a la vez todas las entradas analógicas de la tarjeta y dice cuánto marca cada una.
 *
 * Existe por un error mío depurando: le di al usuario la posición del pin contada desde arriba
 * y me equivoqué de número en dos mensajes distintos. El cable acabó en un pin que el programa
 * no estaba leyendo, y durante un buen rato interpreté «cero» como «el sensor no funciona»
 * cuando en realidad era «no estoy mirando donde está el cable».
 *
 * Mirándolos todos, el problema desaparece: se toca un punto del circuito con el riel positivo
 * y el que se mueva es donde está conectado de verdad. No hay que contar pines ni fiarse de la
 * serigrafía.
 *
 * Son los seis del ADC1. Los otros (ADC2) no sirven aquí porque el WiFi se los queda, y además
 * estos seis son de solo entrada: no hay forma de estropear nada aunque el cable toque donde no
 * debe.
 */

const int PINES[] = {36, 39, 34, 35, 32, 33};
const char *NOMBRES[] = {"VP/36", "VN/39", "G34 ", "G35 ", "G32 ", "G33 "};
const int CUANTOS = 6;

/** Promedia unas cuantas lecturas: una sola trae ruido de varios milivoltios. */
static float voltios(int pin) {
  uint32_t suma = 0;
  for (int i = 0; i < 12; i++) suma += analogReadMilliVolts(pin);
  return suma / 12.0f / 1000.0f;
}

void setup() {
  Serial.begin(115200);
  delay(400);
  for (int i = 0; i < CUANTOS; i++) analogSetPinAttenuation(PINES[i], ADC_11db);
  Serial.println("# escaneo de todas las entradas analogicas");
  Serial.println("# toque un punto del circuito con el riel + y mire cual se mueve");
  Serial.println("# un pin al aire ronda 0,15 V y tiembla; uno conectado a 3,3 V da ~3,1 V");
}

void loop() {
  static unsigned long ultimoMs = 0;
  if (millis() - ultimoMs < 350) return;
  ultimoMs = millis();

  // Una sola linea con los seis, para poder seguirlos de un vistazo mientras se toca
  Serial.print("TODOS");
  for (int i = 0; i < CUANTOS; i++) {
    Serial.printf(";%s=%.2f", NOMBRES[i], voltios(PINES[i]));
  }
  Serial.println();
}
