import { useEffect, useState } from 'react';
import { requestPersistentStorage } from '../../shared/db/database';

/**
 * Tells the caretaker whether the browser promised to keep the data.
 * Without that promise, a phone low on space (mostly iPhone) could delete what was not uploaded yet.
 */
export function StorageInfo() {
  const [persistent, setPersistent] = useState<boolean>();

  useEffect(() => {
    navigator.storage?.persisted?.().then(setPersistent);
  }, []);

  return (
    <section className="panel">
      <h2>Datos en el celular</h2>
      {persistent ? (
        <p className="notice ok">El celular guarda los datos de forma permanente.</p>
      ) : (
        <>
          <p className="notice warn">
            El navegador podría borrar los datos si el celular se queda sin espacio. Instala la app en la pantalla de
            inicio y toca el botón para protegerlos.
          </p>
          <button className="button secondary" onClick={() => requestPersistentStorage().then(setPersistent)}>
            Proteger los datos
          </button>
        </>
      )}
    </section>
  );
}
