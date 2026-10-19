import { useState, type FormEvent } from 'react';
import { facade } from '../../facade/PisciculturaFacade';
import { errorMessage } from '../../shared/http/ApiError';
import { Field } from '../../shared/ui/Field';
import { useOnline } from '../../shared/ui/useOnline';
import { AuthScreen } from './AuthScreen';
import { documentError, nameError, onlyErrors, passwordError, pinError, type AuthErrors } from './authValidation';
import { PinField } from './PinField';

/** Creating the account leaves the session already open: one less form to fill in. */
export function RegisterPage({ onLogin }: { onLogin: () => void }) {
  const online = useOnline();

  const [values, setValues] = useState({ document: '', name: '', password: '', pin: '' });

  const [errors, setErrors] = useState<AuthErrors>({});

  const [busy, setBusy] = useState(false);
}

