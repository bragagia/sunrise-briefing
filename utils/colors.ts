import Color from 'color';

const COLOR_MAP = [
  '#6C3938',
  '#C84727',
  '#B05F0D',
  '#E57716',
  '#F5A125',
  '#DFB583',
  '#F4D4A3',
];

// Unused first blue : '#ABD9E8',

const LAST_COLOR = '#23ADD9';

export const getParagraphBgColorFromPosition = (
  position: number,
  isLast: boolean
) => {
  var color = Color(LAST_COLOR);

  if (!isLast) {
    color = Color(COLOR_MAP[position % COLOR_MAP.length]);
  }

  return color.fade(0.8);
};
