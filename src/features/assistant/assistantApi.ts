import { apiRequest } from '../../shared/http/httpClient';

export interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
}

export interface AssistantAnswer {
  text: string;
  model: string;
}

/**
 * La IA puede estar dormida en Render (un minuto) y el modelo de lenguaje tarda hasta medio minuto en
 * escribir un informe; el backend espera 150 s, aquí un poco más.
 */
const ASSISTANT_TIMEOUT_MS = 160_000;

/** Lo que se le manda al modelo de la conversación anterior: lo último, para no mandar libros. */
const HISTORY_TURNS = 12;

/** POST /api/asistente. El backend le agrega el estado de la finca y se lo pasa a la IA. */
export async function askAssistant(question: string, history: ChatTurn[]): Promise<AssistantAnswer> {
  const json = await apiRequest<{ respuesta: string; modelo: string }>('POST', '/api/asistente', {
    body: {
      pregunta: question,
      historial: history.slice(-HISTORY_TURNS).map((t) => ({
        rol: t.role === 'user' ? 'usuario' : 'asistente',
        texto: t.text,
      })),
    },
    timeoutMs: ASSISTANT_TIMEOUT_MS,
  });
  return { text: json.respuesta, model: json.modelo };
}
