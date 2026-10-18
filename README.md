# La Cocha · App del cuidador (frontend offline-first)

App web instalable (PWA) que usa el cuidador en los estanques de trucha de La Cocha. Registra lecturas
de agua, mortalidad, alimentación, biometrías y conteos de alevinos. **Funciona sin internet**: todo se
guarda primero en el celular y se sube solo al backend cuando hay señal.

**Stack:** React 19 · TypeScript · Vite · IndexedDB · Service Worker. La única dependencia de producción es React.
La base local, la cola offline y la sincronización son código propio, corto y explicable.

## Cómo está organizado

Una carpeta por cada API del backend. Cada carpeta tiene sus tipos, su llamada a la API, su acceso a los
datos del celular y sus pantallas. El código está en inglés y lo que ve el usuario en español.

```
src/
├── features/
│   ├── ponds/      Estanques    → /api/estanques           (lista, detalle, formulario, banda de agua)
│   ├── batches/    Lotes        → /api/lotes y /resumen    (detalle, formulario, resumen del sistema experto)
│   ├── records/    Registros    → eventos del push         (los 5 formularios, validación, historial)
│   ├── alerts/     Alertas      → /api/alertas             (lista y "atendida", también sin señal)
│   ├── sync/       Sincronizar  → /api/sync/push y /pull   (cola, pasos de la sincronización, estado)
│   ├── settings/   Ajustes      (servidor, clave, nombre del celular, prueba de conexión)
│   ├── sensors/    Contador     (puerto serial del Arduino, fábrica de fuentes, decoradores)
│   └── counting/   Conteo       (sesión de conteo, motores de persistencia, pantalla)
├── facade/         La única puerta de entrada: PisciculturaFacade
├── shared/
│   ├── db/         Base del celular (IndexedDB) y refresco automático de pantallas
│   ├── http/       El único lugar que habla con el backend (clave, tiempos de espera, errores)
│   ├── ui/         Componentes comunes (marco de pantalla, campo, botones de opción, router)
│   └── utils/      Fechas con zona horaria, ids, números, formatos
├── app/            Rutas, navegación inferior y arranque
└── styles/         Colores, tipografía y componentes visuales
public/sw.js        Service worker: guarda la app para abrirla sin señal
mock-api/           Backend simulado para demos (mismas rutas y JSON que el real)
arduino/            Sketch del contador de alevinos (lo que la app lee por el puerto USB)
```

Cada archivo hace una sola cosa. Ningún archivo de `src/` pasa de 80 líneas de código.

En cada carpeta de `features/` los archivos siguen el mismo patrón:

| Archivo | Qué hace |
|---|---|
| `xxxTypes.ts` | El tipo de dato en inglés (`Pond`, `Batch`, `Alert`…) |
| `xxxApi.ts` | El JSON del backend (en español) y cómo se convierte al tipo en inglés |
| `xxxRepository.ts` | Leer y guardar en la base del celular |
| `XxxPage.tsx` | Las pantallas |

Las pantallas **no** importan `xxxRepository`, `xxxApi` ni el motor de sincronización: todas pasan por
`facade/PisciculturaFacade.ts`. Es una regla que se revisa con un `grep` (ver *Patrones de diseño*).

## Patrones de diseño

Cinco patrones, cada uno puesto donde ya había una frontera real del sistema, no de adorno.

| Patrón | Dónde | Qué problema resuelve |
|---|---|---|
| **Facade** | `facade/PisciculturaFacade.ts` | Las pantallas llamaban directo a la base del celular, a la sincronización y a los eventos. Ahora hay una sola puerta: la pantalla pide "los lotes" y no sabe que hay IndexedDB, ni que subir son cuatro pasos en orden, ni que un conteo se puede retomar. |
| **Factory Method** | `features/sensors/SensorFactory.ts` | Cada contador se abre distinto: el infrarrojo a 115200 baudios y sí distingue cortes múltiples, el ultrasónico a 9600 y no los distingue, el simulador no necesita puerto. Agregar un contador nuevo es agregar una subclase; ni la fachada ni las pantallas cambian. |
| **Adapter** | `features/sensors/ArduinoSerialAdapter.ts` | El puerto serial entrega pedazos de bytes que cortan las líneas por la mitad; el sistema habla de alevinos. El adaptador traduce, y arriba de él nadie sabe que existe un cable. El protocolo vive aparte, en `serialFrames.ts`, para poder probarlo sin placa. |
| **Bridge** | `features/counting/` | Las reglas de conteo y control (`CountingSession`, `SupervisedCountingSession`) quedaron separadas del motor que guarda (`IndexedDbCountStore` en la app, `MemoryCountStore` en las pruebas). Cada lado evoluciona solo: por eso el conteo se prueba completo sin IndexedDB y sin Arduino. |
| **Decorator** | `features/sensors/sensorDecorators.ts` | Dos capacidades transversales que se prenden y apagan sin tocar el adaptador: `LoggingSensorDecorator` (bitácora de tramas, para calibrar el contador en el estanque sin un portátil al lado) y `DedupeSensorDecorator` (el puerto repite la última línea al reconectar, y un pulso repetido infla el conteo del lote). |

El orden de los decoradores importa y está puesto a propósito en `SensorFactory.create`: la bitácora va **por
dentro**, para que muestre las tramas como llegaron, incluidas las repetidas que el deduplicador descarta. Eso
es justo lo que delata un cable flojo.

## Cómo funciona el modo sin internet

```
 Cuidador ──► Formulario ──► Base del celular (IndexedDB) ──► Pantallas
                                    │  estado "Por subir"
                                    ▼  cuando hay señal
                          POST /api/sync/push  (de a 500, en orden: estanques → lotes → eventos)
                                    │
                aceptados / duplicados → "Subido"      rechazados → "Rechazado" + motivo
                                    ▼
                          GET /api/sync/pull?desde=<servidor_en>
                          trae cambios de otros celulares y las alertas pendientes
```

- **El celular crea el id (UUID) de cada registro.** Si la señal se cae y se reenvía, el backend lo
  reconoce como duplicado y no lo guarda dos veces.
- **Nada se borra en silencio.** Lo que el servidor rechaza queda visible en *Sincronizar* con el motivo,
  para corregirlo o descartarlo.
- **Estanques y lotes se pueden editar sin señal.** Gana la edición más reciente, la misma regla del backend.
  Si otro celular editó después, la app descarga esa versión.
- **El cursor del pull es la hora del servidor**, no la del celular, para que un reloj atrasado no pierda cambios.
- **Se sincroniza sola** al abrir la app, al volver la señal, unos segundos después de cada registro y cada
  2 minutos. También hay un botón *Sincronizar ahora*.
- **Primer intento con espera larga (90 s):** Render gratis tarda ~1 minuto en despertar.
- Las validaciones del formulario son **las mismas del backend** (pH 0–14, fechas desde 2024…), para que un
  dato malo no llegue a la cola.

## Pruebas

```bash
npm test          # pruebas de sincronización, validación, protocolo del contador y conteo (32 pruebas)
npm run typecheck # revisa los tipos de TypeScript
```

Las pruebas cubren lo más delicado: cómo se divide la cola en envíos, cómo se leen las respuestas del push,
quién gana cuando dos celulares editan lo mismo y las validaciones de cada registro. También el protocolo
del contador (tramas con ruido, tramas repetidas, placas que no miden cortes) y la sesión de conteo completa:
retomar un conteo a medias, corregir a mano, cerrarlo y descartarlo, todo sin IndexedDB y sin placa gracias al
Bridge.

El flujo completo también se probó en un navegador real: registrar sin señal, cerrar y abrir la app sin señal,
volver a tener señal y verificar en el servidor que llegó todo, la alerta del sistema experto, atender una
alerta sin señal, y recibir la edición de otro celular.

## Publicar

```bash
npm run build     # genera la carpeta dist/
```

`dist/` es un sitio estático. Se puede publicar gratis en Netlify, Vercel, Cloudflare Pages o un *Static Site*
de Render. Después:

1. En el backend (Render), pon la URL publicada en `ALLOWED_ORIGINS`. Si no, el navegador bloquea las llamadas (CORS).
2. Configura `VITE_API_URL` y `VITE_API_KEY` en el servicio donde publiques, o escríbelos en *Ajustes*.
3. En el celular, abre la URL en Chrome y elige **Agregar a la pantalla de inicio**.

El modo sin internet necesita **HTTPS** (o `localhost`). Para probar en el celular, usa la versión publicada.

## Límites conocidos y decisiones pendientes

- **Los dos repos del backend son versiones distintas del mismo backend.** La app usa lo que tienen en común.
  El resumen del lote muestra los campos extra (días de cultivo, densidad, conversión) solo si el backend los envía.
- **iPhone:** Safari puede borrar los datos de una web que no se abre en semanas, y no sincroniza con la app
  cerrada. Por eso la app pide almacenamiento persistente (ver *Ajustes*) y sincroniza al abrirse.
  En Android con Chrome no hay este problema.
- **Registro por voz:** el backend acepta `origen: "voz"`, pero el reconocimiento de voz del navegador necesita
  internet. Queda para una siguiente versión.
- **Sensor ESP32:** si el sensor envía directo al backend, la app muestra esas lecturas al sincronizar
  (`/api/estanques/{id}/lecturas`). El contador por USB es el otro camino: pasa por el celular y entra a la cola.
- **El conteo en curso vive en el store `meta`** (clave `count:<lote>`), no en una tabla nueva, para no tener
  que subir la versión de la base del celular. Si algún día se necesitan varios conteos por lote a la vez,
  ahí sí toca migración.
- **La clave `X-API-Key` queda dentro de la app.** Es aceptable para el piloto. En producción haría falta un
  inicio de sesión por usuario.
- Los rangos de colores de la banda de agua copian los de `Rules.java` del backend. Si el productor los ajusta,
  hay que cambiarlos en los dos lados (`src/features/ponds/waterRanges.ts`).
