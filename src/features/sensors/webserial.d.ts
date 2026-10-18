
/**
 * Minimal Web Serial typings. They are not part of TypeScript's DOM library yet, and we declare
 * only the members ArduinoSerialAdapter uses, so nothing else in the app can depend on more.
 */

interface SerialPortInfo {
  usbVendorId?: number;
  usbProductId?: number;
}
