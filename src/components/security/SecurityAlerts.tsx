import { useState } from 'react';
import { Alert, Badge, Button, Card } from '../ui';
import { EmptyState, ErrorState, LoadingState } from '../feedback';
import { useApiList } from '../../hooks/useApiList';
import { accountService } from '../../services/account.service';
import type { SecurityAlert } from '../../types/security';

const titles: Record<string, string> = {
  new_ip: 'Acesso de um novo endereço IP',
  password_changed: 'Senha alterada',
  totp_enabled: 'Verificação em duas etapas ativada',
  totp_disabled: 'Verificação em duas etapas desativada',
  invalid_totp: 'Códigos de verificação inválidos',
};

const formatDate = (iso: string) => (Number.isNaN(Date.parse(iso)) ? '—' : new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }));
// Only whitelisted, non-secret fields are rendered; the server's event type is kept visible when unknown.
const describe = (alert: SecurityAlert) => titles[alert.type] ?? `Evento de segurança (${alert.type})`;

export function SecurityAlerts() {
  const { state, reload } = useApiList(accountService.listAlerts);
  const [error, setError] = useState<string | null>(null);
  const unread = state.status === 'ready' ? state.items.filter(alert => !alert.read) : [];

  async function markAllRead() {
    setError(null);
    try { await accountService.markAlertsRead(unread.map(alert => alert.id)); await reload(); } catch { setError('Não foi possível marcar os alertas como lidos.'); }
  }

  return (
    <Card className="account-section">
      <div className="section-heading">
        <h2>Alertas de segurança {unread.length > 0 && <Badge tone="danger">{unread.length} {unread.length === 1 ? 'novo' : 'novos'}</Badge>}</h2>
        {unread.length > 0 && <Button variant="ghost" onClick={() => void markAllRead()}>Marcar como lidos</Button>}
      </div>
      {error && <Alert tone="danger">{error}</Alert>}
      {state.status === 'loading' && <LoadingState label="Carregando alertas…" />}
      {state.status === 'error' && <ErrorState onRetry={() => void reload()} />}
      {state.status === 'ready' && state.items.length === 0 && <EmptyState title="Nenhum alerta" description="Eventos importantes da sua conta aparecerão aqui." />}
      {state.status === 'ready' && state.items.length > 0 && (
        <ul className="alert-list">
          {state.items.map(alert => (
            <li key={alert.id} className={alert.read ? 'alert-item' : 'alert-item alert-unread'}>
              <div>
                <strong>{describe(alert)}</strong> {!alert.read && <Badge tone="info">Novo</Badge>}
                <p>{formatDate(alert.createdAt)}{alert.ip ? ` · IP ${alert.ip}` : ''}{alert.device ? ` · ${alert.device}` : ''}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
