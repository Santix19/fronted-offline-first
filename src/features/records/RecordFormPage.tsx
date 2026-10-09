import { useState, type FormEvent } from 'react';
import { useLiveQuery } from '../../shared/db/useLiveQuery';
import { Choices } from '../../shared/ui/Choices';
import { Field } from '../../shared/ui/Field';
import { Page } from '../../shared/ui/Page';
import { toDateTimeInput, toIsoWithOffset } from '../../shared/utils/dates';
import { getBatch } from '../batches/batchRepository';
import { getPond } from '../ponds/pondRepository';
import { buildRecord, RECORD_FIELDS, SOURCE_OPTIONS, type FormValues } from './recordForm';
import { saveRecord } from './recordRepository';
import { RECORD_LABELS, type RecordSource, type RecordType } from './recordTypes';
import { validateRecord, type ValidationErrors } from './recordValidation';
import { SavedNotice } from './SavedNotice';

interface RecordFormPageProps {
  type: RecordType;
  /** Water readings belong to a pond; everything else to a batch */
  parentId: string;
}

async function loadParentName(type: RecordType, parentId: string): Promise<string | undefined> {
  if (type === 'water_reading') return (await getPond(parentId))?.name;
  const batch = await getBatch(parentId);
  return batch && `Lote ${batch.code}`;
}

/** One screen for the five field records; the fields come from RECORD_FIELDS. Saves on the phone. */
export function RecordFormPage({ type, parentId }: RecordFormPageProps) {
  const parentName = useLiveQuery(() => loadParentName(type, parentId), ['ponds', 'batches'], [type, parentId]);
  const sources = SOURCE_OPTIONS[type];
  const [values, setValues] = useState<FormValues>({});
  const [when, setWhen] = useState(toDateTimeInput());
  const [source, setSource] = useState<RecordSource>(sources ? (Object.keys(sources)[0] as RecordSource) : 'manual');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [savedCount, setSavedCount] = useState(0);
  const backTo = type === 'water_reading' ? `/estanques/${parentId}` : `/lotes/${parentId}`;

  async function submit(event: FormEvent) {
    event.preventDefault();
    const record = buildRecord({ type, parentId, values, source, recordedAt: toIsoWithOffset(new Date(when)) });
    const found = validateRecord(record);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    await saveRecord(record);
    setSavedCount((n) => n + 1);
    setValues({});
    setWhen(toDateTimeInput());
  }

  return (
    <Page title={RECORD_LABELS[type]} backTo={backTo}>
      <p className="muted">{parentName ?? ''}</p>
      {savedCount > 0 && <SavedNotice count={savedCount} backHref={`#${backTo}`} />}
      <form className="form" onSubmit={submit} noValidate>
        {errors.form && <p className="notice danger" role="alert">{errors.form}</p>}
        {RECORD_FIELDS[type].map((spec) => (
          <Field
            key={spec.key}
            label={spec.label}
            hint={spec.hint}
            type={spec.kind === 'number' ? 'number' : 'text'}
            value={values[spec.key] ?? ''}
            onChange={(value) => setValues((v) => ({ ...v, [spec.key]: value }))}
            error={errors[spec.key]}
          />
        ))}
        {sources && <Choices label="Cómo se contó" name="source" value={source} options={sources as Record<RecordSource, string>} onChange={setSource} />}
        <Field label="Fecha y hora" type="datetime-local" value={when} onChange={setWhen} error={errors.recordedAt} hint="Cámbiala solo si registras algo que pasó antes" />
        <button className="button block" type="submit">Guardar {RECORD_LABELS[type].toLowerCase()}</button>
      </form>
    </Page>
  );
}
