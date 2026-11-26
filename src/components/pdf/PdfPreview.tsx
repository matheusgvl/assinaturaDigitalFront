import { useEffect, useRef, useState } from 'react';
import { GlobalWorkerOptions, getDocument, type PDFDocumentLoadingTask, type PDFDocumentProxy, type RenderTask } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Button } from '../ui';
import { ErrorState, LoadingState } from '../feedback';
import { clampSeal, pdfToPercent, screenToPdf, type PageSize, type SealPosition } from '../../utils/seal-position';

GlobalWorkerOptions.workerSrc = workerUrl;

const KEY_STEP = 5;
const keyMoves: Record<string, [number, number]> = { ArrowLeft: [-KEY_STEP, 0], ArrowRight: [KEY_STEP, 0], ArrowUp: [0, KEY_STEP], ArrowDown: [0, -KEY_STEP] };

type PdfPreviewProps = { file: File; seal: SealPosition | null; sealLabel: string; onPlace: (seal: SealPosition) => void };

// Pages are drawn to a canvas: embedded scripts, forms and links in the PDF never run or become clickable.
export function PdfPreview({ file, seal, sealLabel, onPlace }: PdfPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize | null>(null);
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
      // shortcut: uses the displayed (rotated) page box; pages with /Rotate need backend agreement on the coordinate space.
      const base = pdfPage.getViewport({ scale: 1 });
      setPageSize({ width: base.width, height: base.height });
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

  function place(event: React.MouseEvent<HTMLDivElement>) {
    if (!pageSize) return;
    const rect = event.currentTarget.getBoundingClientRect();
    onPlace({ page, ...screenToPdf(event.clientX - rect.left, event.clientY - rect.top, { width: rect.width, height: rect.height }, pageSize) });
  }

  function nudge(event: React.KeyboardEvent) {
    const move = keyMoves[event.key];
    if (!move || !seal || !pageSize) return;
    event.preventDefault();
    onPlace({ page: seal.page, ...clampSeal(seal.x + move[0], seal.y + move[1], pageSize) });
  }

  const box = seal && pageSize && seal.page === page ? pdfToPercent(seal, pageSize) : null;

  return (
    <div className="pdf-preview">
      <div className="pdf-toolbar">
        <Button variant="ghost" onClick={() => setPage(page - 1)} disabled={page <= 1}>Anterior</Button>
        <span aria-live="polite">Página {page} de {doc.numPages}</span>
        <Button variant="ghost" onClick={() => setPage(page + 1)} disabled={page >= doc.numPages}>Próxima</Button>
      </div>
      <p className="field-hint pdf-instructions">Clique na página para posicionar o selo. Com o selo selecionado, use as setas do teclado para ajustar.</p>
      <div className="pdf-stage" onClick={place}>
        <canvas ref={canvasRef} className="pdf-canvas" aria-label={`Prévia da página ${page} do documento`} role="img" />
        {box && (
          <button type="button" className="seal-box" style={{ left: `${box.left}%`, top: `${box.top}%`, width: `${box.width}%`, height: `${box.height}%` }} onClick={event => event.stopPropagation()} onKeyDown={nudge} aria-label={`Selo na página ${seal!.page}, X ${seal!.x}, Y ${seal!.y}. Use as setas para mover.`}>
            {sealLabel}
          </button>
        )}
      </div>
    </div>
  );
}
