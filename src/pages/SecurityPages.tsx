import { useNavigate } from 'react-router-dom';
import { Alert, Badge, Button, Card, Container, Input, Label, PageHeader } from '../components/ui';
import { EmptyState, ErrorState, LoadingState } from '../components/feedback';
import { PasskeyRegistration } from '../components/auth/PasskeyRegistration';
import { ConfirmAction } from '../components/security/ConfirmAction';
import { useApiList } from '../hooks/useApiList';
import { useSession } from '../app/session';
import { securityService } from '../services/security.service';
import { useId, useState, type FormEvent } from 'react';
import { ChangePasswordForm } from '../components/security/ChangePasswordForm';
import { TwoFactorSection } from '../components/security/TwoFactorSection';
import { SecurityAlerts } from '../components/security/SecurityAlerts';
import type { PasskeyDevice } from '../types/security';

const formatDate = (iso?: string) => (iso && !Number.isNaN(Date.parse(iso)) ? new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—');

/** Pede confirmação de identidade antes de administrar o dispositivo selecionado. */
function PasskeyActions({ device, onChanged }: { device: PasskeyDevice; onChanged: () => Promise<void> }) {
  const [mode, setMode] = useState<'rename' | 'revoke' | null>(null);
  const [name, setName] = useState(device.name);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();

  function select(nextMode: 'rename' | 'revoke' | null) {
    setMode(nextMode);
    setPassword('');
    setName(device.name);
    setError(null);
  }

  async function confirm(event: FormEvent) {
    event.preventDefault();
    if (!mode || !password || busy || (mode === 'rename' && !name.trim())) return;
    setBusy(true);
    setError(null);
    setPassword('');
    try {
      if (mode === 'rename') await securityService.renamePasskey(device.id, name.trim(), password);
      else await securityService.revokePasskey(device.id, password);
      select(null);
      await onChanged();
    } catch {
      setError('Não foi possível atualizar a passkey. Confira a senha e a sessão.');
    } finally {
      setBusy(false);
    }
  }

  if (!mode) return (
    <div className="confirm-action">
      <Button variant="ghost" onClick={() => select('rename')}>Renomear</Button>
      <Button variant="ghost" onClick={() => select('revoke')}>Revogar</Button>
    </div>
  );

  return (
    <form className="confirm-action" onSubmit={confirm}>
      {mode === 'revoke' && <span>{`Revogar a passkey "${device.name}"?`}</span>}
      {mode === 'rename' && <div className="field">
        <Label htmlFor={`${inputId}-name`}>Nome do dispositivo</Label>
        <Input id={`${inputId}-name`} value={name} onChange={e => setName(e.target.value)} maxLength={100} required disabled={busy} />
      </div>}
      <div className="field">
        <Label htmlFor={`${inputId}-password`}>Confirme sua senha</Label>
        <Input id={`${inputId}-password`} type="password" autoComplete="current-password"
          value={password} onChange={e => setPassword(e.target.value)} maxLength={256} required disabled={busy} />
      </div>
      {error && <Alert tone="danger">{error}</Alert>}
      <Button type="submit" disabled={busy || !password || (mode === 'rename' && !name.trim())}>
        {busy ? 'Aguarde…' : mode === 'rename' ? 'Salvar nome' : 'Revogar'}
      </Button>
      <Button type="button" variant="ghost" disabled={busy} onClick={() => select(null)}>Cancelar</Button>
    </form>
  );
}

export function DevicesPage() {
  const { state, reload } = useApiList(securityService.listPasskeys);
  return (
    <Container className="page-card security-page">
      <PageHeader eyebrow="Segurança" title="Dispositivos" description="Passkeys vinculadas à sua conta. Revogue as que você não reconhece ou não usa mais." />
      <PasskeyRegistration onRegistered={() => void reload()} />
      <Card className="security-list">
        <h2>Passkeys registradas</h2>
        {state.status === 'loading' && <LoadingState label="Carregando dispositivos…" />}
        {state.status === 'error' && <ErrorState onRetry={() => void reload()} />}
        {state.status === 'ready' && state.items.length === 0 && <EmptyState title="Nenhuma passkey registrada" description="Registre uma passkey acima para entrar sem senha." />}
        {state.status === 'ready' && state.items.length > 0 && (
          <ul>
            {state.items.map(device => (
              <li key={device.id} className="security-item">
                <div>
                  <strong>{device.name}</strong>
                  <p>Registrada em {formatDate(device.createdAt)} · Último uso {formatDate(device.lastUsedAt)}</p>
                </div>
                <PasskeyActions device={device} onChanged={reload} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Container>
  );
}

export function SessionsPage() {
  const { state, reload } = useApiList(securityService.listSessions);
  const { signOut } = useSession();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  async function revoke(id: string) {
    setError(null);
    try { await securityService.revokeSession(id); await reload(); } catch { setError('Não foi possível encerrar a sessão. Tente novamente.'); }
  }

  async function revokeAll() {
    setError(null);
    try {
      await securityService.revokeAllSessions();
      // The current session is part of "all": finish it locally too.
      await signOut();
      navigate('/login', { replace: true });
    } catch { setError('Não foi possível encerrar as sessões. Tente novamente.'); }
  }

  return (
    <Container className="page-card">
      <PageHeader eyebrow="Segurança" title="Sessões ativas" description="Lugares onde sua conta está conectada. Encerre qualquer sessão que você não reconheça." />
      <Card className="security-list">
        {error && <Alert tone="danger">{error}</Alert>}
        {state.status === 'loading' && <LoadingState label="Carregando sessões…" />}
        {state.status === 'error' && <ErrorState onRetry={() => void reload()} />}
        {state.status === 'ready' && state.items.length === 0 && <EmptyState title="Nenhuma sessão encontrada" />}
        {state.status === 'ready' && state.items.length > 0 && (
          <>
            <ul>
              {state.items.map(session => (
                <li key={session.id} className="security-item">
                  <div>
                    <strong>{session.device ?? session.userAgent ?? 'Dispositivo desconhecido'}</strong> {session.current && <Badge tone="success">Esta sessão</Badge>}
                    <p>{session.ip ? `IP ${session.ip} · ` : ''}Iniciada em {formatDate(session.createdAt)} · Última atividade {formatDate(session.lastSeenAt)}</p>
                  </div>
                  {/* The current session ends through "Sair" so local state is cleared as well. */}
                  {!session.current && <ConfirmAction label="Encerrar" confirmLabel="Encerrar" question="Encerrar esta sessão?" onConfirm={() => revoke(session.id)} />}
                </li>
              ))}
            </ul>
            <div className="security-footer">
              <ConfirmAction variant="primary" label="Sair de todos os dispositivos" confirmLabel="Sair de todos" question="Encerrar todas as sessões, inclusive esta?" onConfirm={revokeAll} />
            </div>
          </>
        )}
      </Card>
    </Container>
  );
}

export function AccountSecurityPage() {
  // Sensitive changes generate new alerts on the server; remounting the list fetches them right away.
  const [alertsKey, setAlertsKey] = useState(0);
  const refreshAlerts = () => setAlertsKey(key => key + 1);
  return (
    <Container className="page-card security-page">
      <PageHeader eyebrow="Segurança" title="Segurança da conta" description="Senha, verificação em duas etapas e eventos recentes da sua conta." />
      <SecurityAlerts key={alertsKey} />
      <TwoFactorSection onChanged={refreshAlerts} />
      <ChangePasswordForm onChanged={refreshAlerts} />
    </Container>
  );
}
