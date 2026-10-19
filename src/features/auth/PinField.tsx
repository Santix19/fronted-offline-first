import { Field } from '../../shared/ui/Field';
import { PIN_LENGTH } from './authValidation';

interface PinFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
}

/**
 * The PIN that opens the app without signal. Four digits, numeric keyboard, and nothing but digits
 * gets through: at the pond the caretaker types this with wet hands and should not fight the form.
 */
export function PinField({ label, value, onChange, hint, error }: PinFieldProps) {
  return (
    <Field
      label={label}
      type="password"
      inputMode="numeric"
      autoComplete="off"
      maxLength={PIN_LENGTH}
      value={value}
      onChange={(typed) => onChange(typed.replace(/\D/g, '').slice(0, PIN_LENGTH))}
      hint={hint}
      error={error}
    />
  );
}
