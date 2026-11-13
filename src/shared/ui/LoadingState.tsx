/** Stable, quiet placeholder while IndexedDB or a connected service answers. */
export function LoadingState({ label = 'Cargando datos del celular…' }: { label?: string }) {
  return (
    <div className="loading-state" role="status" aria-busy="true">
      <p>{label}</p>
      <div className="skeleton" aria-hidden="true"><span className="skeleton-bar tall" /><span className="skeleton-bar" /></div>
    </div>
  );
}
