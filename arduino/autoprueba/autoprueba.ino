/*
 * Autoprueba del contador: comprueba la lógica de conteo sin depender del sensor.
 *
 * Existe porque cuando el montaje no cuenta hay dos sospechosos muy distintos —el circuito del
 * comparador y el programa de la tarjeta— y hasta separarlos uno anda revisando cables a ciegas.
 * Esta prueba descarta uno de los dos en diez segundos y sin tocar nada.
 *
 * ## Cómo se prueba sola
 *
 * El pin de la señal se pone un instante como SALIDA y la propia placa lo lleva a tierra y lo
 * suelta, igual que haría el comparador cuando un alevín tapa el haz. La interrupción no
 * distingue quién movió el pin: ve los mismos flancos y cuenta igual.
 *
 * Es seguro con el circuito conectado. La salida del LM393 es de colector abierto: solo sabe
 * tirar a tierra o soltarse, nunca empuja corriente, así que no hay nada contra lo que pelear.
 * Al soltar, lo único que hay enfrente es la resistencia de subida de 10 kΩ, que a 3,3 V deja
 * pasar un tercio de miliamperio.
 *
 * ## Qué debería salir
 *
 * Cinco cortes de 10 ms (un alevín normal) y uno de 60 ms (dos pegados):
 *
 *     contados = 6   ambiguos = 1
 *
 * Si sale eso, el programa y la tarjeta están bien y el problema está en el circuito. Si no
 * sale, el problema es de este lado y no hay por qué seguir revisando cables.
 */

#define PIN_SENAL 4

// Los mismos tiempos del sketch de verdad, para que la prueba mida lo que de verdad corre.
#define ANTIRREBOTE_US 1500
#define CORTE_LARGO_US 25000

volatile unsigned long peces = 0;
volatile unsigned long ambiguos = 0;
volatile unsigned long cortadoDesdeUs = 0;
volatile unsigned long ultimoFlancoUs = 0;
volatile unsigned long duraciones[12];
volatile int cuantas = 0;

portMUX_TYPE candado = portMUX_INITIALIZER_UNLOCKED;

/** La misma interrupción del sketch real: un solo antirrebote para los dos flancos. */
void IRAM_ATTR alCambiar() {
  unsigned long ahora = micros();
  if (ahora - ultimoFlancoUs < ANTIRREBOTE_US) return;
  ultimoFlancoUs = ahora;

  if (digitalRead(PIN_SENAL) == LOW) {   // se cortó el haz
    cortadoDesdeUs = ahora;
    return;
  }

  unsigned long duro = ahora - cortadoDesdeUs;
  portENTER_CRITICAL_ISR(&candado);
  peces++;
  if (duro > CORTE_LARGO_US) ambiguos++;
  if (cuantas < 12) duraciones[cuantas++] = duro;
  portEXIT_CRITICAL_ISR(&candado);
}

/** Un corte simulado: la placa se tira el pin a tierra y lo suelta. */
static void simularCruce(unsigned int ms) {
  pinMode(PIN_SENAL, OUTPUT);
  digitalWrite(PIN_SENAL, LOW);
  delay(ms);
  digitalWrite(PIN_SENAL, HIGH);
  delay(5);
  pinMode(PIN_SENAL, INPUT_PULLUP);   // se devuelve al estado en que lo usa el sketch real
  delay(250);                          // separación holgada entre cruces
}

void setup() {
  Serial.begin(115200);
  delay(400);
  Serial.println("# autoprueba del contador de alevinos");
  Serial.printf("# pin de la señal: %d | antirrebote: %d us | corte largo: %d us\n",
                PIN_SENAL, ANTIRREBOTE_US, CORTE_LARGO_US);

  pinMode(PIN_SENAL, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PIN_SENAL), alCambiar, CHANGE);
  delay(100);

  Serial.println("# simulando 5 alevines de 10 ms y 1 corte largo de 60 ms...");
  for (int i = 0; i < 5; i++) simularCruce(10);
  simularCruce(60);
  delay(300);

  portENTER_CRITICAL(&candado);
  unsigned long c = peces, a = ambiguos;
  int n = cuantas;
  portEXIT_CRITICAL(&candado);

  Serial.printf("RESULTADO;contados=%lu;esperados=6;ambiguos=%lu;esperados=1\n", c, a);
  for (int i = 0; i < n; i++) {
    Serial.printf("DURACION;%d;%.1f ms\n", i + 1, duraciones[i] / 1000.0);
  }

  if (c == 6 && a == 1) {
    Serial.println("VEREDICTO;BIEN;la tarjeta y el programa cuentan correctamente");
    Serial.println("VEREDICTO;BIEN;si no cuenta con el sensor, el fallo esta en el circuito");
  } else {
    Serial.printf("VEREDICTO;MAL;se esperaban 6 contados y 1 ambiguo, salieron %lu y %lu\n", c, a);
  }
  Serial.println("# fin de la autoprueba");
}

void loop() {
  delay(1000);
}
