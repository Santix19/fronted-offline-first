import { parseMarkdown, type Inline } from './markdown';

/**
 * La voz del asistente: hablarle en vez de escribir y escuchar la respuesta.
 *
 * Usa lo que ya trae el navegador (Web Speech API), así que no cuesta nada, no necesita otra clave y
 * no pasa por el backend. Pensado para el cuidador que está junto al estanque con las manos mojadas
 * o con guantes: tocar un botón grande es fácil, escribir una pregunta en el celular no.
 *
 * Reconocer la voz en Chrome necesita internet (lo hace Google), igual que el asistente, así que no
 * agrega ninguna dependencia nueva de la señal. Leer en voz alta funciona sin internet.
 */

/** Español de Colombia primero: así entiende "pH", "alevinos" y los números como se dicen aquí. */
const LANG = 'es-CO';

// Lo mínimo de la API que se usa. TypeScript no la trae: Chrome y Safari la exponen con prefijo.
interface RecognitionResult {
  readonly isFinal: boolean;
  readonly 0: { readonly transcript: string };
}
interface RecognitionEvent {
  readonly resultIndex: number;
  readonly results: ArrayLike<RecognitionResult>;
}
interface Recognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | undefined {
  if (typeof window === 'undefined') return undefined;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

/** Si este navegador puede escuchar. Firefox, por ejemplo, no puede: el botón no se muestra. */
export function canListen(): boolean {
  return recognitionCtor() !== undefined;
}

/** Si este navegador puede leer en voz alta. */
export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

export interface ListenHandlers {
  /** Lo que va entendiendo, para mostrarlo mientras la persona habla. */
  onPartial(text: string): void;
  /** La frase completa, cuando la persona dejó de hablar. Vacía si no dijo nada. */
  onFinal(text: string): void;
  /** Un mensaje para el cuidador, ya en español. */
  onError(message: string): void;
}

/** Los errores del reconocimiento, dichos como los entiende quien está en el estanque. */
export function listenErrorMessage(code: string): string {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'El celular no dejó usar el micrófono. Dale permiso a la app en los ajustes del navegador.';
    case 'no-speech':
      return 'No te escuché. Toca «Hablar» y di tu pregunta cerca del celular.';
    case 'audio-capture':
      return 'No se encontró un micrófono en este celular.';
    case 'network':
      return 'Para entender la voz hace falta internet. Escribe la pregunta o inténtalo con señal.';
    default:
      return 'No se pudo entender la voz. Inténtalo otra vez o escribe la pregunta.';
  }
}

/**
 * Escucha una pregunta y devuelve una función para dejar de escuchar. Termina sola cuando la persona
 * hace una pausa: es una pregunta, no un dictado largo.
 */
export function listen(handlers: ListenHandlers): () => void {
  const Ctor = recognitionCtor();
  if (!Ctor) {
    handlers.onError('Este navegador no puede escuchar. Usa Chrome en Android o Safari en iPhone.');
    return () => {};
  }
  const recognition = new Ctor();
  recognition.lang = LANG;
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  let finalText = '';
  let failed = false;
  recognition.onresult = (event) => {
    let partial = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) finalText += result[0].transcript;
      else partial += result[0].transcript;
    }
    handlers.onPartial((finalText + partial).trim());
  };
  recognition.onerror = (event) => {
    // "aborted" es cuando el propio cuidador tocó "Detener": no es un error que haya que mostrar
    if (event.error === 'aborted') return;
    failed = true;
    handlers.onError(listenErrorMessage(event.error));
  };
  recognition.onend = () => {
    if (!failed) handlers.onFinal(finalText.trim());
  };
  recognition.start();
  return () => recognition.stop();
}

/** Unidades que un lector de voz dice mal o deletrea. El orden importa: "mg/L" antes que "g". */
const SPOKEN_UNITS: [RegExp, string][] = [
  [/\s?°\s?C\b/g, ' grados'],
  [/\s?mg\/L\b/gi, ' miligramos por litro'],
  [/\s?m³/g, ' metros cúbicos'],
  [/(\d)\s?kg\b/g, '$1 kilos'],
  [/(\d)\s?g\b/g, '$1 gramos'],
  [/(\d)\s?cm\b/g, '$1 centímetros'],
  [/\bpH\b/g, 'pe hache'],
  [/(\d)\s?–\s?(\d)/g, '$1 a $2'],
];

// Emojis y símbolos sueltos: la voz los lee por su nombre en inglés o se traba
const inlineText = (inlines: Inline[]) =>
  inlines.map((part) => part.text).join('').replace(/[\p{Extended_Pictographic}️]/gu, '').replace(/\s{2,}/g, ' ');

/** Una oración termina en punto, para que la voz haga la pausa entre una línea y la siguiente. */
const sentence = (text: string) => {
  const t = text.trim();
  return !t ? '' : /[.!?:;]$/.test(t) ? t : `${t}.`;
};

/**
 * La respuesta del asistente como se dice en voz alta: sin asteriscos ni almohadillas, cada título y
 * cada punto de una lista como una oración aparte, y las unidades con su nombre.
 */
export function toSpeech(markdown: string): string {
  const lines: string[] = [];
  for (const block of parseMarkdown(markdown)) {
    if (block.kind === 'list') block.items.forEach((item) => lines.push(sentence(inlineText(item))));
    else lines.push(sentence(inlineText(block.inlines)));
  }
  let text = lines.filter(Boolean).join(' ');
  for (const [pattern, spoken] of SPOKEN_UNITS) text = text.replace(pattern, spoken);
  return text.replace(/\s{2,}/g, ' ').trim();
}

/** La mejor voz en español que tenga el celular: de Colombia, de Latinoamérica o cualquiera en español. */
function spanishVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === 'es-CO') ??
    voices.find((v) => v.lang === 'es-419' || v.lang === 'es-US' || v.lang === 'es-MX') ??
    voices.find((v) => v.lang.toLowerCase().startsWith('es'))
  );
}

/** Lee una respuesta en voz alta. Corta lo que se estuviera leyendo antes. */
export function speak(markdown: string, onEnd: () => void): void {
  if (!canSpeak()) return onEnd();
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(toSpeech(markdown));
  utterance.lang = LANG;
  const voice = spanishVoice();
  if (voice) utterance.voice = voice;
  utterance.rate = 1;
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  synth.speak(utterance);
}

export function stopSpeaking(): void {
  if (canSpeak()) window.speechSynthesis.cancel();
}
