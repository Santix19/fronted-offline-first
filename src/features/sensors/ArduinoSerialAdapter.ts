import { parseFrame, type FrameDialect } from './serialFrames';
import { SensorBroadcast } from './sensorBroadcast';
import type { SensorDescriptor, SensorEvent, SensorSource } from './sensorTypes';

/**
 * Adapter between the Arduino and the system.
 *
 * The adaptee is the Web Serial port: it hands over chunks of bytes that cut lines anywhere, and it
 * knows nothing about fish. The target is SensorSource. Above this file nobody knows a cable exists,
 * so the counting screen is the same with a board, with the mock or with whatever comes next.
 */
export class ArduinoSerialAdapter implements SensorSource {
  private readonly events = new SensorBroadcast();

  private port?: SerialPort;

  private reader?: ReadableStreamDefaultReader<Uint8Array>;

  private readonly decoder = new TextDecoder();

  /** Half a frame that arrived in the previous chunk and waits for its end */

  private pending = '';

  private closing = false;

  constructor(readonly descriptor: SensorDescriptor, private readonly dialect: FrameDialect) {}

  async open(): Promise<void> {
    if (!navigator.serial) {
      throw new Error('Este navegador no puede abrir el puerto USB. Usa Chrome en el celular o en el computador.');
    }
    // Chrome requires the caretaker to pick the port: it cannot be opened without them
    this.port = await navigator.serial.requestPort();
    await this.port.open({ baudRate: this.descriptor.baudRate ?? 9600 });
    void this.readLoop();
  }

  async close(): Promise<void> {
    this.closing = true;
    await this.reader?.cancel().catch(() => undefined);
    await this.port?.close().catch(() => undefined);
    this.reader = undefined;
    this.port = undefined;
    this.pending = '';
    this.closing = false;
  }

  subscribe(listener: (event: SensorEvent) => void): () => void {
    return this.events.subscribe(listener);
  }

  private async readLoop(): Promise<void> {
    const stream = this.port?.readable;
    if (!stream) return;
    this.reader = stream.getReader();
    try {
      for (;;) {
        const { value, done } = await this.reader.read();
        if (done) break;
        // stream: true keeps a multi-byte character split across two chunks from being mangled
        this.consume(value ? this.decoder.decode(value, { stream: true }) : '');
      }
    } catch {
      // Unplugging the cable mid-count is normal in the field; only a real loss is reported
      if (!this.closing) {
        this.events.emit({ type: 'problem', message: 'Se perdió la conexión con el contador: revisa el cable USB' });
      }
    }
  }
}

