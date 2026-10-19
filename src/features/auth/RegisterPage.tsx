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

  const set = (key: keyof typeof values) => (value: string) => setValues((v) => ({ ...v, [key]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    const found = onlyErrors({
      document: documentError(values.document),
      name: nameError(values.name),
      password: passwordError(values.password),
      pin: pinError(values.pin),
    });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    try {
      await facade.signUp(
        { document: values.document.trim(), name: values.name.trim(), password: values.password },
        values.pin,
      );
    } catch (error) {
      setErrors({ form: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  }
}

