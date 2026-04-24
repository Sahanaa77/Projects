
export type Point = { x: number; y: number };

export type Color = {
  name: string;
  value: string;
  glow: string;
};

export type BrushSize = 'small' | 'medium' | 'large';

export type EraserMode = 'normal' | 'large' | 'clear_all';

export type GestureType = 'SELECT' | 'DRAW' | 'PINCH' | 'NONE';

export interface Stroke {
  points: Point[];
  color: string;
  size: number;
  isNeon: boolean;
}

export const COLORS: Color[] = [
  { name: 'Red', value: '#FF0000', glow: '#FF5F5F' },
  { name: 'Orange', value: '#FFA500', glow: '#FFC85F' },
  { name: 'Yellow', value: '#FFFF00', glow: '#FFFF5F' },
  { name: 'Green', value: '#00FF00', glow: '#5FFF5F' },
  { name: 'Light Blue', value: '#00FFFF', glow: '#5FFFFF' },
  { name: 'Blue', value: '#0000FF', glow: '#5F5FFF' },
  { name: 'Purple', value: '#800080', glow: '#AF5FAF' },
  { name: 'Pink', value: '#FFC0CB', glow: '#FFD1DB' },
  { name: 'White', value: '#FFFFFF', glow: '#F0F0F0' },
  { name: 'Black', value: '#000000', glow: '#333333' },
];

export const BRUSH_SIZES: Record<BrushSize, number> = {
  small: 4,
  medium: 10,
  large: 20,
};
