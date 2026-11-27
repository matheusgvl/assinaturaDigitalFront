import { useEffect, useRef, useState } from 'react';
import { GlobalWorkerOptions, getDocument, type PDFDocumentLoadingTask, type PDFDocumentProxy, type RenderTask } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Button } from '../ui';
import { ErrorState, LoadingState } from '../feedback';

GlobalWorkerOptions.workerSrc = workerUrl;

// Pages are drawn to a canvas: embedded scripts, forms and links in the PDF never run or become clickable.
export function PdfPreview({ file }: { file: File }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [failed, setFailed] = useState(false);

  // The parent remounts this component (key) for each new file, so state starts clean.
  useEffect(() => {
    let cancelled = false;
    let loadTask: PDFDocumentLoadingTask | null = null;
    void file.arrayBuffer().then(data => {
      if (cancelled) return;
      loadTask = getDocument({ data, enableXfa: false });
      return loadTask.promise.then(loaded => { if (!cancelled) setDoc(loaded); }, () => { if (!cancelled) setFailed(true); });
    });
    // destroy() frees the worker copy of the document when the file changes or the page closes.
    return () => { cancelled = true; void loadTask?.destroy(); };
  }, [file]);

  useEffect(() => {
    if (!doc || !canvasRef.current) return;
    const canvas = canvasRef.current;
    let render: RenderTask | null = null;
    let cancelled = false;
    void doc.getPage(page).then(pdfPage => {
      if (cancelled) return;
      const viewport = pdfPage.getViewport({ scale: 1.5 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      render = pdfPage.render({ canvas, viewport });
      render.promise.catch(() => undefined); // cancelled renders reject; nothing to report
    });
    return () => { cancelled = true; render?.cancel(); };
  }, [doc, page]);

  if (failed) return <ErrorState />;
  if (!doc) return <LoadingState label="Carregando prévia…" />;

  return (
    <div className="pdf-preview">
      <div className="pdf-toolbar">
        <Button variant="ghost" onClick={() => setPage(page - 1)} disabled={page <= 1}>Anterior</Button>
        <span aria-live="polite">Página {page} de {doc.numPages}</span>
        <Button variant="ghost" onClick={() => setPage(page + 1)} disabled={page >= doc.numPages}>Próxima</Button>
      </div>
      <canvas ref={canvasRef} className="pdf-canvas" aria-label={`Prévia da página ${page} do documento`} role="img" />
    </div>
  );
}
