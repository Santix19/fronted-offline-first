import { useState, type FormEvent } from 'react';
import { facade } from '../../facade/PisciculturaFacade';
import { errorMessage } from '../../shared/http/ApiError';
import { Field } from '../../shared/ui/Field';
import { useOnline } from '../../shared/ui/useOnline';
import { AuthScreen } from './AuthScreen';
import { documentError, onlyErrors, passwordError, pinError, type AuthErrors } from './authValidation';
import { PinField } from './PinField';

/** Signing in needs signal: it is the one moment the phone has to talk to the backend. */
export function LoginPage({ onRegister }: { onRegister: () => void }) {
  const online = useOnline();

  const [document, setDocument] = useState('');

  const [password, setPassword] = useState('');

  const [pin, setPin] = useState('');

  const [errors, setErrors] = useState<AuthErrors>({});

  const [busy, setBusy] = useState(false);
}

