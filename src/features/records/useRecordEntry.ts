import { useEffect, useState, type FormEvent } from 'react';
import { facade } from '../../facade/PisciculturaFacade';
import { errorMessage } from '../../shared/http/ApiError';
import { deviceDateError, toDateTimeInput, toIsoWithOffset } from '../../shared/utils/dates';
import { navigate } from '../../shared/ui/router';
import { correctedRecord } from './correctedRecord';
import { buildRecord, RECORD_FIELDS, SOURCE_OPTIONS, type FormValues } from './recordForm';
import { parentIdOf, type FieldRecord, type RecordSource, type RecordType } from './recordTypes';
import { validateRecord, type ValidationErrors } from './recordValidation';

/** Form state and save feedback; no transport or sync rules live in this hook. */
export function useRecordEntry(type: RecordType, parentId: string, recordId?: string) {
  const [values, setValues] = useState<FormValues>({});
  const [when, setWhen] = useState(toDateTimeInput());
  const [source, setSource] = useState<RecordSource>(Object.keys(SOURCE_OPTIONS[type] ?? { manual: '' })[0] as RecordSource);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [savedCount, setSavedCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [original, setOriginal] = useState<FieldRecord>();
  const [loading, setLoading] = useState(Boolean(recordId));
  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    if (!recordId) return;
    let active = true;
    facade.rejected().then(({ records }) => {
      if (!active) return;
      const row = records.find((r) => r.id === recordId && r.type === type && parentIdOf(r) === parentId);
      if (!row) { setBlocked(true); setErrors({ form: 'Este registro ya no está rechazado. Vuelve a Sincronizar para revisar su estado.' }); return; }
      setOriginal(row);
      setValues(Object.fromEntries(RECORD_FIELDS[type].map(({ key }) => [key, String((row as unknown as FormValues)[key] ?? '')])));
      setWhen(toDateTimeInput(new Date(row.recordedAt)));
      setSource(row.source);
    }).catch((error) => { if (active) { setBlocked(true); setErrors({ form: errorMessage(error) }); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [recordId, type, parentId]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || loading || blocked || (recordId && !original)) return;
    const clock = deviceDateError(new Date());
    const record = buildRecord({ type, parentId, values, source, recordedAt: toIsoWithOffset(new Date(when)) });
    const found = validateRecord(record);
    if (clock) found.form = clock + '. Activa la fecha y hora automáticas antes de guardar.';
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      await facade.saveRecord(original ? correctedRecord(record, original) : record);
      if (original) { navigate('/sincronizacion', { replace: true }); return; }
      setSavedCount((n) => n + 1);
      setValues({}); setWhen(toDateTimeInput());
    } catch (error) { setErrors({ form: errorMessage(error) }); }
    finally { setBusy(false); }
  }
  return { values, setValues, when, setWhen, source, setSource, errors, savedCount, busy, loading, blocked, submit };
}
