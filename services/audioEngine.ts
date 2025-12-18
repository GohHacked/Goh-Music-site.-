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
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * 4, true); // 32-bit float? No, we convert to 16-bit PCM
  // block align (channel count * bytes per sample)
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
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
};

export const processAudioFile = async (
  file: File,
  effect: EffectType,
  onProgress: (val: number) => void
): Promise<Blob> => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // Calculate new duration and parameters based on effect
  let playbackRate = 1.0;
  let pitchShift = 0; // Cents
  
  switch (effect) {
    case EffectType.SLOW_050: playbackRate = 0.5; break;
    case EffectType.SLOW_075: playbackRate = 0.75; break;
    case EffectType.SLOW_085: playbackRate = 0.85; break;
    case EffectType.SLOW_090: playbackRate = 0.9; break;
    case EffectType.FAST_110: playbackRate = 1.1; break;
    case EffectType.FAST_125: playbackRate = 1.25; break;
    case EffectType.FAST_150: playbackRate = 1.5; break;
    case EffectType.FAST_200: playbackRate = 2.0; break;
    case EffectType.NIGHTCORE: playbackRate = 1.25; pitchShift = 0; break; // Nightcore naturally pitches up via speed
    default: playbackRate = 1.0; break;
  }

  // Length depends on playback rate
  const newLength = Math.ceil(audioBuffer.length / playbackRate);
  
  // Create Offline Context
  const offlineCtx = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    newLength,
    audioBuffer.sampleRate
  );

  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.playbackRate.value = playbackRate;

  // Filter Chain
  let currentNode: AudioNode = source;

  // Filters
  if (effect === EffectType.BASS_BOOST) {
    const filter = offlineCtx.createBiquadFilter();
    filter.type = 'lowshelf';
    filter.frequency.value = 200;
    filter.gain.value = 15; // +15dB Bass
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
  } else if (effect === EffectType.TELEPHONE) {
    const lowCut = offlineCtx.createBiquadFilter();
    lowCut.type = 'highpass';
    lowCut.frequency.value = 500;
    
    const highCut = offlineCtx.createBiquadFilter();
    highCut.type = 'lowpass';
    highCut.frequency.value = 2000;

    currentNode.connect(lowCut);
    lowCut.connect(highCut);
    currentNode = highCut;
  } else if (effect === EffectType.UNDERWATER) {
    const filter = offlineCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.Q.value = 1;
    currentNode.connect(filter);
    currentNode = filter;
  } else if (effect === EffectType.RADIO) {
    const filter = offlineCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1500;
    currentNode.connect(filter);
    currentNode = filter;
  }

  // Connect final node to destination
  currentNode.connect(offlineCtx.destination);

  // Start logic
  source.start(0);

  onProgress(50); // Simulation of progress

  // Render
  const renderedBuffer = await offlineCtx.startRendering();
  
  onProgress(80);

  // Convert to WAV Blob (Interleaved 16-bit PCM)
  const numChannels = renderedBuffer.numberOfChannels;
  const length = renderedBuffer.length;
  const sampleRate = renderedBuffer.sampleRate;
  
  // We will mix down to stereo if > 2 channels, or mono if 1
  // For simplicity here, we assume stereo or mono
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