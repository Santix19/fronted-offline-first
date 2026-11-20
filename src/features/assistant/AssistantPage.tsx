import { Fragment, useEffect, useRef, useState, type FormEvent } from 'react';
import { facade } from '../../facade/PisciculturaFacade';
import { errorMessage } from '../../shared/http/ApiError';
import { Page } from '../../shared/ui/Page';
import { useOnline } from '../../shared/ui/useOnline';
import type { ChatTurn } from './assistantApi';
import { parseMarkdown, type Inline } from './markdown';

/** Las preguntas de todos los días, a un toque. */
const SHORTCUTS = [
  '¿Cuánto les doy de comer hoy?',
  'Hazme un informe de la finca',
  '¿Cómo está el agua de los estanques?',
  '¿Qué debería revisar hoy?',
];

/**
 * La conversación vive mientras la app está abierta: ir a otra pantalla y volver no la borra. No se
 * guarda en el celular a propósito, porque las respuestas se basan en los datos de ese momento.
 */
let conversation: ChatTurn[] = [];

function InlineText({ inlines }: { inlines: Inline[] }) {
  return (
    <>
      {inlines.map((part, i) =>
        part.bold ? <strong key={i}>{part.text}</strong> : part.italic ? <em key={i}>{part.text}</em> : <Fragment key={i}>{part.text}</Fragment>,
      )}
    </>
  );
}

/** Una respuesta del asistente, pintada como elementos de React (nunca como HTML). */
function AnswerText({ text }: { text: string }) {
  return (
    <>
      {parseMarkdown(text).map((block, i) => {
        if (block.kind === 'heading') {
          const Tag = block.level === 1 ? 'h3' : 'h4';
          return <Tag key={i}><InlineText inlines={block.inlines} /></Tag>;
        }
        if (block.kind === 'list') {
          const List = block.ordered ? 'ol' : 'ul';
          return (
            <List key={i}>
              {block.items.map((item, j) => <li key={j}><InlineText inlines={item} /></li>)}
            </List>
          );
        }
        return <p key={i}><InlineText inlines={block.inlines} /></p>;
      })}
    </>
  );
}

/**
 * Asistente de la finca (IA nivel 3): preguntas, informes y cuánto dar de comer.
 *
 * Responde Claude a través del backend, que le pasa el estado de la finca en ese momento. Necesita
 * señal: sin internet la pantalla lo dice y lo demás de la app sigue funcionando.
 */
export function AssistantPage() {
  const online = useOnline();
  const [turns, setTurns] = useState<ChatTurn[]>(conversation);
  const [draft, setDraft] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState<string>();
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    conversation = turns;
    end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns, waiting]);

  async function send(question: string) {
    const text = question.trim();
    if (!text || waiting) return;
    const history = turns;
    setTurns([...history, { role: 'user', text }]);
    setDraft('');
    setError(undefined);
    setWaiting(true);
    try {
      const answer = await facade.askAssistant(text, history);
      setTurns((current) => [...current, { role: 'assistant', text: answer.text }]);
    } catch (e) {
      setError(errorMessage(e));
      // La pregunta que no se respondió vuelve al cuadro para mandarla otra vez
      setTurns(history);
      setDraft(text);
    } finally {
      setWaiting(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void send(draft);
  }

  return (
    <Page title="Asistente">
      <section className="section assistant">
        <p className="muted">
          Pregúntale sobre el agua, los lotes o la alimentación. Responde con los datos que tiene el servidor
          ahora mismo; la ración la calcula el sistema experto de la finca.
        </p>

        {!online && <p className="notice warn">Sin conexión: el asistente necesita internet.</p>}

        {turns.length === 0 && (
          <div className="assistant-shortcuts">
            {SHORTCUTS.map((s) => (
              <button key={s} type="button" className="button secondary" disabled={!online || waiting} onClick={() => void send(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="assistant-chat" aria-live="polite">
          {turns.map((turn, i) => (
            <div key={i} className={`bubble ${turn.role}`}>
              {turn.role === 'user' ? <p>{turn.text}</p> : <AnswerText text={turn.text} />}
            </div>
          ))}
          {waiting && (
            <div className="bubble assistant thinking">
              <p className="muted">Pensando… (si el servicio estaba dormido puede tardar un minuto)</p>
            </div>
          )}
          <div ref={end} />
        </div>

        {error && <p className="notice danger">{error}</p>}

        <form className="assistant-form" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="pregunta">Tu pregunta</label>
            <textarea
              id="pregunta"
              rows={2}
              maxLength={4000}
              value={draft}
              placeholder="Ej.: ¿cuánto alimento le doy al lote L1 y en cuántas tomas?"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void send(draft);
                }
              }}
            />
          </div>
          <div className="button-row">
            <button className="button" type="submit" disabled={!online || waiting || !draft.trim()}>
              {waiting ? 'Esperando respuesta…' : 'Preguntar'}
            </button>
            {turns.length > 0 && (
              <button className="button secondary" type="button" disabled={waiting} onClick={() => { setTurns([]); setError(undefined); }}>
                Nueva conversación
              </button>
            )}
          </div>
        </form>
        <p className="muted panel-note">Responde Claude (Anthropic). Puede equivocarse: ante un problema serio de salud de los peces, consulta a un profesional.</p>
      </section>
    </Page>
  );
}
