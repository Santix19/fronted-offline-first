/**
 * Minimal Web Serial typings. They are not part of TypeScript's DOM library yet, and we declare
 * only the members ArduinoSerialAdapter uses, so nothing else in the app can depend on more.
 */
interface SerialPortInfo {
  usbVendorId?: number;
  usbProductId?: number;
}

interface SerialOptions {
  baudRate: number;
}

interface SerialPort {
  readonly readable: ReadableStream<Uint8Array> | null;
  open(options: SerialOptions): Promise<void>;
  close(): Promise<void>;
  getInfo(): SerialPortInfo;
}

interface Serial {
  requestPort(): Promise<SerialPort>;
  getPorts(): Promise<SerialPort[]>;
}

interface Navigator {
  /** Only in Chrome/Edge over https or localhost; undefined everywhere else. */
  readonly serial?: Serial;
}
