/*
 * Lo que hace esta placa y el Arduino no: subir los conteos ella sola.
 *
 * El id de cada evento se crea aquí, igual que lo hace el celular, y por eso reintentar es
 * inofensivo: el backend reconoce el repetido y responde "duplicados" en vez de guardarlo dos
 * veces. Es la misma propiedad que sostiene toda la sincronización del proyecto.
 */
#include <HTTPClient.h>
#include <WiFi.h>
#include <time.h>

/** Tandas que caben esperando red. Más allá se descarta la más vieja, avisando por el cable. */
#define MAX_PENDIENTES 40
/** Colombia está en UTC-5 todo el año, pero se manda en UTC y el servidor convierte. */
#define SERVIDOR_NTP "pool.ntp.org"

struct Tanda {
  char id[37];
  unsigned long alMillis;  // cuándo se cerró, para calcular la fecha al momento de enviarla
  unsigned long total;
  unsigned long cortes;
};

static Tanda pendientes[MAX_PENDIENTES];
static int cuantasPendientes = 0;
static bool hayRed = false;
static bool hayHora = false;

static bool configurada() {
  return strlen(WIFI_SSID) > 0;
}

void iniciarRed() {
  if (!configurada()) {
    Serial.println("# sin red configurada: la placa trabaja solo por cable");
    return;
  }
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.printf("# buscando la red %s\n", WIFI_SSID);
}

/** UUID v4 con el generador de azar del propio chip. */
static void nuevoId(char destino[37]) {
  uint8_t b[16];
  for (int i = 0; i < 16; i++) b[i] = esp_random() & 0xFF;
  b[6] = (b[6] & 0x0F) | 0x40;  // versión 4
  b[8] = (b[8] & 0x3F) | 0x80;  // variante RFC 4122
  snprintf(destino, 37,
           "%02x%02x%02x%02x-%02x%02x-%02x%02x-%02x%02x-%02x%02x%02x%02x%02x%02x",
           b[0], b[1], b[2], b[3], b[4], b[5], b[6], b[7],
           b[8], b[9], b[10], b[11], b[12], b[13], b[14], b[15]);
}

void encolarConteo(unsigned long total, unsigned long cortes) {
  if (!configurada()) return;

  if (cuantasPendientes == MAX_PENDIENTES) {
    // Se descarta la más vieja y se dice en voz alta: callarlo sería perder datos en silencio
    Serial.println("# la cola se llenó: se descarta la tanda más vieja");
    memmove(&pendientes[0], &pendientes[1], sizeof(Tanda) * (MAX_PENDIENTES - 1));
    cuantasPendientes--;
  }

  Tanda &t = pendientes[cuantasPendientes++];
  nuevoId(t.id);
  t.alMillis = millis();
  t.total = total;
  t.cortes = cortes;
}

/**
 * La fecha de una tanda, en UTC. La placa no tiene reloj, así que se calcula hacia atrás desde la
 * hora que trajo el NTP: cuántos segundos han pasado desde que esa tanda se cerró.
 */
static bool fechaDe(const Tanda &t, char destino[25]) {
  if (!hayHora) return false;
  time_t ahora = time(nullptr);
  time_t cuando = ahora - (time_t) ((millis() - t.alMillis) / 1000UL);
  struct tm utc;
  gmtime_r(&cuando, &utc);
  strftime(destino, 25, "%Y-%m-%dT%H:%M:%SZ", &utc);
  return true;
}

/** Sube la tanda más vieja. true si el servidor la recibió (o ya la tenía). */
static bool subirUna() {
  char fecha[25];
  if (!fechaDe(pendientes[0], fecha)) return false;

  char cuerpo[420];
  snprintf(cuerpo, sizeof(cuerpo),
           "{\"dispositivo_id\":\"%s\",\"estanques\":[],\"lotes\":[],\"eventos\":[{"
           "\"tipo\":\"conteo\",\"id\":\"%s\",\"registrado_en\":\"%s\",\"origen\":\"contador\","
           "\"lote_id\":\"%s\",\"total\":%lu,\"cortes_multiples\":%lu}]}",
           DISPOSITIVO_ID, pendientes[0].id, fecha, LOTE_ID,
           pendientes[0].total, pendientes[0].cortes);

  HTTPClient http;
  http.begin(String(BACKEND_URL) + "/api/sync/push");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-Key", BACKEND_API_KEY);
  // Render gratis duerme y tarda cerca de un minuto en despertar
  http.setTimeout(90000);
  int codigo = http.POST(cuerpo);
  http.end();

  if (codigo == 200) return true;
  Serial.printf("# el servidor respondió %d; se reintenta\n", codigo);
  return false;
}

void atenderRed() {
  if (!configurada()) return;

  bool conectada = WiFi.status() == WL_CONNECTED;
  if (conectada && !hayRed) {
    Serial.printf("# en la red, ip %s\n", WiFi.localIP().toString().c_str());
    // Sin hora no se puede fechar un evento, y el servidor rechaza fechas que no cuadran
    configTime(0, 0, SERVIDOR_NTP);
  }
  hayRed = conectada;
  if (!hayRed) return;

  if (!hayHora && time(nullptr) > 1700000000) {
    hayHora = true;
    Serial.println("# hora puesta en reloj");
  }
  if (!hayHora || cuantasPendientes == 0) return;

  // Una por vuelta: así el conteo sigue andando mientras la cola se vacía
  if (subirUna()) {
    memmove(&pendientes[0], &pendientes[1], sizeof(Tanda) * (cuantasPendientes - 1));
    cuantasPendientes--;
    Serial.printf("# tanda subida, quedan %d\n", cuantasPendientes);
  }
}
