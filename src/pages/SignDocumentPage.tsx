import { lazy, Suspense, useEffect, useState } from 'react';
import { Alert, Button, Card, Container, PageHeader } from '../components/ui';
import { LoadingState } from '../components/feedback';
import { PdfUpload } from '../components/pdf/PdfUpload';
import { useSession } from '../app/session';
import { signatureService } from '../services/signature.service';
import { sha256Hex } from '../utils/file-hash';
import { isPdfBlob } from '../utils/pdf-validation';
import { signErrorMessage, signedFileName } from '../utils/sign-errors';
import { SignResult } from '../components/pdf/SignResult';
import type { SealPosition } from '../utils/seal-position';

// pdf.js is heavy; load it only when a document is previewed.
const PdfPreview = lazy(() => import('../components/pdf/PdfPreview').then(module => ({ default: module.PdfPreview })));

type SendState = { kind: 'idle' } | { kind: 'sending'; progress: number } | { kind: 'done'; signed: Blob } | { kind: 'failed'; message: string };

export function SignDocumentPage() {
  const { user } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [seal, setSeal] = useState<SealPosition | null>(null);
  const [hash, setHash] = useState<{ file: File; value: string } | null>(null);
  const [state, setState] = useState<SendState>({ kind: 'idle' });

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    void sha256Hex(file).then(value => { if (!cancelled) setHash({ file, value }); });
    return () => { cancelled = true; };
  }, [file]);

  const [uploadKey, setUploadKey] = useState(0);

  function choose(next: File | null) { setFile(next); setSeal(null); setState({ kind: 'idle' }); }
  function reset() { choose(null); setUploadKey(key => key + 1); } // remount clears the file input
  // Moving the seal invalidates a previous result; ignored while a request is in flight.
  function placeSeal(next: SealPosition) { if (state.kind === 'sending') return; setSeal(next); setState({ kind: 'idle' }); }

  async function sign() {
    if (!file || !seal || state.kind === 'sending') return;
    setState({ kind: 'sending', progress: 0 });
    try {
      const response = await signatureService.sign(file, seal, progress => setState({ kind: 'sending', progress }));
      // Guards against an error page or JSON body being offered as the signed PDF.
      if (await isPdfBlob(response.data)) setState({ kind: 'done', signed: response.data });
      else setState({ kind: 'failed', message: 'O servidor não devolveu um PDF assinado válido.' });
    } catch (error) {
      setState({ kind: 'failed', message: signErrorMessage(error) });
    }
  }

  const signer = user?.name ?? 'Usuário autenticado';

  return (
    <Container className="page-card">
      <PageHeader eyebrow="Assinatura" title="Assinar documento" description="Selecione o PDF, posicione o selo e envie para assinatura." />
      <Card><PdfUpload key={uploadKey} onSelect={choose} /></Card>
      {file && (
        <div className="sign-layout">
          <Card className="pdf-card">
            <Suspense fallback={<LoadingState label="Carregando prévia…" />}>
              <PdfPreview key={`${file.name}-${file.size}-${file.lastModified}`} file={file} seal={seal} sealLabel={signer} onPlace={placeSeal} />
            </Suspense>
          </Card>
          <Card className="seal-summary">
            <h2>Dados do selo</h2>
            <dl>
              <dt>Assinante</dt><dd>{signer}</dd>
              <dt>Data e hora (UTC)</dt><dd>Registrada pelo servidor no momento da assinatura</dd>
              <dt>Hash SHA-256 do original</dt><dd className="hash">{hash?.file === file ? hash.value : 'Calculando…'}</dd>
              <dt>ID da assinatura</dt><dd>Gerado pelo servidor</dd>
              <dt>Posição</dt><dd>{seal ? `Página ${seal.page}, X ${seal.x} pt, Y ${seal.y} pt` : 'Clique na prévia para posicionar'}</dd>
            </dl>
            <p className="field-hint">O hash exibido é uma prévia calculada no navegador; o valor oficial é calculado pelo servidor.</p>
            {state.kind === 'failed' && <Alert tone="danger">{state.message}</Alert>}
            {state.kind === 'sending' && <div className="sign-progress" role="status"><progress max={100} value={state.progress} aria-label="Progresso do envio" /><span>{state.progress < 100 ? `Enviando… ${state.progress}%` : 'Assinando no servidor…'}</span></div>}
            {state.kind === 'done'
              ? <SignResult signed={state.signed} fileName={signedFileName(file.name)} onReset={reset} />
              : <Button onClick={() => void sign()} disabled={!seal || state.kind === 'sending'}>{state.kind === 'sending' ? 'Enviando…' : 'Assinar documento'}</Button>}
          </Card>
        </div>
      )}
    </Container>
  );
}
