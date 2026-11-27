import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { browserSupportsWebAuthn, startAuthentication, WebAuthnAbortService } from '@simplewebauthn/browser';
import { useRedirectTarget, useSession } from '../../app/session';
import { webauthnService } from '../../services/webauthn.service';
import { Alert, Button } from '../ui';

/** Abre o autenticador e encaminha contas com TOTP para a segunda etapa. */
export function PasskeyLogin() {
  const navigate = useNavigate();
  const target = useRedirectTarget();
  const { signIn } = useSession();
  const [phase, setPhase] = useState<'idle' | 'request' | 'authenticator'>('idle');
  const [error, setError] = useState<string | null>(null);
  const supported = browserSupportsWebAuthn();

  async function login() {
    if (!supported || phase !== 'idle') return;
    setPhase('request');
    setError(null);
    try {
      const { data: { challengeId, options } } = await webauthnService.requestAuthenticationOptions();
      setPhase('authenticator');
      const credential = await startAuthentication({ optionsJSON: options });
      setPhase('request');
      const { data } = await webauthnService.confirmAuthentication(challengeId, credential);
      if ('requiresSecondFactor' in data) {
        navigate('/login/totp', { state: { transactionId: data.transactionId, from: target } });
      } else {
        await signIn(data.accessToken);
        navigate(target, { replace: true });
      }
    } catch (cause) {
      const cancelled = cause instanceof Error && ['AbortError', 'NotAllowedError', 'ERROR_CEREMONY_ABORTED'].includes(cause.name);
      setError(cancelled
        ? 'A autenticação foi cancelada ou não foi permitida pelo autenticador.'
        : 'Não foi possível autenticar com a passkey.');
    } finally {
      setPhase('idle');
    }
  }

  return (
    <div className="passkey-login">
      <div className="auth-divider"><span>ou</span></div>
      {error && <Alert tone="danger">{error}</Alert>}
      <Button variant="secondary" onClick={() => void login()} disabled={!supported || phase !== 'idle'}>
        {phase === 'idle' ? 'Entrar com passkey' : 'Aguardando autenticação…'}
      </Button>
      {phase === 'authenticator' &&
        <Button variant="ghost" onClick={() => WebAuthnAbortService.cancelCeremony()}>Cancelar</Button>}
      {!supported && <p className="field-error">Este navegador não oferece suporte a passkeys.</p>}
    </div>
  );
}
