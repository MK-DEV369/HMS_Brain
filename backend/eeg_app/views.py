from django.shortcuts import render
import tensorflow as tf
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from io import BytesIO
from PIL import Image
from django.conf import settings
import os
from django.utils.timezone import now
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import logging
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .patient_generator import generate_patient_data
import base64
import numpy as np
import tempfile
from intelligence.models.XGBoost.xgboost import xgb_model_manager
#from eeg_app.utils.feature_extraction import extractFeatures

model = tf.keras.models.load_model("backend\eeg_app\model.keras")
SPECTROGRAM_NAMES = ['LL', 'LP', 'RP', 'RR']
EEG_DATA_PATH = os.path.join("E:/4th SEM Data/HMS_Main_EL/HMS-Brian/project/backend/intelligence/preprocessed/eeg/")
SPEC_DATA_PATH = os.path.join("E:/4th SEM Data/HMS_Main_EL/HMS-Brian/project/backend/intelligence/preprocessed/spec/")


class EEGDataView(APIView):
    def get(self, request, patient_id):
        try:
            file_path = os.path.join(EEG_DATA_PATH, f"{patient_id}.npy")
            if not os.path.exists(file_path):
                return Response({"error": f"EEG .npy file for patient {patient_id} not found"}, status=404)
            eeg_array = np.load(file_path)  # shape (19, 2500)
            if eeg_array.shape[0] != 19:
                return Response({"error": f"Unexpected shape: expected 19 channels, got {eeg_array.shape[0]}"}, status=400)
            # Transpose to shape (2500, 19)
            eeg_array = eeg_array.T
            # Map channel names
            channels = ["Fp1", "Fp2", "Fz", "Cz", "Pz", "F3", "F4", "F7", "F8", "C3", "C4", "P3", "P4", "T3", "T4", "T5", "T6", "O1", "O2"]
            eeg_data = [
                {channels[i]: float(sample[i]) for i in range(len(channels))}
                for sample in eeg_array
            ]
            return Response({"eeg_data": eeg_data}, status=status.HTTP_200_OK) 
            # return Response({"eeg_data": eeg_data[-100:]}, status=status.HTTP_200_OK)# Send last 100 samples
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SPECDataView(APIView):
    def get(self, request, patient_id):
        try:
            file_path = os.path.join(SPEC_DATA_PATH, f"{patient_id}.npy")
            if not os.path.exists(file_path):
                return Response({"error": f"Spectrogram .npy file for patient {patient_id} not found"}, status=404)

            spec_array = np.load(file_path)  # shape: (128, 256, 4)
            if spec_array.shape != (128, 256, 4):
                return Response({"error": f"Invalid spectrogram shape: {spec_array.shape}"}, status=400)

            # Convert each of the 4 channels to list of lists for heatmap display
            spectrograms = {
                'LL': spec_array[:, :, 0].tolist(),
                'LP': spec_array[:, :, 1].tolist(),
                'RP': spec_array[:, :, 2].tolist(),
                'RR': spec_array[:, :, 3].tolist()
            }

            return Response({"spectrograms": spectrograms}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# now update the frontend to display the predict eeg from xgboost, sub page next to Model Comparison as Predict Custom Values
class PredictEEG(APIView):
    def post(self, request):
        """
        Endpoint for XGBoost EEG prediction
        
        Expected input formats:
        1. File upload (.npy file): 19 channels x time_points
        2. JSON array: 19 channels x time_points
        3. Manual feature input: Pre-computed features
        4. Single EEG values: 19 single values (one per channel)
        """
        
        try:
            # Method 1: File upload
            if 'eeg_file' in request.FILES:
                uploaded_file = request.FILES['eeg_file']
                
                # Save temporarily
                with tempfile.NamedTemporaryFile(suffix='.npy', delete=False) as tmp_file:
                    for chunk in uploaded_file.chunks():
                        tmp_file.write(chunk)
                    tmp_file_path = tmp_file.name
                
                try:
                    result = xgb_model_manager.predict_from_file(tmp_file_path)
                    return Response({
                        "model": "XGBoost",
                        "input_method": "file_upload",
                        "result": result
                    })
                finally:
                    os.unlink(tmp_file_path)
            
            # Method 2: JSON data (19 channels x time_points)
            elif 'eeg_data' in request.data:
                eeg_data = np.array(request.data['eeg_data'])
                
                if eeg_data.shape[0] != 19:
                    return Response({
                        "error": "EEG data must have 19 channels"
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                result = xgb_model_manager.predict(eeg_data)
                return Response({
                    "model": "XGBoost",
                    "input_method": "json_data",
                    "result": result
                })
            
            # Method 3: Single EEG values (19 values, one per channel)
            elif 'eeg_values' in request.data:
                eeg_values = np.array(request.data['eeg_values'])
                
                if len(eeg_values) != 19:
                    return Response({
                        "error": "Must provide exactly 19 EEG values (one per channel)"
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Convert single values to time series by repeating values
                # This creates a 19 x 100 array where each channel has constant value
                time_points = 100  # You can adjust this
                eeg_data = np.tile(eeg_values.reshape(19, 1), (1, time_points))
                
                result = xgb_model_manager.predict(eeg_data)
                return Response({
                    "model": "XGBoost",
                    "input_method": "single_values",
                    "result": result
                })
            
            # Method 4: Manual feature input (for testing)
            elif 'features' in request.data:
                features = np.array(request.data['features'])
                
                if len(features) != len(xgb_model_manager.feature_names):
                    return Response({
                        "error": f"Expected {len(xgb_model_manager.feature_names)} features"
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Direct prediction with features
                import xgboost as xgb
                dtest = xgb.DMatrix(features.reshape(1, -1))
                probabilities = xgb_model_manager.model.predict(dtest)[0]
                
                predicted_class_idx = np.argmax(probabilities)
                predicted_class = xgb_model_manager.label_encoder.inverse_transform([predicted_class_idx])[0]
                
                class_probabilities = {}
                for i, class_name in enumerate(xgb_model_manager.config['classes']):
                    class_probabilities[class_name] = float(probabilities[i])
                
                result = {
                    "predicted_class": predicted_class,
                    "confidence": float(probabilities[predicted_class_idx]),
                    "probabilities": class_probabilities
                }
                
                return Response({
                    "model": "XGBoost",
                    "input_method": "manual_features",
                    "result": result
                })
            
            else:
                return Response({
                    "error": "No valid input provided. Use 'eeg_file', 'eeg_data', 'eeg_values', or 'features'"
                }, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PatientsView(APIView):
    def get(self, request):
        try:
            patient_ids = [
                fname.replace(".npy", "")
                for fname in os.listdir(EEG_DATA_PATH)
                if fname.endswith(".npy")
            ][:50]
            patients = [generate_patient_data(pid) for pid in patient_ids]
            return Response(patients, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class PatientDetailsView(APIView):
    def get(self, request, patient_id):
        try:
            eeg_path = os.path.join(EEG_DATA_PATH, f"{patient_id}.npy")
            if not os.path.exists(eeg_path):
                return Response({"error": "Patient EEG data not found"}, status=404)
            
            patient = generate_patient_data(patient_id)
            return Response(patient, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

logger = logging.getLogger(__name__)

import requests

def send_sms_india(phone_number: str, sms_message: str) -> bool:
    try:
        url = "https://www.fast2sms.com/dev/bulkV2"
        headers = {
            "authorization":"QOKz5mce0IVrAv9B3jMgohs8EpWXZRGDfNHYy6duSLFn47bkCPVyzGRxcLQEisBNj6o07kO1d9wUYfnK",
            "Content-Type": "application/json"
        }
        payload = {
            "route": "q",
            "message": sms_message,
            "schedule_time": None,
            "flash": 0,
            "numbers": phone_number,
        }
        response = requests.post(url, json=payload, headers=headers)
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Failed to send SMS via Fast2SMS: {e}")
        return False


@method_decorator(csrf_exempt, name='dispatch')
class AlertMedicalStaffView(APIView):
    def post(self, request):
        try:
            data = request.data
            patient_id = data.get("patient_id")
            patient_name = data.get("patient_name")
            room = data.get("room")
            alert_type = data.get("alert_type")
            message = data.get("message")
            severity = data.get("severity")
            timestamp = data.get("timestamp") or now().isoformat()
            doctor_id = data.get("doctor_id")
            confidence_scores = data.get("confidence_scores")
            phone_number = data.get("phone_number")

            # Log or save to DB (optional):
            logger.info(f"🚨 Emergency alert for Patient {patient_name} (Room {room}) by Doctor {doctor_id}")

            # Send SMS using Fast2SMS
            if phone_number:
                sms_message = f"Alert: {alert_type}\nPatient: {patient_name}\nRoom: {room}\nSeverity: {severity}\nMessage: {message}"
                sms_sent = send_sms_india(phone_number, sms_message)
                if sms_sent:
                    logger.info(f"✅ SMS sent successfully to {phone_number}")
                else:
                    logger.error(f"❌ Failed to send SMS to {phone_number}")

            return Response({"status": "success", "message": "Medical alert received"}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error("❌ Error in AlertMedicalStaffView:", exc_info=e)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)