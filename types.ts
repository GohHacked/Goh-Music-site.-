export enum EffectType {
  SLOW_050 = 'Slow 0.5x',
  SLOW_075 = 'Slow 0.75x',
  SLOW_085 = 'Slow 0.85x',
  SLOW_090 = 'Slow 0.9x',
  FAST_110 = 'Fast 1.1x',
  FAST_125 = 'Fast 1.25x',
  FAST_150 = 'Fast 1.5x',
  FAST_200 = 'Fast 2.0x',
  BASS_BOOST = 'Bass Boost',
  TREBLE_BOOST = 'Treble Boost',
  VOCAL_BOOST = 'Vocal Boost',
  EIGHT_D = '8D Audio',
  REVERSE = 'Reverse',
  ECHO = 'Echo / Delay',
  LOFI = 'Lo-Fi Radio',
  DISTORTION = 'Distortion',
  NIGHTCORE = 'Nightcore',
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  error: string | null;
  isComplete: boolean;
}

export interface ProcessedResult {
  blob: Blob;
  url: string;
  duration: number;
}