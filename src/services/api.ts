import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { PredictResult } from '../utils/types';

// /**
//  * Sends EEG input data to the prediction API and returns the result.
//  * @param inputData - The EEG input data to be sent to the API.
//  * @returns The prediction result from the API.
//  */
// export const predictEEG = async (inputData: number[]): Promise<PredictResult> => {
//   try {
//       console.log("Sending data to backend:", inputData); // Debugging
//       const response = await axios.post<PredictResult>(`${BASE_URL}/eeg/predict/`, { input: inputData });
//       console.log("Received response from backend:", response.data); // Debugging
//       return response.data;
//   } catch (error: any) {
//       console.error("Prediction API Error:", error.message || error);
//       throw new Error("Failed to fetch prediction from the API.");
//   }
// };

/**
 * Sends filename to backend for EEG prediction.
 * @param filename - Parquet filename (e.g., '00000000.parquet')
 */
export const predictEEG = async (filename: string): Promise<PredictResult> => {
  try {
    console.log("Sending filename to backend:", filename);
    const response = await axios.post<PredictResult>(`${API_BASE_URL}/eeg/predict/`, { file: filename });
    console.log("Received response from backend:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Prediction API Error:", error.message || error);
    throw new Error("Failed to fetch prediction from file.");
  }
};