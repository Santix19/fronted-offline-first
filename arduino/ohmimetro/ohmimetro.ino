/*
 * Mide resistencias con el ESP32, para no tener que fiarse de los colores.
 *
 * Nació de un problema concreto: hay tres resistencias que por sus bandas son de 10 kΩ y no
 * aparece la de 220 Ω que el montaje necesita. Leer bandas en una foto funciona, pero el dorado
 * de la tolerancia se confunde con el marrón según la luz, y una resistencia equivocada en el
 * LED emisor deja el circuito mudo sin dar ninguna pista.
 *
 * ## Cómo funciona
 *
 * Un divisor de voltaje. Se pone una resistencia CONOCIDA entre 3,3 V y un nodo, y la
 * DESCONOCIDA entre ese nodo y tierra. El voltaje del nodo depende de la proporción entre las
 * dos, y de ahí sale el valor:
 *
 *     3,3 V ──[ PATRON 10k ]──┬──[ DESCONOCIDA ]── GND
 *                             │
 *                             └── al pin de medida
 *
 *     Rx = Rpatron × V / (3,3 − V)
 *
 * ## Qué esperar
 *
 * No busca precisión, busca separar dos casos que están a un factor de cuarenta:
 *
 *     ~1,6 V  →  unos 10 kΩ   (igual que el patrón)
 *     ~0,3 V  →  cerca de 1 kΩ
 *     <0,15 V →  unos cientos de ohmios: ESA es la del LED
 *
 * El ADC del ESP32 pierde linealidad por debajo de 100 mV, así que para valores pequeños el
 * número exacto no es de fiar — pero la diferencia entre 220 Ω y 10 kΩ es imposible de confundir.
 *
 * ## Montaje
 *
 *   - La resistencia PATRON (una de las de 10 kΩ) del riel + al hueco J-15
 *   - La DESCONOCIDA de J-18 al riel −
 *   - Un cable de J-15 a J-18   (une las dos en el nodo)
 *   - Un cable de G-15 al pin G34 del ESP32
 *
 * Después basta ir cambiando la desconocida y leer.
 */

#define PIN_MEDIDA 34

/** Lo que vale la resistencia patrón. Si usa otra, cámbielo aquí. */
#define PATRON_OHM 10000.0f

/** La tensión real del riel. El regulador del ESP32 rara vez da 3,300 exactos. */
#define ALIMENTACION_V 3.30f

/** Promedia: una lectura suelta trae varios milivoltios de ruido. */
static float voltios() {
  uint32_t suma = 0;
  for (int i = 0; i < 64; i++) {
    suma += analogReadMilliVolts(PIN_MEDIDA);
    delayMicroseconds(200);
  }
  return suma / 64.0f / 1000.0f;
}

/** Cómo se llama, en lenguaje llano, lo que se acaba de medir. */
static const char *veredicto(float ohm, float v) {
  if (v < 0.02f) return "casi cero: no hay nada conectado, o esta en corto";
  if (v > ALIMENTACION_V - 0.15f) return "circuito abierto: la desconocida no hace contacto";
  if (ohm < 60.0f) return "demasiado pequena para este circuito";
  if (ohm < 700.0f) return "ESTA SIRVE para el LED emisor (100 a 470 ohmios)";
  if (ohm < 3000.0f) return "del orden de 1k: no sirve ni para el LED ni para la carga";
  if (ohm < 30000.0f) return "unos 10k: es de las de carga y de subida";
  return "muy grande: mas de 30k";
}

void setup() {
  Serial.begin(115200);
  delay(400);
  analogSetPinAttenuation(PIN_MEDIDA, ADC_11db);   // rango completo hasta 3,3 V
  Serial.println("# ohmimetro con el ESP32");
  Serial.printf("# patron: %.0f ohmios | alimentacion: %.2f V\n", PATRON_OHM, ALIMENTACION_V);
  Serial.println("# cambie la resistencia desconocida y lea; no hace falta reiniciar");
}

void loop() {
  static unsigned long ultimoMs = 0;
  if (millis() - ultimoMs < 700) return;
  ultimoMs = millis();

  float v = voltios();
  // Rx = Rpatron * V / (Valim - V). Se protege la division por si el nodo se va a la alimentacion.
  float resto = ALIMENTACION_V - v;
  float ohm = (resto > 0.01f) ? PATRON_OHM * v / resto : -1.0f;

  if (ohm < 0) {
    Serial.printf("MEDIDA;%.3f V;---;%s\n", v, veredicto(0, v));
  } else {
    Serial.printf("MEDIDA;%.3f V;%.0f ohmios;%s\n", v, ohm, veredicto(ohm, v));
  }
}
