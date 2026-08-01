export type AppState =
  | 'IDLE'
  | 'SETUP'
  | 'COUNTDOWN'
  | 'CAPTURE'
  | 'BETWEEN_SHOTS'
  | 'REVIEW'
  | 'EXPORT'
  | 'COOP_SETUP';

export type CountdownState = 'WAITING' | 'COUNTING' | 'FLASH' | 'CAPTURED';

export interface LayoutConfig {
  cols: number;
  rows: number;
  frameWidth: number;
  frameHeight: number;
  gap: number;
  padding: number;
  borderRadius: number;
  canvasWidth: number;
  canvasHeight: number;
}

export type FilterId =
  | 'none'
  | 'soft'
  | 'vivid'
  | 'vintage'
  | 'noir'
  | 'dreamy'
  | 'golden'
  | 'cool'
  | 'y2k';

export interface FilterPreset {
  id: FilterId;
  name: string;
  css: string;
}

export type BackgroundType = 'holographic' | 'lace' | 'mint' | 'starry' | 'custom';

export interface BackgroundConfig {
  type: BackgroundType;
  color?: string;
}

export interface Sticker {
  id: string;
  name: string;
  svg: string;
  src: string;
  xPercent: number; // 0 to 100%
  yPercent: number; // 0 to 100%
  scale: number;
  rotation: number;
}

export interface FrameItem {
  id: string;
  dataUrl: string;
  bitmap?: ImageBitmap;
  mirrored: boolean;
  isBlank: boolean;
  owner?: 'host' | 'guest';
}

export type OverlayFont = 'Caveat' | 'Playfair Display' | 'Space Mono';

export interface StripMeta {
  date: string;
  label?: string;
  font: OverlayFont;
  textColor: string;
}

export interface CoOpRoom {
  code: string;
  isHost: boolean;
  connected: boolean;
  playerIndex: number; // 0 to 5 (Player #1 to #6)
  maxPlayers: number;  // 2 to 6
  peerCount: number;   // number of other connected peers
  myTurn: boolean;
}
