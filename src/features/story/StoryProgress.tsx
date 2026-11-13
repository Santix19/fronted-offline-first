const LABELS = ['Anotar', 'Guardar', 'Subir', 'Contar'];

export function StoryProgress({ chapter, go }: { chapter: number; go: (step: number) => void }) {
  return (
    <nav className="lg-progress" aria-label="Pasos de la historia">
      {LABELS.map((label, i) => (
        <button key={label} type="button" onClick={() => go(i + 1)} aria-label={`Paso ${i + 1}: ${label}`} aria-current={chapter === i + 1 ? 'step' : undefined} data-done={chapter > i + 1}>
          <span className="lg-diamond" aria-hidden="true" />
          <span aria-hidden="true">{label}</span>
        </button>
      ))}
    </nav>
  );
}
