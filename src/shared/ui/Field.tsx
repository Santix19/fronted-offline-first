import { useId, type InputHTMLAttributes } from 'react';

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
}

/** Label + input + hint + error, wired for screen readers. Numbers open the numeric keyboard. */
export function Field({ label, value, onChange, hint, error, type = 'text', ...rest }: FieldProps) {
  const id = useId();
  const numeric = type === 'number';
  return (
    <div className="field" data-invalid={Boolean(error)}>
      <label htmlFor={id}>{label}</label>
      {hint && <span className="hint" id={`${id}-hint`}>{hint}</span>}
      <input
        id={id}
        type={numeric ? 'text' : type}
        inputMode={numeric ? 'decimal' : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={[hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined}
        {...rest}
      />
      {error && <span className="error" id={`${id}-error`}>{error}</span>}
    </div>
  );
}
