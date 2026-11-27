// Seal size in PDF points (1 pt = 1/72 inch); the backend must draw the seal with the same box.
export const SEAL_WIDTH = 180;
export const SEAL_HEIGHT = 60;

export type PageSize = { width: number; height: number };
// x/y: lower-left corner of the seal in PDF user space (origin at the bottom-left of the page).
export type SealPosition = { page: number; x: number; y: number };

const clamp = (value: number, max: number) => Math.round(Math.min(Math.max(value, 0), Math.max(max, 0)));

/** Mantem o retangulo do selo dentro da pagina PDF. */
export function clampSeal(x: number, y: number, size: PageSize) {
  return { x: clamp(x, size.width - SEAL_WIDTH), y: clamp(y, size.height - SEAL_HEIGHT) };
}

// A click marks the seal's top-left corner; screen Y grows downward while PDF Y grows upward.
/** Converte coordenadas da tela, com origem no topo, para o espaco PDF. */
export function screenToPdf(clickX: number, clickY: number, rendered: PageSize, page: PageSize) {
  const x = (clickX / rendered.width) * page.width;
  const top = (clickY / rendered.height) * page.height;
  return clampSeal(x, page.height - top - SEAL_HEIGHT, page);
}

// Inverse conversion, as percentages, to draw the seal over the preview at any zoom.
/** Converte pontos PDF para percentuais usados na sobreposicao visual do selo. */
export function pdfToPercent(position: Pick<SealPosition, 'x' | 'y'>, page: PageSize) {
  return {
    left: (position.x / page.width) * 100,
    top: ((page.height - position.y - SEAL_HEIGHT) / page.height) * 100,
    width: (SEAL_WIDTH / page.width) * 100,
    height: (SEAL_HEIGHT / page.height) * 100,
  };
}
