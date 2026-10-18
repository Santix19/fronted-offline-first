/*
 * Fry counter for La Cocha. Infrared barrier across one channel: the fry cut the beam on their
 * way out of the tank and the board counts the crossings.
 *
 * The board deliberately stays dumb. It does not keep the total of a batch, it does not know the
 * date and it does not store anything: it only reports how many fish passed since its previous
 * frame. The phone owns the running total, because the phone is the one that survives the cable
 * being unplugged and it is the one that already knows how to queue data without signal.
 *
 * Frames it writes (see src/features/sensors/serialFrames.ts, which parses them):
 *
 *   # <text>                      boot banner, ignored by the phone
 *   CNT;<seq>;<fish>;<ambiguous>  fish counted since the previous frame
 *
 * Ultrasonic build: set BAUD to 9600 and REPORT_CUTS to false. That matches what
 * ArduinoUltrasonicFactory expects, and it keeps a sensor that cannot tell two simultaneous fish
 * apart from reporting a number it did not measure.
 */

const uint8_t BEAM_PIN = 2;             // IR receiver on an interrupt pin; LOW while the beam is cut
const unsigned long BAUD = 115200;      // 9600 for the ultrasonic build
const bool REPORT_CUTS = true;          // false for a board that cannot measure ambiguous crossings

const unsigned long DEBOUNCE_US = 1500;      // longer than the electrical noise, shorter than a fry
const unsigned long LONG_CUT_US = 25000;     // a cut this long is more than one fish at once
const unsigned long REPORT_EVERY_MS = 250;   // four frames a second is plenty for a phone screen

volatile unsigned long fish = 0;
volatile unsigned long ambiguous = 0;
volatile unsigned long cutStartedUs = 0;
volatile unsigned long lastEdgeUs = 0;

unsigned long seq = 0;
unsigned long lastReportMs = 0;

/* Both edges share one debounce window: a bouncing receiver fires them in pairs. */
void onBeamChange() {
  unsigned long now = micros();
  if (now - lastEdgeUs < DEBOUNCE_US) return;
  lastEdgeUs = now;

  if (digitalRead(BEAM_PIN) == LOW) {
    cutStartedUs = now;
    return;
  }

  /* Beam restored: one crossing finished. A long one is counted as a single fish and flagged,
     never as two: guessing here would corrupt the comparison against the manual count. */
  fish++;
  if (now - cutStartedUs > LONG_CUT_US) ambiguous++;
}

void setup() {
  pinMode(BEAM_PIN, INPUT_PULLUP);
  Serial.begin(BAUD);
  attachInterrupt(digitalPinToInterrupt(BEAM_PIN), onBeamChange, CHANGE);
  Serial.println("# contador de alevinos la cocha v1");
}

void loop() {
  if (millis() - lastReportMs < REPORT_EVERY_MS) return;
  lastReportMs = millis();

  noInterrupts();
  unsigned long counted = fish;
  unsigned long cuts = ambiguous;
  fish = 0;
  ambiguous = 0;
  interrupts();

  /* Nothing passed, nothing to say. No heartbeat: the phone has its own clock and showing
     "last pulse" only means something if a frame really carried fish. */
  if (counted == 0) return;

  seq++;
  Serial.print("CNT;");
  Serial.print(seq);
  Serial.print(';');
  Serial.print(counted);
  Serial.print(';');
  Serial.println(REPORT_CUTS ? cuts : 0);
}
