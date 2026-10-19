import { useCallback, useEffect, useState } from 'react';
import { facade } from '../../facade/PisciculturaFacade';
import { errorMessage } from '../../shared/http/ApiError';
import type { Person } from './peopleApi';

/**
 * Las personas de la finca, que viven solo en el servidor: no se guardan en el celular porque
 * administrar sin señal no tiene sentido y la lista incluye a gente de otros celulares.
 */
export function usePeople() {
  const [people, setPeople] = useState<Person[]>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  /** La clave temporal recién generada, para dictarla. Se borra al salir de la pantalla. */
  const [temporary, setTemporary] = useState<{ name: string; password: string }>();

  const reload = useCallback(async () => {
    try {
      setPeople(await facade.people());
      setError(undefined);
    } catch (problem) {
      setError(errorMessage(problem));
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const run = useCallback(
    async (action: () => Promise<void>) => {
      setBusy(true);
      try {
        await action();
        setError(undefined);
      } catch (problem) {
        setError(errorMessage(problem));
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const resetPassword = useCallback(
    (person: Person) =>
      run(async () => {
        setTemporary({ name: person.name, password: await facade.resetPassword(person.id) });
        await reload();
      }),
    [reload, run],
  );

  const toggleActive = useCallback(
    (person: Person) =>
      run(async () => {
        await facade.updatePerson(person.id, { active: !person.active });
        await reload();
      }),
    [reload, run],
  );

  return { people, error, busy, temporary, dismissTemporary: () => setTemporary(undefined), resetPassword, toggleActive };
}
