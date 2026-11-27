import { useState, type FormEvent } from 'react';
import { browserSupportsWebAuthn, startRegistration, WebAuthnAbortService } from '@simplewebauthn/browser';
import { webauthnService } from '../../services/webauthn.service';
import { Alert, Button, Card, Input, Label, PageHeader } from '../ui';

/** Confirma a senha da conta antes de iniciar o cadastro no autenticador. */
export function PasskeyRegistration({ onRegistered }: { onRegistered?: () => void } = {}) {
  const [password, setPassword] = useState('');
  const [phase, setPhase] = useState<'idle' | 'request' | 'authenticator'>('idle');
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supported = browserSupportsWebAuthn();

  async function register(event: FormEvent) {
    event.preventDefault();
    if (!supported || !password || phase !== 'idle') return;
    setPhase('request');
    setError(null);
    setRegistered(false);
    setPassword('');
    try {
      const { data: { challengeId, options } } = await webauthnService.requestRegistrationOptions(password);
      setPhase('authenticator');
      const credential = await startRegistration({ optionsJSON: options });
      setPhase('request');
      await webauthnService.confirmRegistration(challengeId, credential);
      setRegistered(true);
      onRegistered?.();
    } catch (cause) {
      const cancelled = cause instanceof Error && ['AbortError', 'NotAllowedError', 'ERROR_CEREMONY_ABORTED'].includes(cause.name);
      setError(cancelled
        ? 'O registro foi cancelado ou não foi permitido pelo autenticador.'
        : 'Não foi possível registrar a passkey. Confira a senha e a sessão.');
    } finally {
      setPhase('idle');
    }
  }

  return (
    <Card className="auth-card">
      <PageHeader eyebrow="Acesso sem senha" title="Registrar uma passkey" description="Use biometria, PIN ou chave de segurança para entrar." />
      {!supported && <Alert tone="danger">Este navegador não oferece suporte a passkeys.</Alert>}
      {registered && <Alert tone="success">Passkey registrada.</Alert>}
      {error && <Alert tone="danger">{error}</Alert>}
      <form onSubmit={register}>
        <div className="field">
          <Label htmlFor="passkey-registration-password">Senha atual</Label>
          <Input id="passkey-registration-password" type="password" autoComplete="current-password"
            value={password} onChange={(event) => setPassword(event.target.value)}
            disabled={!supported || phase !== 'idle'} required maxLength={256} />
        </div>
        <Button type="submit" disabled={!supported || !password || phase !== 'idle'}>
          {phase === 'idle' ? 'Registrar passkey' : 'Aguardando autenticação…'}
        </Button>
        {phase === 'authenticator' &&
          <Button type="button" variant="ghost" onClick={() => WebAuthnAbortService.cancelCeremony()}>Cancelar</Button>}
      </form>
      <p className="auth-link">A chave privada permanece no seu autenticador.</p>
    </Card>
  );
}
