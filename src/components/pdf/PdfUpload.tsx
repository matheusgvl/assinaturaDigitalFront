import { useState } from 'react';
import { validatePdf } from '../../utils/pdf-validation';
import { Alert, Label } from '../ui';

type PdfUploadProps = { onSelect: (file: File | null) => void };

export function PdfUpload({ onSelect }: PdfUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError(null);
    onSelect(null);
    if (!file) return;
    setChecking(true);
    const problem = await validatePdf(file);
    setChecking(false);
    if (problem) {
      setError(problem);
      event.target.value = '';
      return;
    }
    onSelect(file);
  }

  return (
    <div className="pdf-upload">
      <Label htmlFor="pdf-file">Documento PDF</Label>
      <input id="pdf-file" className="input" type="file" accept="application/pdf,.pdf" onChange={handleChange} aria-describedby="pdf-file-hint" disabled={checking} />
      <p id="pdf-file-hint" className="field-hint">Apenas PDF, até 20 MB. O arquivo fica só na memória desta página.</p>
      {error && <Alert tone="danger">{error}</Alert>}
    </div>
  );
}
