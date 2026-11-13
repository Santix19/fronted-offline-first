import { facade } from '../../facade/PisciculturaFacade';
import { useLiveQuery } from '../../shared/db/useLiveQuery';
import { Choices } from '../../shared/ui/Choices';
import { Field } from '../../shared/ui/Field';
import { Page } from '../../shared/ui/Page';
import { ClockNotice } from '../../shared/ui/ClockNotice';
import { LoadingState } from '../../shared/ui/LoadingState';
import { readingWarning } from './readingWarning';
import { RECORD_FIELDS, SOURCE_OPTIONS } from './recordForm';
import { RECORD_LABELS, type RecordSource, type RecordType } from './recordTypes';
import { useRecordEntry } from './useRecordEntry';
import { SavedNotice } from './SavedNotice';

interface RecordFormPageProps {
  type: RecordType;
  /** Water readings belong to a pond; everything else to a batch */
  parentId: string;
  recordId?: string;
}

async function loadParentName(type: RecordType, parentId: string): Promise<string | null> {
  if (type === 'water_reading') return (await facade.pond(parentId))?.name ?? null;
  const batch = await facade.batch(parentId);
  return batch ? `Lote ${batch.code}` : null;
}

/** One screen for the five field records; the fields come from RECORD_FIELDS. Saves on the phone. */
export function RecordFormPage({ type, parentId, recordId }: RecordFormPageProps) {
  const parentName = useLiveQuery(() => loadParentName(type, parentId), ['ponds', 'batches'], [type, parentId]);
  const sources = SOURCE_OPTIONS[type];
  const { values, setValues, when, setWhen, source, setSource, errors, savedCount, busy, loading, blocked, submit } = useRecordEntry(type, parentId, recordId);
  const backTo = type === 'water_reading' ? `/estanques/${parentId}` : `/lotes/${parentId}`;

  return (
    <Page title={RECORD_LABELS[type]} backTo={backTo}>
      <p className="muted">{parentName ?? ''}</p>
      {parentName === null && <p className="notice danger" role="alert">Este estanque o lote no existe en el celular. Vuelve al inicio y elige uno de la lista.</p>}
      <ClockNotice />
      {recordId && <p className="notice">Corrige los datos y vuelve a guardarlos. Se reenvían cuando haya señal.</p>}
      {savedCount > 0 && <SavedNotice count={savedCount} backHref={`#${backTo}`} />}
      {loading || parentName === undefined ? <LoadingState /> : parentName !== null && <form className="form" onSubmit={submit} noValidate>
        {errors.form && <p className="notice danger" role="alert">{errors.form}</p>}
        {RECORD_FIELDS[type].map((spec) => (
          <Field
            key={spec.key}
            label={spec.label}
            hint={spec.hint}
            type={spec.kind === 'number' ? 'number' : 'text'}
            big={spec.kind === 'number'}
            unit={spec.unit}
            warning={readingWarning(spec.key, values[spec.key] ?? '')}
            value={values[spec.key] ?? ''}
            onChange={(value) => setValues((v) => ({ ...v, [spec.key]: value }))}
            error={errors[spec.key]}
          />
        ))}
        {sources && <Choices label="Cómo se contó" name="source" value={source} options={sources as Record<RecordSource, string>} onChange={setSource} />}
        <Field label="Fecha y hora" type="datetime-local" value={when} onChange={setWhen} error={errors.recordedAt} hint="Cámbiala solo si registras algo que pasó antes" />
        <button className="button block" type="submit" disabled={busy || blocked}>{busy ? 'Guardando…' : recordId ? 'Guardar y reenviar' : `Guardar ${RECORD_LABELS[type].toLowerCase()}`}</button>
      </form>}
    </Page>
  );
}
