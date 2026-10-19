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
