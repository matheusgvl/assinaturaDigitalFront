import { expect, test } from 'vitest';
import { SEAL_HEIGHT, SEAL_WIDTH, clampSeal, pdfToPercent, screenToPdf } from './seal-position';

const a4 = { width: 595, height: 842 };

test('converts a click at the top-left to PDF coordinates with bottom-left origin', () => {
  expect(screenToPdf(0, 0, { width: 595, height: 842 }, a4)).toEqual({ x: 0, y: 842 - SEAL_HEIGHT });
});

test('scales clicks from a rendered size different from the page size', () => {
  // Preview drawn at 2x: a click at (200, 400) is (100, 200) in points.
  expect(screenToPdf(200, 400, { width: 1190, height: 1684 }, a4)).toEqual({ x: 100, y: 842 - 200 - SEAL_HEIGHT });
});

test('keeps the seal inside the page', () => {
  expect(screenToPdf(595, 842, a4, a4)).toEqual({ x: 595 - SEAL_WIDTH, y: 0 });
  expect(clampSeal(-10, 9999, a4)).toEqual({ x: 0, y: 842 - SEAL_HEIGHT });
});

test('round-trips PDF coordinates to overlay percentages', () => {
  const box = pdfToPercent({ x: 0, y: 842 - SEAL_HEIGHT }, a4);
  expect(box.left).toBe(0);
  expect(box.top).toBe(0);
  expect(box.width).toBeCloseTo((SEAL_WIDTH / 595) * 100);
});
