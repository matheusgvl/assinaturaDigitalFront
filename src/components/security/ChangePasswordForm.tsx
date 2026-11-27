import { useMemo, useState } from 'react';
import axios from 'axios';
import { Alert, Button, Card, Input, Label } from '../ui';
import { PasswordCriteria } from '../auth/PasswordCriteria';
import { AuthFeedback } from '../auth/AuthFeedback';
import { validatePassword } from '../../utils/password-validation';
import { accountService } from '../../services/account.service';

export function ChangePasswordForm({ onChanged }: { onChanged?: () => void } = {}) {
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [done, setDone] = useState(false);
  const validation = useMemo(() => validatePassword(password, confirmation), [password, confirmation]);
  const sameAsCurrent = password.length > 0 && password === current;
  const valid = current.length > 0 && validation.valid && !sameAsCurrent;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!valid || loading) return;
    setLoading(true); setError(null); setDone(false);
    try {
      await accountService.changePassword({ currentPassword: current, newPassword: password });
      // Passwords never stay in memory after the request.
      setCurrent(''); setPassword(''); setConfirmation(''); setDone(true); onChanged?.();
    } catch (requestError) { setError(requestError); } finally { setLoading(false); }
  }

  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  const type = show ? 'text' : 'password';

  return (
    <Card className="account-section">
      <h2>Senha</h2>
      {done && <Alert tone="success">Senha alterada. Um alerta foi registrado na sua conta.</Alert>}
      {error ? (status === 400 || status === 401 || status === 422 ? <Alert tone="danger">Não foi possível alterar a senha. Confira a senha atual e tente novamente.</Alert> : <AuthFeedback error={error} />) : null}
      <form onSubmit={submit} noValidate>
        <div className="field"><Label htmlFor="current-password">Senha atual</Label><Input id="current-password" type={type} autoComplete="current-password" value={current} onChange={event => setCurrent(event.target.value)} /></div>
        <div className="field">
          <Label htmlFor="new-password">Nova senha</Label>
          <div className="password-input"><Input id="new-password" type={type} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} /><button type="button" className="password-toggle" onClick={() => setShow(!show)} aria-label={show ? 'Ocultar senhas' : 'Mostrar senhas'}>{show ? 'Ocultar' : 'Mostrar'}</button></div>
          <PasswordCriteria criteria={validation.criteria} />
          {sameAsCurrent && <span className="field-error">A nova senha deve ser diferente da atual.</span>}
        </div>
        <div className="field"><Label htmlFor="confirm-password">Confirmar nova senha</Label><Input id="confirm-password" type={type} autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} />{confirmation && !validation.criteria.matchesConfirmation && <span className="field-error">As senhas devem ser iguais.</span>}</div>
        <Button type="submit" disabled={!valid || loading}>{loading ? 'Alterando…' : 'Alterar senha'}</Button>
      </form>
    </Card>
  );
}
