import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Badge, Button, Card, Input, Label } from '../ui';
import { useSession } from '../../app/session';
import { accountService } from '../../services/account.service';

export function TwoFactorSection({ onChanged }: { onChanged?: () => void } = {}) {
  const { user, reload } = useSession();
  const [disabling, setDisabling] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const enabled = Boolean(user?.totpEnabled);

  async function disable(event: React.FormEvent) {
    event.preventDefault();
    if (!/^\d{6}$/.test(code) || loading) return;
    setLoading(true); setError(null);
    try { await accountService.disableTotp({ code }); setDisabling(false); setCode(''); await reload(); onChanged?.(); } catch { setError('O código não foi aceito. A verificação em duas etapas continua ativa.'); } finally { setLoading(false); }
  }

  return (
    <Card className="account-section">
      <h2>Verificação em duas etapas {enabled ? <Badge tone="success">Ativa</Badge> : <Badge tone="danger">Inativa</Badge>}</h2>
      <p className="field-hint">Exige um código do aplicativo autenticador além da senha no login.</p>
      {!enabled && <Link className="button primary" to="/security/totp">Ativar verificação em duas etapas</Link>}
      {enabled && !disabling && <Button variant="ghost" onClick={() => setDisabling(true)}>Desativar</Button>}
      {enabled && disabling && (
        <form onSubmit={disable} className="totp-disable">
          <Alert tone="danger">Sem o segundo fator, sua conta fica protegida apenas pela senha. Confirme com um código atual do aplicativo.</Alert>
          {error && <Alert tone="danger">{error}</Alert>}
          <div className="field"><Label htmlFor="disable-totp-code">Código do aplicativo</Label><Input id="disable-totp-code" inputMode="numeric" maxLength={6} autoComplete="one-time-code" value={code} onChange={event => setCode(event.target.value.replace(/\D/g, ''))} autoFocus /></div>
          <div className="confirm-row"><Button type="submit" disabled={!/^\d{6}$/.test(code) || loading}>{loading ? 'Desativando…' : 'Confirmar desativação'}</Button><Button type="button" variant="ghost" onClick={() => { setDisabling(false); setCode(''); setError(null); }}>Cancelar</Button></div>
        </form>
      )}
    </Card>
  );
}
