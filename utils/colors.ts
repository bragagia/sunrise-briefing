import Color from 'color';

const COLOR_MAP = [
  '#6C3938',
  '#C84727',
  '#B05F0D',
  '#E57716',
  '#F5A125',
  '#DFB583',
  '#F4D4A3',
  '#ABD9E8',
  '#23ADD9',
];

export const getParagraphBgColorFromPosition = (position: number) => {
  const color = Color(COLOR_MAP[position % COLOR_MAP.length]);

  return color.fade(0.8);
};
