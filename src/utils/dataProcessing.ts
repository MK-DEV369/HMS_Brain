import { EEG_SAMPLING_RATE, FREQUENCY_BANDS } from './constants';

// Define interfaces
export interface RawEEGPoint {
  timestamp?: number;
  amplitude?: number;
  frequency_bands?: {
    alpha?: number;
    beta?: number;
    theta?: number;
    delta?: number;
  };
  alpha?: number;
  beta?: number;
  theta?: number;
  delta?: number;
  frequency?: number;
}

export interface ProcessedEEGPoint {
  time: number;
  amplitude: number;
  alpha?: number;
  beta?: number;
  theta?: number;
  delta?: number;
  normalizedAmplitude?: number;
  isArtifact?: boolean;
  frequency?: number;
}

/**
 * Process raw EEG data from the backend
 */
export function processEEGData(rawData: RawEEGPoint[]): ProcessedEEGPoint[] {
  if (!rawData || !Array.isArray(rawData)) {
    console.error('Invalid EEG data received:', rawData);
    return [];
  }

  return rawData.map((point, index) => {
    const processedPoint: ProcessedEEGPoint = {
      time: point.timestamp ?? index,
      amplitude: point.amplitude ?? 0,
    };

    if (point.frequency_bands) {
      processedPoint.alpha = point.frequency_bands.alpha ?? 0;
      processedPoint.beta = point.frequency_bands.beta ?? 0;
      processedPoint.theta = point.frequency_bands.theta ?? 0;
      processedPoint.delta = point.frequency_bands.delta ?? 0;
    } else {
      processedPoint.alpha = point.alpha ?? 0;
      processedPoint.beta = point.beta ?? 0;
    }

    return processedPoint;
  });
}
//Apply a digital filter to EEG data
export function applyBandpassFilter(
  data: ProcessedEEGPoint[],
  lowCutoff: number,
  highCutoff: number
): ProcessedEEGPoint[] {
  if (!data || data.length === 0) return [];

  return data.map(point => {
    const filtered = { ...point };
    if (point.frequency && (point.frequency < lowCutoff || point.frequency > highCutoff)) {
      filtered.amplitude = point.amplitude * 0.3;
    }
    return filtered;
  });
}

//Calculate frequency bands from time-domain EEG data
export function calculateFrequencyBands(timeData: ProcessedEEGPoint[]): { frequency: string; power: number }[] {
  if (!timeData || timeData.length === 0) return [];

  const frequencyData: { frequency: string; power: number }[] = [];
  const maxFreq = EEG_SAMPLING_RATE / 2;

  for (let freq = 0; freq < maxFreq; freq += maxFreq / 20) {
    let power = 0;

    if (freq >= FREQUENCY_BANDS.DELTA.min && freq <= FREQUENCY_BANDS.DELTA.max) {
      power = 20 - Math.abs(freq - 2) * 5;
    } else if (freq >= FREQUENCY_BANDS.THETA.min && freq <= FREQUENCY_BANDS.THETA.max) {
      power = 15 - Math.abs(freq - 6) * 3;
    } else if (freq >= FREQUENCY_BANDS.ALPHA.min && freq <= FREQUENCY_BANDS.ALPHA.max) {
      power = 25 - Math.abs(freq - 10) * 4;
    } else if (freq >= FREQUENCY_BANDS.BETA.min && freq <= FREQUENCY_BANDS.BETA.max) {
      power = 10 - Math.abs(freq - 20) * 0.5;
    } else if (freq >= FREQUENCY_BANDS.GAMMA.min) {
      power = 5 - (freq - FREQUENCY_BANDS.GAMMA.min) * 0.1;
    }

    power = Math.max(0, power + (Math.random() - 0.5) * 5);

    frequencyData.push({
      frequency: freq.toFixed(1),
      power: power,
    });
  }

  return frequencyData;
}

/**
 * Extract features from EEG data for ML model input
 */
export function extractFeatures(eegData: ProcessedEEGPoint[]): Record<string, number> {
  if (!eegData || eegData.length === 0) return {};

  const amplitudes = eegData.map(point => point.amplitude);
  const mean = amplitudes.reduce((sum, val) => sum + val, 0) / amplitudes.length;

  const variance = amplitudes.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amplitudes.length;
  const stdDev = Math.sqrt(variance);

  const min = Math.min(...amplitudes);
  const max = Math.max(...amplitudes);
  const range = max - min;
  const energy = amplitudes.reduce((sum, val) => sum + val * val, 0);

  let lineLength = 0;
  for (let i = 1; i < amplitudes.length; i++) {
    lineLength += Math.abs(amplitudes[i] - amplitudes[i - 1]);
  }

  let bandPowers: Record<string, number> = {};
  if (eegData[0].alpha !== undefined) {
    const alphaPower = eegData.reduce((sum, point) => sum + Math.pow(point.alpha ?? 0, 2), 0) / eegData.length;
    const betaPower = eegData.reduce((sum, point) => sum + Math.pow(point.beta ?? 0, 2), 0) / eegData.length;
    const thetaPower = eegData.reduce((sum, point) => sum + Math.pow(point.theta ?? 0, 2), 0) / eegData.length;
    const deltaPower = eegData.reduce((sum, point) => sum + Math.pow(point.delta ?? 0, 2), 0) / eegData.length;

    bandPowers = {
      alphaPower,
      betaPower,
      thetaPower,
      deltaPower,
      alphaToThetaRatio: thetaPower > 0 ? alphaPower / thetaPower : 0,
    };
  }

  return {
    mean,
    stdDev,
    variance,
    min,
    max,
    range,
    energy,
    lineLength,
    ...bandPowers,
  };
}

/**
 * Normalize EEG data for consistent visualization
 */
export function normalizeData(data: ProcessedEEGPoint[]): ProcessedEEGPoint[] {
  if (!data || data.length === 0) return [];

  let min = Infinity;
  let max = -Infinity;

  data.forEach(point => {
    if (point.amplitude < min) min = point.amplitude;
    if (point.amplitude > max) max = point.amplitude;
  });

  const range = max - min || 1;

  return data.map(point => ({
    ...point,
    normalizedAmplitude: (point.amplitude - min) / range,
  }));
}

/**
 * Detect artifacts and anomalies in EEG data
 */
export function detectArtifacts(data: ProcessedEEGPoint[]): ProcessedEEGPoint[] {
  if (!data || data.length === 0) return [];

  const amplitudes = data.map(point => point.amplitude);
  const mean = amplitudes.reduce((sum, val) => sum + val, 0) / amplitudes.length;
  const variance = amplitudes.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amplitudes.length;
  const stdDev = Math.sqrt(variance);
  const threshold = 3 * stdDev;

  return data.map(point => ({
    ...point,
    isArtifact: Math.abs(point.amplitude - mean) > threshold,
  }));
}

/**
 * Format EEG data for CSV export
 */
export function formatDataForCSV(data: ProcessedEEGPoint[]): string {
  if (!data || data.length === 0) return "";

  const headers = Object.keys(data[0]).join(",");
  const rows = data.map(point =>
    Object.values(point).map(val => (typeof val === 'number' ? val.toFixed(4) : val)).join(",")
  );

  return [headers, ...rows].join("\n");
}
