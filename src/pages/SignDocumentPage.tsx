import { lazy, Suspense, useEffect, useState } from 'react';
import { Alert, Button, Card, Container, PageHeader } from '../components/ui';
import { LoadingState } from '../components/feedback';
import { PdfUpload } from '../components/pdf/PdfUpload';
import { useSession } from '../app/session';
import { signatureService } from '../services/signature.service';
import { sha256Hex } from '../utils/file-hash';
import type { SealPosition } from '../utils/seal-position';

// pdf.js is heavy; load it only when a document is previewed.
const PdfPreview = lazy(() => import('../components/pdf/PdfPreview').then(module => ({ default: module.PdfPreview })));

type SendState = 'idle' | 'sending' | 'done' | 'failed';

export function SignDocumentPage() {
  const { user } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [seal, setSeal] = useState<SealPosition | null>(null);
  const [hash, setHash] = useState<{ file: File; value: string } | null>(null);
  const [state, setState] = useState<SendState>('idle');

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    void sha256Hex(file).then(value => { if (!cancelled) setHash({ file, value }); });
    return () => { cancelled = true; };
  }, [file]);

  function choose(next: File | null) { setFile(next); setSeal(null); setState('idle'); }

  async function sign() {
    if (!file || !seal || state === 'sending') return;
    setState('sending');
    try { await signatureService.sign(file, seal); setState('done'); } catch { setState('failed'); }
  }

  const signer = user?.name ?? 'Usuário autenticado';

  return (
    <Container className="page-card">
      <PageHeader eyebrow="Assinatura" title="Assinar documento" description="Selecione o PDF, posicione o selo e envie para assinatura." />
      <Card><PdfUpload onSelect={choose} /></Card>
      {file && (
        <div className="sign-layout">
          <Card className="pdf-card">
            <Suspense fallback={<LoadingState label="Carregando prévia…" />}>
              <PdfPreview key={`${file.name}-${file.size}-${file.lastModified}`} file={file} seal={seal} sealLabel={signer} onPlace={setSeal} />
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
            {state === 'failed' && <Alert tone="danger">Não foi possível assinar o documento. Tente novamente.</Alert>}
            {state === 'done' && <Alert tone="success">Documento enviado e assinado pelo servidor.</Alert>}
            <Button onClick={() => void sign()} disabled={!seal || state === 'sending'}>{state === 'sending' ? 'Enviando…' : 'Assinar documento'}</Button>
          </Card>
        </div>
      )}
    </Container>
  );
}
