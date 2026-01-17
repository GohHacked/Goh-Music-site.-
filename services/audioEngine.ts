import { EffectType } from '../types';

// Helper to write WAV header
const writeWavHeader = (samples: Float32Array, sampleRate: number, numChannels: number): DataView => {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // file length
  view.setUint32(4, 36 + samples.length * 2, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw)
  view.setUint16(20, 1, true);
  // channel count
  view.setUint16(22, numChannels, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate
  view.setUint32(28, sampleRate * 4, true);
  // block align
  view.setUint16(32, numChannels * 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, samples.length * 2, true);

  return view;
};

const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

const floatTo16BitPCM = (output: DataView, offset: number, input: Float32Array) => {
  for (let i = 0; i < input.length; i++, offset += 2) {
    // Simple limiter to prevent clipping
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
};

// Distortion curve generator
const makeDistortionCurve = (amount: number) => {
  const k = typeof amount === 'number' ? amount : 50;
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
};

export const processAudioFile = async (
  file: File,
  effect: EffectType,
  onProgress: (val: number) => void
): Promise<Blob> => {
  onProgress(5);
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  onProgress(15);
  const arrayBuffer = await file.arrayBuffer();
  onProgress(30);
  
  // Decoding can take time for large files
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  onProgress(40);

  // --- PRE-PROCESSING EFFECTS (Manipulate Buffer Directly) ---
  
  // REVERSE Logic
  if (effect === EffectType.REVERSE) {
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      Array.prototype.reverse.call(audioBuffer.getChannelData(i));
    }
  }

  // --- PARAMETER SETUP ---
  let playbackRate = 1.0;
  
  switch (effect) {
    case EffectType.SLOW_050: playbackRate = 0.5; break;
    case EffectType.SLOW_075: playbackRate = 0.75; break;
    case EffectType.SLOW_085: playbackRate = 0.85; break;
    case EffectType.SLOW_090: playbackRate = 0.9; break;
    case EffectType.FAST_110: playbackRate = 1.1; break;
    case EffectType.FAST_125: playbackRate = 1.25; break;
    case EffectType.FAST_150: playbackRate = 1.5; break;
    case EffectType.FAST_200: playbackRate = 2.0; break;
    case EffectType.NIGHTCORE: playbackRate = 1.25; break;
    default: playbackRate = 1.0; break;
  }

  // Calculate new duration
  const newLength = Math.ceil(audioBuffer.length / playbackRate);
  
  // For 8D we might need 2 channels even if input is mono
  const channels = effect === EffectType.EIGHT_D ? 2 : audioBuffer.numberOfChannels;

  // Create Offline Context
  const offlineCtx = new OfflineAudioContext(
    channels,
    newLength,
    audioBuffer.sampleRate
  );

  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.playbackRate.value = playbackRate;

  // Filter Chain
  let currentNode: AudioNode = source;

  // --- AUDIO NODES ---

  if (effect === EffectType.BASS_BOOST) {
    const filter = offlineCtx.createBiquadFilter();
    filter.type = 'lowshelf';
    filter.frequency.value = 200;
    filter.gain.value = 15;
    currentNode.connect(filter);
    currentNode = filter;
  } else if (effect === EffectType.TREBLE_BOOST) {
    const filter = offlineCtx.createBiquadFilter();
    filter.type = 'highshelf';
    filter.frequency.value = 2000;
    filter.gain.value = 12;
    currentNode.connect(filter);
    currentNode = filter;
  } else if (effect === EffectType.VOCAL_BOOST) {
    const filter = offlineCtx.createBiquadFilter();
    filter.type = 'peaking';
    filter.frequency.value = 1000;
    filter.Q.value = 1;
    filter.gain.value = 8;
    currentNode.connect(filter);
    currentNode = filter;
  } else if (effect === EffectType.LOFI) {
    // 1. Bandpass (Radio style)
    const lowPass = offlineCtx.createBiquadFilter();
    lowPass.type = 'lowpass';
    lowPass.frequency.value = 3500;
    
    const highPass = offlineCtx.createBiquadFilter();
    highPass.type = 'highpass';
    highPass.frequency.value = 300; // Removes deep bass

    // 2. Slight distortion
    const distortion = offlineCtx.createWaveShaper();
    distortion.curve = makeDistortionCurve(5);
    distortion.oversample = '4x';

    currentNode.connect(lowPass);
    lowPass.connect(highPass);
    highPass.connect(distortion);
    currentNode = distortion;

  } else if (effect === EffectType.DISTORTION) {
    const distortion = offlineCtx.createWaveShaper();
    distortion.curve = makeDistortionCurve(400); // Heavy distortion
    distortion.oversample = '4x';
    currentNode.connect(distortion);
    currentNode = distortion;

  } else if (effect === EffectType.ECHO) {
    const delay = offlineCtx.createDelay(1.0);
    delay.delayTime.value = 0.3; // 300ms delay

    const feedback = offlineCtx.createGain();
    feedback.gain.value = 0.4; // 40% decay

    const filter = offlineCtx.createBiquadFilter();
    filter.frequency.value = 1000; // Dampen repeats

    // Dry signal continues, Wet signal branches off
    // Source -> Split -> Destination
    //        -> Delay -> Feedback -> Filter -> Delay -> Destination
    
    // Simple wet/dry mix
    currentNode.connect(delay);
    delay.connect(feedback);
    feedback.connect(filter);
    filter.connect(delay);
    
    // We need to merge dry and wet. 
    // Since currentNode is already connected to next stage (or destination),
    // We just need to connect the delay output to the next stage too.
    // However, OfflineContext destination sums inputs.
    delay.connect(offlineCtx.destination);
    
  } else if (effect === EffectType.EIGHT_D) {
    // 8D Audio Simulation (Auto-Panner)
    const panner = offlineCtx.createStereoPanner();
    currentNode.connect(panner);
    currentNode = panner;

    // Automate panning: Left to Right oscillation
    const duration = newLength / audioBuffer.sampleRate;
    const panSpeed = 8; // Seconds per full circle
    const startTime = 0;
    
    // We can't use AudioParam.setValueCurveAtTime nicely with simple math in some browsers for Panner
    // So we loop and setValueAtTime
    const step = 0.1;
    for (let t = 0; t < duration; t += step) {
      // Sine wave from -1 to 1
      const panVal = Math.sin((t / panSpeed) * 2 * Math.PI);
      panner.pan.setValueAtTime(panVal, startTime + t);
    }
  }

  // Connect final node to destination (if not already handled by complex routing like Echo)
  if (effect !== EffectType.ECHO) {
    currentNode.connect(offlineCtx.destination);
  } else {
    // For Echo, we connected delay to destination manually, 
    // but we also need the original signal.
    currentNode.connect(offlineCtx.destination);
  }

  // Start logic
  source.start(0);

  onProgress(60);

  // Render
  const renderedBuffer = await offlineCtx.startRendering();
  
  onProgress(85);

  // Convert to WAV Blob
  const numChannels = renderedBuffer.numberOfChannels;
  const length = renderedBuffer.length;
  const sampleRate = renderedBuffer.sampleRate;
  
  const interleaved = new Float32Array(length * numChannels);
  
  for (let i = 0; i < numChannels; i++) {
    const channelData = renderedBuffer.getChannelData(i);
    for (let j = 0; j < length; j++) {
      interleaved[j * numChannels + i] = channelData[j];
    }
  }

  const wavDataView = writeWavHeader(interleaved, sampleRate, numChannels);
  floatTo16BitPCM(wavDataView, 44, interleaved);

  onProgress(100);

  return new Blob([wavDataView], { type: 'audio/wav' });
};