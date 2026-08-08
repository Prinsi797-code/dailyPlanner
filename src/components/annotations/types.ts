export type TextElement = {
  id: string;
  type: 'text';
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
};

export type DrawStroke = {
  id: string;
  type: 'draw';
  color: string;
  strokeWidth: number;
  points: { x: number; y: number }[];
};

export type ImageElement = {
  id: string;
  type: 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  uri: string;
};

export type AnnotationElement = TextElement | DrawStroke | ImageElement;

export type ToolMode = 'none' | 'text' | 'draw';