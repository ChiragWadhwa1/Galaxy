
export enum ParticleMode {
  ORBIT = 'orbit',
  FLOW = 'flow',
  VORTEX = 'vortex',
  CHAOS = 'chaos',
  EXPAND = 'expand',
  GALAXY = 'galaxy'
}

export interface ParticleParams {
  color1: string;
  color2: string;
  size: number;
  speed: number;
  count: number;
  mode: ParticleMode;
  complexity: number;
  brightness: number;
}

export interface InteractionPoint {
  x: number;
  y: number;
  z: number;
  active: boolean;
}

export interface AppState {
  params: ParticleParams;
  isProcessing: boolean;
  history: string[];
  error: string | null;
}
