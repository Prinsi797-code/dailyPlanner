// export const PRIMARY = '#ff6d33';

export const ACCENT_COLORS = [
  '#a2855e',
  '#ff8177',
  '#a18cd1',
  '#f53b30',
  '#667eea',
  '#fccd00',
  '#0394fc',
  '#532687',
  '#266087',
  '#268762',
  '#877a26',
  '#876026',
  '#872c26',
  '#0c6366',
  '#0c2766',
  '#f785a3',
  '#ca86ff',
  '#FFA155',
  '#4f9ce2',
  '#f66d6e',
];

export const DEFAULT_ACCENT = ACCENT_COLORS[1];
export const DARK_BACKGROUND_IMAGE = require('../assets/img/bg.jpeg');
export const LIGHT_BACKGROUND_IMAGE = require('../assets/img/light.jpeg');


export const getLightColors = (primary: string) => ({
  primary,
  background: '#FAFAFA',
  card: '#FFFFFF',
  text: '#1A1A1A',
  subText: '#6f6f6f',
  border: '#EEEEEE',
  tabBar: '#FFFFFF',
  tabInactive: '#9A9A9A',
  placeholder: '#BBBBBB',
  backgroundColor: '#F5F5F5',
});

export const getDarkColors = (primary: string) => ({
  primary,
  background: '#121212',
  card: '#121212',
  text: '#F5F5F5',
  subText: '#AAAAAA',
  border: '#2C2C2C',
  tabBar: '#101010',
  tabInactive: '#777777',
  placeholder: '#555555',
  backgroundColor: '#1E1E1E',
});

export type ThemeColors = ReturnType<typeof getLightColors>;