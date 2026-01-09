
import { ParticleParams, ParticleMode } from './types';

export const DEFAULT_PARAMS: ParticleParams = {
  color1: '#0011ff',
  color2: '#00ccff',
  size: 0.05,
  speed: 1.0,
  count: 50000,
  mode: ParticleMode.GALAXY,
  complexity: 0.5,
  brightness: 1.0
};

export const MAX_PARTICLES = 100000;
