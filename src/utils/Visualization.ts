export const COLOR_PALETTES = {
  PRIMARY: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'],
  SEIZURE_TYPES: {
    SEIZURE: '#4CAF50',
    LPD: '#FFC107',
    GPD: '#FF5722',
    LRDA: '#F44336',
    GRDA: '#2196F3',
    OTHERS: '#9E9E9E',
  },
  BRAIN_REGIONS: {
    FRONTAL: '#3F51B5',
    TEMPORAL: '#E91E63',
    PARIETAL: '#009688',
    OCCIPITAL: '#FF9800',
    CENTRAL: '#673AB7'
  }
};

export const formatEEGData = (
  rawData: number[],
  sampleRate = 250,
  normalized = false
): { time: string; amplitude: number }[] => {
  if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
    console.error('Invalid EEG data provided');
    return [];
  }

  let formattedData = rawData.map((point, index) => ({
    time: (index / sampleRate).toFixed(3),
    amplitude: point
  }));

  if (normalized) {
    const maxAmplitude = Math.max(...formattedData.map(point => Math.abs(point.amplitude))) || 1;
    formattedData = formattedData.map(point => ({
      ...point,
      amplitude: point.amplitude / maxAmplitude
    }));
  }

  return formattedData;
};

export const extractFrequencyBands = (
  eegData: number[],
  sampleRate = 250
): Record<string, { min: number; max: number; power: number }> => {
  return {
    delta: { min: 0.5, max: 4, power: Math.random() * 100 },
    theta: { min: 4, max: 8, power: Math.random() * 100 },
    alpha: { min: 8, max: 13, power: Math.random() * 100 },
    beta: { min: 13, max: 30, power: Math.random() * 100 },
    gamma: { min: 30, max: 100, power: Math.random() * 100 }
  };
};

export const getHeatMapColor = (value: number, min = 0, max = 100): string => {
  const normalized = (value - min) / (max - min);
  const r = Math.floor(255 * (1 - normalized));
  const g = Math.floor(255 * normalized);
  return `rgb(${r}, ${g}, 0)`;
};

export const formatConfusionMatrix = (
  matrix: number[][],
  labels: string[]
): { actualClass: string; predictedClass: string; value: number }[] => {
  if (!matrix || !labels) return [];

  const result: { actualClass: string; predictedClass: string; value: number }[] = [];

  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      result.push({
        actualClass: labels[i],
        predictedClass: labels[j],
        value: matrix[i][j]
      });
    }
  }

  return result;
};

export const generateDummyEEGData = (
  duration = 10,
  sampleRate = 250,
  type = 'normal'
): number[] => {
  const totalPoints = duration * sampleRate;
  const result: number[] = [];
  let baseFreq = 10;
  let baseAmp = 50;
  let noiseLevel = 10;

  switch (type.toLowerCase()) {
    case 'seizure':
      baseFreq = 3; baseAmp = 150; noiseLevel = 30; break;
    case 'focal_seizure':
      baseFreq = 5; baseAmp = 100; noiseLevel = 20; break;
    case 'status_epilepticus':
      baseFreq = 2; baseAmp = 200; noiseLevel = 40; break;
  }

  for (let i = 0; i < totalPoints; i++) {
    const time = i / sampleRate;
    let signal = baseAmp * Math.sin(2 * Math.PI * baseFreq * time);
    signal += (baseAmp / 3) * Math.sin(2 * Math.PI * (baseFreq * 2) * time);
    signal += (baseAmp / 5) * Math.sin(2 * Math.PI * (baseFreq / 2) * time);
    signal += (Math.random() - 0.5) * 2 * noiseLevel;
    if (type.toLowerCase() !== 'normal' && Math.random() < 0.05) {
      signal += (Math.random() * baseAmp * 2) * (Math.random() > 0.5 ? 1 : -1);
    }
    result.push(signal);
  }

  return result;
};

export const calculateBrainActivityMetrics = (
  eegData: number[]
): Record<string, number> => {
  if (!eegData || eegData.length === 0) return {};

  const sum = eegData.reduce((acc, val) => acc + val, 0);
  const mean = sum / eegData.length;
  const variance = eegData.map(val => (val - mean) ** 2).reduce((acc, val) => acc + val, 0) / eegData.length;
  const stdDev = Math.sqrt(variance);

  let zeroCrossings = 0;
  for (let i = 1; i < eegData.length; i++) {
    if ((eegData[i] >= 0 && eegData[i - 1] < 0) || (eegData[i] < 0 && eegData[i - 1] >= 0)) {
      zeroCrossings++;
    }
  }

  let lineLength = 0;
  for (let i = 1; i < eegData.length; i++) {
    lineLength += Math.abs(eegData[i] - eegData[i - 1]);
  }

  return {
    mean,
    variance,
    stdDev,
    zeroCrossings,
    lineLength,
    peakAmplitude: Math.max(...eegData.map(Math.abs)),
    dataPoints: eegData.length
  };
};

export const formatBrainHeatmapData = (
  channelValues: Record<string, number>
): { channel: string; x: number; y: number; value: number }[] => {
  const electrodePositions: Record<string, { x: number; y: number }> = {
    'Fp1': { x: 30, y: 10 }, 'Fp2': { x: 70, y: 10 },
    'F7': { x: 20, y: 20 }, 'F3': { x: 35, y: 25 }, 'Fz': { x: 50, y: 25 },
    'F4': { x: 65, y: 25 }, 'F8': { x: 80, y: 20 },
    'T3': { x: 15, y: 50 }, 'C3': { x: 35, y: 50 }, 'Cz': { x: 50, y: 50 },
    'C4': { x: 65, y: 50 }, 'T4': { x: 85, y: 50 },
    'T5': { x: 25, y: 75 }, 'P3': { x: 35, y: 70 }, 'Pz': { x: 50, y: 75 },
    'P4': { x: 65, y: 70 }, 'T6': { x: 75, y: 75 },
    'O1': { x: 35, y: 90 }, 'O2': { x: 65, y: 90 }
  };

  const result: { channel: string; x: number; y: number; value: number }[] = [];

  for (const [channel, value] of Object.entries(channelValues)) {
    if (electrodePositions[channel]) {
      result.push({ channel, ...electrodePositions[channel], value });
    }
  }

  return result;
};

export const createSpectrogram = (
  eegData: number[],
  sampleRate = 250
): { time: number; frequency: number; power: number }[] => {
  const result: { time: number; frequency: number; power: number }[] = [];
  const timeWindows = Math.floor(eegData.length / (sampleRate / 2));

  for (let t = 0; t < timeWindows; t++) {
    const timePoint = t * 0.5;

    for (let f = 0; f < 50; f++) {
      const power =
        50 * Math.exp(-((f - 10) ** 2) / 50) +
        30 * Math.exp(-((f - 20) ** 2) / 30) +
        Math.random() * 20;

      result.push({ time: timePoint, frequency: f, power });
    }
  }

  return result;
};

export const formatSeizurePredictions = (
  predictions: Record<string, number>
): { name: string; probability: number; color: string }[] => {
  if (!predictions) return [];

  return Object.keys(predictions).map(className => ({
    name: className,
    probability: predictions[className],
    color: getClassColorCode(className)
  }));
};

function getClassColorCode(className: string): string {
  const normalizedName = className.toUpperCase().replace(/\s+/g, '_');
  if (COLOR_PALETTES.SEIZURE_TYPES[normalizedName as keyof typeof COLOR_PALETTES.SEIZURE_TYPES]) {
    return COLOR_PALETTES.SEIZURE_TYPES[normalizedName as keyof typeof COLOR_PALETTES.SEIZURE_TYPES];
  }
  return '#999999';
}

export const formatLearningCurves = (
  trainingHistory: { trainLoss: number; valLoss: number; trainAccuracy: number; valAccuracy: number }[]
): { epoch: number; trainLoss: number; valLoss: number; trainAccuracy: number; valAccuracy: number }[] => {
  if (!trainingHistory || !Array.isArray(trainingHistory)) return [];

  return trainingHistory.map((entry, index) => ({
    epoch: index + 1,
    trainLoss: entry.trainLoss || 0,
    valLoss: entry.valLoss || 0,
    trainAccuracy: entry.trainAccuracy || 0,
    valAccuracy: entry.valAccuracy || 0
  }));
};
