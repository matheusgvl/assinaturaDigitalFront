import type { VerificationResponse } from '../../types/verification';
import { Alert } from '../ui';

const formatUtc = (iso?: string) => (iso && !Number.isNaN(Date.parse(iso)) ? `${new Date(iso).toISOString().replace('T', ' ').slice(0, 19)} UTC` : null);

export function VerificationResult({ result }: { result: VerificationResponse }) {
  if (result.status === 'tampered') {
    return (
      <div className="verify-result verify-tampered">
        <Alert tone="danger"><strong>Documento adulterado.</strong> Existe uma assinatura registrada, mas o conteúdo foi alterado depois de assinado.</Alert>
        <p>Não confie no conteúdo deste arquivo. Solicite ao remetente uma nova cópia do documento assinado.</p>
      </div>
    );
  }
  if (result.status === 'not_found') {
    return (
      <div className="verify-result verify-not-found">
        <Alert><strong>Assinatura não encontrada.</strong> Este PDF não contém uma assinatura digital reconhecida por este sistema.</Alert>
        <p>Um selo visual na página, sozinho, não comprova autenticidade.</p>
      </div>
    );
  }
  if (result.status !== 'valid') {
    return (
      <div className="verify-result verify-error">
        <Alert tone="danger"><strong>Resposta de verificação inválida.</strong> O servidor devolveu um estado desconhecido.</Alert>
      </div>
    );
  }
  const signedAt = formatUtc(result.signedAt);
  return (
    <div className="verify-result verify-valid">
      <Alert tone="success"><strong>Documento íntegro.</strong> A assinatura digital é válida e o conteúdo não foi alterado desde a assinatura.</Alert>
      <dl>
        {result.signer && <><dt>Assinante</dt><dd>{result.signer}</dd></>}
        {signedAt && <><dt>Assinado em</dt><dd>{signedAt}</dd></>}
        {result.signatureId && <><dt>ID da assinatura</dt><dd className="hash">{result.signatureId}</dd></>}
        {result.documentHash && <><dt>SHA-256 registrado</dt><dd className="hash">{result.documentHash}</dd></>}
      </dl>
    </div>
  );
}
