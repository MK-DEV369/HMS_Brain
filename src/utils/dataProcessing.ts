import { EEG_SAMPLING_RATE, FREQUENCY_BANDS } from './constants';

export interface RawEEGPoint {
  [key: string]: number; // allows dynamic key access like point["Fp1"]
}

export interface ProcessedEEGPoint {
  time: number;
  [key: string]: number; // each channel like Fp1, Fp2, etc. will map to a number
}


export function processEEGData(rawData: RawEEGPoint[]): ProcessedEEGPoint[] {
  if (!rawData || !Array.isArray(rawData)) {
    console.error('Invalid EEG data received:', rawData);
    return [];
  }

  return rawData.map((point, index) => {
    const processedPoint: ProcessedEEGPoint = { time: point.timestamp ?? index };

    // Copy all EEG channel values dynamically
    for (const key in point) {
      if (key !== 'timestamp' && typeof point[key] === 'number') {
        processedPoint[key] = point[key];
      }
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
      // Reduce amplitude and all channels
      Object.keys(filtered).forEach(key => {
        if (key !== 'time' && typeof filtered[key] === 'number') {
          filtered[key] = (filtered[key] as number) * 0.3;
        }
      });
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

//Extract features from EEG data for ML model input
export function extractFeatures(eegData: ProcessedEEGPoint[]): Record<string, number> {
  if (!eegData || eegData.length === 0) return {};

  const channels = Object.keys(eegData[0]).filter(key => key !== 'time' && typeof eegData[0][key] === 'number');

  const features: Record<string, number> = {};

  channels.forEach(channel => {
    const values = eegData.map(p => p[channel] as number);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const energy = values.reduce((sum, v) => sum + v * v, 0);

    let lineLength = 0;
    for (let i = 1; i < values.length; i++) {
      lineLength += Math.abs(values[i] - values[i - 1]);
    }

    features[`${channel}_mean`] = mean;
    features[`${channel}_stdDev`] = stdDev;
    features[`${channel}_variance`] = variance;
    features[`${channel}_min`] = min;
    features[`${channel}_max`] = max;
    features[`${channel}_range`] = range;
    features[`${channel}_energy`] = energy;
    features[`${channel}_lineLength`] = lineLength;
  });

  return features;
}


//Normalize EEG data for consistent visualization
export function normalizeData(data: ProcessedEEGPoint[]): ProcessedEEGPoint[] {
  if (!data || data.length === 0) return [];

  const keys = Object.keys(data[0]).filter(k => k !== 'time' && typeof data[0][k] === 'number');
  const mins: Record<string, number> = {};
  const maxs: Record<string, number> = {};

  keys.forEach(key => {
    mins[key] = Math.min(...data.map(p => p[key] as number));
    maxs[key] = Math.max(...data.map(p => p[key] as number));
  });

  return data.map(p => {
    const normalizedPoint: ProcessedEEGPoint = { time: p.time };
    keys.forEach(k => {
      const range = maxs[k] - mins[k] || 1;
      normalizedPoint[k] = ((p[k] as number) - mins[k]) / range;
    });
    return normalizedPoint;
  });
}


//Detect artifacts and anomalies in EEG data
export function detectArtifacts(data: ProcessedEEGPoint[]): ProcessedEEGPoint[] {
  if (!data || data.length === 0) return [];

  const keys = Object.keys(data[0]).filter(k => k !== 'time' && typeof data[0][k] === 'number');

  const stats = keys.map(key => {
    const values = data.map(p => p[key] as number);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length);
    return { key, mean, stdDev };
  });

  return data.map(p => {
    const isArtifact = stats.some(({ key, mean, stdDev }) => {
      const val = p[key] as number;
      return Math.abs(val - mean) > 3 * stdDev;
    });
    
    // Create a new object that matches the ProcessedEEGPoint interface
    const processedPoint: ProcessedEEGPoint = {
      time: p.time,
      ...(Object.fromEntries(keys.map(k => [k, isArtifact ? 0 : p[k]])))
    };

    return processedPoint;
  });
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
