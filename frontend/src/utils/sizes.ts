import type { ItemSize, MenuItem, SizeLabels } from '../types';

export const ITEM_SIZES: ItemSize[] = ['small', 'medium', 'large'];

export const DEFAULT_SIZE_LABELS: SizeLabels = {
  small: 'E vogël',
  medium: 'E mesme',
  large: 'E madhe',
};

// Each sized item can name its sizes (espresso: E shkurtër / E mesme / E gjatë).
export const sizeLabelsFor = (item: Pick<MenuItem, 'sizeLabels'>): SizeLabels =>
  item.sizeLabels ?? DEFAULT_SIZE_LABELS;

// "Espresso – E gjatë" for sized items, the plain name otherwise.
export const nameWithSize = (name: string, size?: ItemSize | null, sizeLabel?: string | null) =>
  size ? `${name} – ${sizeLabel || DEFAULT_SIZE_LABELS[size]}` : name;

// Cart lines are unique per item + size, so two espresso sizes are separate lines.
export const cartKey = (item: { menuItemId: string; size?: ItemSize | null }) =>
  item.size ? `${item.menuItemId}:${item.size}` : item.menuItemId;
