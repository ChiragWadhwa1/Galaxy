
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

export interface AppState {
  params: ParticleParams;
  isProcessing: boolean;
  history: string[];
  error: string | null;
}
