import { Trout } from '../../shared/ui/Trout';
import { useOnline } from '../../shared/ui/useOnline';

/** Confirmation after saving. Says plainly where the record is, so nobody records it twice. */
export function SavedNotice({ count, backHref }: { count: number; backHref: string }) {
  const online = useOnline();
  return (
    <div className="notice ok saved" role="status">
      <Trout className="trout-leap" width={64} />
      <p>
        <strong>{count === 1 ? 'Registro guardado' : `${count} registros guardados`} en el celular.</strong>{' '}
        {online ? 'Se sube al servidor en unos segundos.' : 'Se sube solo cuando vuelva la señal.'}
      </p>
      <p style={{ marginTop: 8 }}>
        <a href={backHref}>Terminar y volver</a> o llena el formulario otra vez para registrar otro.
      </p>
    </div>
  );
}
