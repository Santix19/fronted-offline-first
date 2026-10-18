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
}

