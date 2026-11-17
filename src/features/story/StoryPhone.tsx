/**
 * The phone that appears in the middle of the story. Its markup is the END state (signal back,
 * record uploaded), so with scripts off or reduced motion it still tells the finished story.
 * The timeline rewinds it to the beginning: no signal, record waiting to upload.
 */
export function StoryPhone() {
  return (
    <div className="story-phone" aria-hidden="true">
      <div className="phone-bar">
        <span className="signal-off">Sin señal</span>
        <span className="signal-on">Con señal</span>
      </div>
      <div className="phone-body">
        <div className="reading ok">
          <span className="value">
            <span className="story-temp">12,4</span>
            <span className="unit">°C</span>
          </span>
          <span className="label">Temperatura · Bien</span>
        </div>
        <div className="phone-row">
          <span className="chip warn chip-wait">Por subir</span>
          <span className="chip ok chip-done">Subido</span>
          <span className="phone-queue">
            En cola: <strong className="story-queue">0</strong>
          </span>
        </div>
        <p className="phone-demo">Datos de ejemplo</p>
      </div>
    </div>
  );
}
