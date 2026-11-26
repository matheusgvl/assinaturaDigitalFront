import { useEffect, useState } from 'react';
import { Alert, Button } from '../ui';
import { sha256Hex } from '../../utils/file-hash';

type SignResultProps = { signed: Blob; fileName: string; onReset: () => void };

// Offers only the bytes returned by the API; nothing is rebuilt or overlaid in the browser.
export function SignResult({ signed, fileName, onReset }: SignResultProps) {
  const [hash, setHash] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void sha256Hex(signed).then(value => { if (!cancelled) setHash(value); });
    return () => { cancelled = true; };
  }, [signed]);

  // The temporary URL lives only for the click; same pattern as the recovery codes download.
  function download() {
    const url = URL.createObjectURL(signed);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <div className="sign-result">
      <Alert tone="success">Documento assinado pelo servidor.</Alert>
      <dl>
        <dt>Arquivo</dt><dd>{fileName}</dd>
        <dt>Tamanho</dt><dd>{(signed.size / 1024).toFixed(1)} KB</dd>
        <dt>SHA-256 do assinado</dt><dd className="hash">{hash ?? 'Calculando…'}</dd>
      </dl>
      <div className="sign-result-actions">
        <Button onClick={download}>Baixar PDF assinado</Button>
        <Button variant="ghost" onClick={onReset}>Assinar outro documento</Button>
      </div>
    </div>
  );
}
