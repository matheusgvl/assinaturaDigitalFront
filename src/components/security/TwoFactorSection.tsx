import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Badge, Button, Card, Input, Label } from '../ui';
import { useSession } from '../../app/session';
import { accountService } from '../../services/account.service';

export function TwoFactorSection({ onChanged }: { onChanged?: () => void } = {}) {
  const { user, signOut } = useSession();
  const [disabling, setDisabling] = useState(false);
  const [code, setCode] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const enabled = Boolean(user?.totpEnabled);

  async function disable(event: React.FormEvent) {
    event.preventDefault();
    if (!/^\d{6}$/.test(code) || !currentPassword || loading) return;
    setLoading(true); setError(null);
    try { await accountService.disableTotp({ currentPassword, code }); setDisabling(false); setCode(''); setCurrentPassword(''); onChanged?.(); await signOut(); } catch { setError('Não foi possível confirmar a senha e o código. A verificação em duas etapas continua ativa.'); } finally { setLoading(false); }
  }

  return (
    <Card className="account-section">
      <h2>Verificação em duas etapas {enabled ? <Badge tone="success">Ativa</Badge> : <Badge tone="danger">Inativa</Badge>}</h2>
      <p className="field-hint">Exige um código do aplicativo autenticador além da senha no login.</p>
      {!enabled && <Link className="button primary" to="/security/totp">Ativar verificação em duas etapas</Link>}
      {enabled && !disabling && <Button variant="ghost" onClick={() => setDisabling(true)}>Desativar</Button>}
      {enabled && disabling && (
        <form onSubmit={disable} className="totp-disable">
          <Alert tone="danger">Sem o segundo fator, sua conta fica protegida apenas pela senha. Confirme a senha atual e um código do aplicativo. A sessão será encerrada.</Alert>
          {error && <Alert tone="danger">{error}</Alert>}
          <div className="field"><Label htmlFor="disable-totp-password">Senha atual</Label><Input id="disable-totp-password" type="password" autoComplete="current-password" maxLength={256} value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} /></div>
          <div className="field"><Label htmlFor="disable-totp-code">Código do aplicativo</Label><Input id="disable-totp-code" inputMode="numeric" maxLength={6} autoComplete="one-time-code" value={code} onChange={event => setCode(event.target.value.replace(/\D/g, ''))} autoFocus /></div>
          <div className="confirm-row"><Button type="submit" disabled={!/^\d{6}$/.test(code) || !currentPassword || loading}>{loading ? 'Desativando…' : 'Confirmar desativação'}</Button><Button type="button" variant="ghost" onClick={() => { setDisabling(false); setCode(''); setCurrentPassword(''); setError(null); }}>Cancelar</Button></div>
        </form>
      )}
    </Card>
  );
}
