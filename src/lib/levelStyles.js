/* editorial-ui · Cristian Pérez · cristianperez.me */

/**
 * Color de cada nivel de robustez. Se mapea por `level.id` para que la lógica
 * de `analysis.js` no dependa de la paleta.
 */
export const LEVEL_COLORS = {
  weak: 'var(--color-weak)',
  moderate: 'var(--color-moderate)',
  strong: 'var(--color-strong)',
  excellent: 'var(--color-excellent)',
}

export const EMPTY_COLOR = 'var(--color-steel-500)'

export function levelColor(analysis) {
  if (!analysis || analysis.length === 0) return EMPTY_COLOR
  return LEVEL_COLORS[analysis.level.id] ?? EMPTY_COLOR
}
