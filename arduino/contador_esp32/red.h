#pragma once

/*
 * Lo que el sketch principal necesita saber de la parte de red, y nada más.
 *
 * Esta cabecera existe por una razón concreta del compilador de Arduino. El IDE junta todos los
 * .ino en un solo archivo y le inventa arriba un prototipo a cada función que encuentra. Si una de
 * ellas recibe un tipo propio —aquí `Tanda`, que es interna de la cola de envío—, el prototipo
 * aparece antes de que ese tipo exista y la compilación se cae con "does not name a type", aunque
 * en el archivo original el orden sea correcto.
 *
 * Por eso la red vive en red.cpp y no en red.ino: un .cpp se compila tal como está escrito, sin
 * prototipos inventados. Lo que el sketch principal usa se declara aquí.
 */

/** Conecta el WiFi y pone la hora en punto. Sin WIFI_SSID configurado no hace nada. */
void iniciarRed();

/** Atiende la cola: reconecta si hace falta y sube una tanda por vuelta. Llamar desde loop(). */
void atenderRed();

/** Mete una tanda en la cola de envío. El id se crea aquí, así que reintentar no duplica. */
void encolarConteo(unsigned long total, unsigned long cortes);
