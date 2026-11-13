import { useId, type InputHTMLAttributes } from 'react';

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  /** big: the value is one number, typed large on the right with its unit (design.md "Campo") */
  big?: boolean;
  unit?: string;
  /** Something worth knowing before saving that does not stop the save (a reading out of range) */
  warning?: string;
}

/** Label + input + hint + error, wired for screen readers. Numbers open the numeric keyboard. */
export function Field({ label, value, onChange, hint, error, big = false, unit, warning, type = 'text', ...rest }: FieldProps) {
  const id = useId();
  const numeric = type === 'number';
  const note = error ? `${id}-error` : warning ? `${id}-warning` : undefined;
  return (
    <div className={big ? 'field field-big' : 'field'} data-invalid={Boolean(error)} data-warning={Boolean(warning && !error)}>
      <div className="field-text">
        <label htmlFor={id}>
          {label}
          {unit && <span className="visually-hidden"> en {unit}</span>}
        </label>
        {hint && <span className="hint" id={`${id}-hint`}>{hint}</span>}
      </div>
      <input
        id={id}
        type={numeric ? 'text' : type}
        inputMode={numeric ? 'decimal' : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={[hint && `${id}-hint`, note].filter(Boolean).join(' ') || undefined}
        {...rest}
      />
      {big && <span className="unit" aria-hidden="true">{unit}</span>}
      {error && <span className="error" id={`${id}-error`}>{error}</span>}
      {warning && !error && <span className="warning" id={`${id}-warning`} role="status">{warning}</span>}
    </div>
  );
}
