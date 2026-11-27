import { useState } from 'react';
import { Button } from '../ui';

type ConfirmActionProps = { label: string; confirmLabel: string; question: string; onConfirm: () => Promise<void>; variant?: 'ghost' | 'primary' };

// Two-step action: the destructive request is only sent after an explicit confirmation.
export function ConfirmAction({ label, confirmLabel, question, onConfirm, variant = 'ghost' }: ConfirmActionProps) {
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    try { await onConfirm(); } finally { setBusy(false); setAsking(false); }
  }

  if (!asking) return <Button variant={variant} onClick={() => setAsking(true)}>{label}</Button>;
  return (
    <div className="confirm-action" role="group" aria-label={question}>
      <span>{question}</span>
      <Button variant="primary" onClick={() => void confirm()} disabled={busy} autoFocus>{busy ? 'Aguarde…' : confirmLabel}</Button>
      <Button variant="ghost" onClick={() => setAsking(false)} disabled={busy}>Cancelar</Button>
    </div>
  );
}
