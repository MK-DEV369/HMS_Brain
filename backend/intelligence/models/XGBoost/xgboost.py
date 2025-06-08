import pickle
import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple
import logging
from django.conf import settings
import os
from scipy.stats import entropy

logger = logging.getLogger(__name__)

class XGBoostModelManager:
    """Manages XGBoost model loading and predictions"""
    
    def __init__(self):
        self.model = None
        self.label_encoder = None
        self.config = None
        self.feature_names = None
        self.is_loaded = False
        self.load_model()
    
    def load_model(self):
        """Load the trained XGBoost model and associated files"""
        try:
            model_dir = os.path.dirname(__file__)
            
            # Load XGBoost model
            model_path = os.path.join(model_dir, 'xgboost_model.pkl')
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)
            
            # Load label encoder
            encoder_path = os.path.join(model_dir, 'label_encoder.pkl')
            with open(encoder_path, 'rb') as f:
                self.label_encoder = pickle.load(f)
            
            # Load config
            config_path = os.path.join(model_dir, 'training_config.pkl')
            with open(config_path, 'rb') as f:
                self.config = pickle.load(f)
            
            # Generate feature names
            self.feature_names = self._generate_feature_names()
            
            self.is_loaded = True
            logger.info("XGBoost model loaded successfully")
            
        except Exception as e:
            logger.error(f"Error loading XGBoost model: {e}")
            self.is_loaded = False
    
    def _generate_feature_names(self) -> List[str]:
        """Generate feature names matching the training process"""
        names = []
        stats = ['mean', 'std', 'var', 'median', 'min', 'max', 'q25', 'q75', 
                'sum_abs', 'sum_sq', 'abs_mean', 'rms', 'entropy']
        
        # Channel-specific features (19 channels)
        for ch in range(19):
            for stat in stats:
                names.append(f'ch{ch}_{stat}')
        
        # Global features
        names.extend(['global_mean', 'global_std', 'global_var', 'mean_corr'])
        return names
    
    def predict_from_single_values(self, eeg_values: np.ndarray) -> Dict:
        """
        Make prediction from 19 single EEG values (one per channel)
        
        Args:
            eeg_values: numpy array of shape (19,) containing one value per channel
        """
        if not self.is_loaded:
            return {"error": "Model not loaded"}
        
        try:
            if len(eeg_values) != 19:
                return {"error": f"Expected 19 values, got {len(eeg_values)}"}
            
            # For single values, we need to create meaningful features
            # Since we don't have time series, we'll create features based on the values themselves
            features = self.extract_features_from_single_values(eeg_values)
            
            if features is None:
                return {"error": "Feature extraction failed"}
            
            # Make prediction
            import xgboost as xgb
            dtest = xgb.DMatrix(features.reshape(1, -1))
            probabilities = self.model.predict(dtest)[0]
            
            # Get predicted class
            predicted_class_idx = np.argmax(probabilities)
            print("Probabilities:", probabilities)
            print("Argmax index:", np.argmax(probabilities))
            print("Predicted:", predicted_class)
            print("Expected (manual max):", max(class_probabilities, key=class_probabilities.get))

            predicted_class = self.label_encoder.inverse_transform([predicted_class_idx])[0]
            print("Inverse transform classes:", self.label_encoder.classes_)
            # Format results
            class_probabilities = {}
            for i, class_name in enumerate(self.config['classes']):
                class_probabilities[class_name] = float(probabilities[i])
            
            return {
                "predicted_class": predicted_class,
                "confidence": float(probabilities[predicted_class_idx]),
                "probabilities": class_probabilities,
                "feature_count": len(features),
                "input_type": "single_values"
            }
            
        except Exception as e:
            logger.error(f"Single value prediction error: {e}")
            return {"error": str(e)}
    
    def extract_features_from_single_values(self, eeg_values: np.ndarray) -> Optional[np.ndarray]:
        """
        Extract features from 19 single EEG values
        Since we don't have time series, we'll create synthetic features
        """
        try:
            # Validate input
            if len(eeg_values) != 19:
                raise ValueError(f"Expected 19 values, got {len(eeg_values)}")
            
            # Handle NaN/Inf values
            if np.any(~np.isfinite(eeg_values)):
                eeg_values = np.nan_to_num(eeg_values, nan=0.0, posinf=1.0, neginf=-1.0)
            
            # For single values, many statistical features will be the same
            # We'll create a feature vector that matches the expected format
            features = []
            
            # Channel-specific features (for single values, many stats are the same)
            for i in range(19):
                val = eeg_values[i]
                features.extend([
                    val,        # mean
                    0.0,        # std (0 for single value)
                    0.0,        # var (0 for single value)
                    val,        # median
                    val,        # min
                    val,        # max
                    val,        # q25
                    val,        # q75
                    abs(val),   # sum_abs
                    val**2,     # sum_sq
                    abs(val),   # abs_mean
                    abs(val),   # rms
                    0.0         # entropy (0 for single value)
                ])
            
            # Global features
            features.extend([
                np.mean(eeg_values),                    # global_mean
                np.std(eeg_values),                     # global_std
                np.var(eeg_values),                     # global_var
                0.0                                     # mean_corr (0 for single values)
            ])
            
            return np.array(features, dtype=np.float32)
            
        except Exception as e:
            logger.error(f"Error extracting features from single values: {e}")
            return None
    
    def extract_features(self, eeg_data: np.ndarray) -> Optional[np.ndarray]:
        """Extract features from EEG data (same as training)"""
        try:
            # Validate input
            if eeg_data.shape[0] != 19:
                raise ValueError(f"Expected 19 channels, got {eeg_data.shape[0]}")
            
            # Handle NaN/Inf values
            if np.any(~np.isfinite(eeg_data)):
                eeg_data = self._clean_data(eeg_data)
            
            # Standardize each channel
            channel_means = np.mean(eeg_data, axis=1, keepdims=True)
            channel_stds = np.std(eeg_data, axis=1, keepdims=True) + 1e-7
            eeg_data = (eeg_data - channel_means) / channel_stds
            
            # Extract features (same as training)
            features = []
            
            # Time domain features
            features.extend(np.mean(eeg_data, axis=1))
            features.extend(np.std(eeg_data, axis=1))
            features.extend(np.var(eeg_data, axis=1))
            features.extend(np.median(eeg_data, axis=1))
            features.extend(np.min(eeg_data, axis=1))
            features.extend(np.max(eeg_data, axis=1))
            features.extend(np.percentile(eeg_data, 25, axis=1))
            features.extend(np.percentile(eeg_data, 75, axis=1))
            features.extend(np.sum(np.abs(eeg_data), axis=1))
            features.extend(np.sum(eeg_data**2, axis=1))
            features.extend(np.abs(np.mean(eeg_data, axis=1)))
            features.extend(np.sqrt(np.mean(eeg_data**2, axis=1)))
            
            # Entropy features
            for ch in range(19):
                try:
                    channel_data = np.abs(eeg_data[ch, :]) + 1e-10
                    features.append(entropy(channel_data))
                except:
                    features.append(0.0)
            
            # Cross-channel features
            features.extend([
                np.mean(eeg_data),
                np.std(eeg_data),
                np.var(eeg_data),
                np.mean(np.corrcoef(eeg_data))
            ])
            
            return np.array(features, dtype=np.float32)
            
        except Exception as e:
            logger.error(f"Error extracting features: {e}")
            return None
    
    def _clean_data(self, eeg_data: np.ndarray) -> np.ndarray:
        """Clean NaN/Inf values"""
        for ch in range(eeg_data.shape[0]):
            channel = eeg_data[ch, :]
            mask = ~np.isfinite(channel)
            if np.any(mask):
                valid_data = channel[~mask]
                if len(valid_data) > 0:
                    channel[mask] = np.median(valid_data)
                else:
                    channel[mask] = 0.0
        return eeg_data
    
    def predict(self, eeg_data: np.ndarray) -> Dict:
        """Make prediction on EEG data"""
        if not self.is_loaded:
            return {"error": "Model not loaded"}
        
        try:
            # Check if this is single values (1D array of 19 values)
            if eeg_data.ndim == 1 and len(eeg_data) == 19:
                return self.predict_from_single_values(eeg_data)
            
            # Extract features from time series data
            features = self.extract_features(eeg_data)
            if features is None:
                return {"error": "Feature extraction failed"}
            
            # Reshape for prediction
            features = features.reshape(1, -1)
            
            # Make prediction
            import xgboost as xgb
            dtest = xgb.DMatrix(features)
            probabilities = self.model.predict(dtest)[0]
            
            # Get predicted class
            predicted_class_idx = np.argmax(probabilities)
            predicted_class = self.label_encoder.inverse_transform([predicted_class_idx])[0]
            
            # Format results
            class_probabilities = {}
            for i, class_name in enumerate(self.config['classes']):
                class_probabilities[class_name] = float(probabilities[i])
            
            return {
                "predicted_class": predicted_class,
                "confidence": float(probabilities[predicted_class_idx]),
                "probabilities": class_probabilities,
                "feature_count": len(features[0]),
                "input_type": "time_series"
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return {"error": str(e)}
    
    def predict_from_file(self, file_path: str) -> Dict:
        """Make prediction from uploaded .npy file"""
        try:
            eeg_data = np.load(file_path)
            return self.predict(eeg_data)
        except Exception as e:
            logger.error(f"Error loading file {file_path}: {e}")
            return {"error": f"Failed to load file: {e}"}

# Global model manager instance
xgb_model_manager = XGBoostModelManager()