import { useState } from 'react';
import { Alert, Button, Card, Container, PageHeader } from '../components/ui';
import { PdfUpload } from '../components/pdf/PdfUpload';
import { VerificationResult } from '../components/verify/VerificationResult';
import { verificationService } from '../services/verification.service';
import { verifyErrorMessage } from '../utils/sign-errors';
import type { VerificationResponse } from '../types/verification';

type VerifyState = { kind: 'idle' } | { kind: 'sending'; progress: number } | { kind: 'done'; result: VerificationResponse; fileName: string } | { kind: 'failed'; message: string };

const KNOWN_STATUSES = ['valid', 'tampered', 'not_found'];

export function VerifyDocumentPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadKey, setUploadKey] = useState(0);
  const [state, setState] = useState<VerifyState>({ kind: 'idle' });

  function choose(next: File | null) { setFile(next); if (next) setState({ kind: 'idle' }); }

  async function verify() {
    if (!file || state.kind === 'sending') return;
    setState({ kind: 'sending', progress: 0 });
    try {
      const { data } = await verificationService.verify(file, progress => setState({ kind: 'sending', progress }));
      // An unexpected answer must never be presented as a valid signature.
      if (!KNOWN_STATUSES.includes(data?.status)) { setState({ kind: 'failed', message: 'O servidor devolveu uma resposta inesperada. Tente novamente.' }); return; }
      setState({ kind: 'done', result: data, fileName: file.name });
      // The file is no longer needed: drop the reference and clear the input.
      setFile(null);
      setUploadKey(key => key + 1);
    } catch (error) {
      setState({ kind: 'failed', message: verifyErrorMessage(error) });
    }
  }

  return (
    <Container className="page-card">
      <PageHeader eyebrow="Verificação pública" title="Verificar documento" description="Confira se um PDF foi assinado neste sistema e se o conteúdo continua íntegro. Não é preciso ter conta." />
      <Card>
        <PdfUpload key={uploadKey} onSelect={choose} />
        <p className="field-hint">O arquivo é enviado apenas para a verificação e descartado pelo servidor logo em seguida.</p>
        {state.kind === 'failed' && <Alert tone="danger">{state.message}</Alert>}
        {state.kind === 'sending' && <div className="sign-progress" role="status"><progress max={100} value={state.progress} aria-label="Progresso do envio" /><span>{state.progress < 100 ? `Enviando… ${state.progress}%` : 'Verificando assinatura…'}</span></div>}
        <Button onClick={() => void verify()} disabled={!file || state.kind === 'sending'}>{state.kind === 'sending' ? 'Verificando…' : 'Verificar documento'}</Button>
      </Card>
      {state.kind === 'done' && (
        <Card className="verify-card" >
          <h2>Resultado</h2>
          <p className="field-hint">Arquivo verificado: {state.fileName}</p>
          <div aria-live="polite"><VerificationResult result={state.result} /></div>
        </Card>
      )}
    </Container>
  );
}
