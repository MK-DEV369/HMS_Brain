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
#from eeg_app.utils.feature_extraction import extractFeatures

model = tf.keras.models.load_model("backend\eeg_app\model.keras")
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
            return Response({"eeg_data": eeg_data[-100:]}, status=status.HTTP_200_OK)  # Send last 100 samples
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class SPECDataView(APIView):
    def get(self, request, patient_id):
        try:
            file_path = os.path.join(SPEC_DATA_PATH, f"{patient_id}.npy")
            if not os.path.exists(file_path):
                return Response({"error": f"Spectrogram .npy file for patient {patient_id} not found"}, status=404)

            spec_array = np.load(file_path)  # shape: (N, 6): [intensity, alpha, beta, gamma, theta, delta]
            spec_data = [
                {
                    "intensity": float(row[0]) if len(row) > 0 else 0.0,
                    "alpha_power": float(row[1]) if len(row) > 1 else 0.0,
                    "beta_power": float(row[2]) if len(row) > 2 else 0.0,
                    "gamma_power": float(row[3]) if len(row) > 3 else 0.0,
                    "theta_power": float(row[4]) if len(row) > 4 else 0.0,
                    "delta_power": float(row[5]) if len(row) > 5 else 0.0
                }
                for row in spec_array
            ]
            return Response({"spec_data": spec_data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PredictEEG(APIView):
    def post(self, request):
        try:
            filename = request.data.get("file")
            if not filename:
                return Response({"error": "No file provided"}, status=400)

            full_path = os.path.join(EEG_DATA_PATH, filename)
            if not os.path.exists(full_path):
                return Response({"error": "File not found"}, status=404)

            df = pd.read_parquet(full_path)
            eeg_signal = df["Fp1"].values[:1000]  # adjust channel/sample size as needed

            # Create spectrogram image
            fig, ax = plt.subplots()
            ax.specgram(eeg_signal, Fs=100)
            plt.axis('off')
            buf = BytesIO()
            plt.savefig(buf, format='png', bbox_inches='tight', pad_inches=0)
            plt.close(fig)

            buf.seek(0)
            img = Image.open(buf).convert("RGB")
            img = img.resize((224, 224))
            img_array = np.array(img) / 255.0
            img_array = img_array.reshape((1, 224, 224, 3))

            prediction = model.predict(img_array)[0]
            print(prediction)
            predicted_class = int(np.argmax(prediction))

            return Response({
                "prediction": predicted_class,
                "confidence_scores": {
                    "seizure": float(prediction[0][0]) * 100,
                    "lpd": float(prediction[0][1]) * 100,
                    "gpd": float(prediction[0][2]) * 100,
                    "lrda": float(prediction[0][3]) * 100,
                    "grda": float(prediction[0][4]) * 100,
                    "others": float(prediction[0][5]) * 100,
                }
            })

        except Exception as e:
            return Response({"error": str(e)}, status=500)


# class PredictEEG(APIView):
#     def post(self, request):
#         try:
#             filename = request.data.get("file")  # e.g., '001.parquet'
#             if not filename:
#                 return Response({"error": "No file provided"}, status=400)

#             file_path = os.path.join(settings.BASE_DIR, 'train_eegs', filename)
#             df = pd.read_parquet(file_path)
#             # You can return specific channels or reshape based on your model
#             eeg_data = df.to_numpy()  # Convert to numpy array
#             # Generate a spectrogram from the EEG data
#             fig, ax = plt.subplots()
#             ax.specgram(eeg_data[:, 0], Fs=100)  # Example: Generate a spectrogram
#             buf = BytesIO()
#             plt.savefig(buf, format='png')
#             buf.seek(0)
#             img = Image.open(buf).convert('RGB')
#             img = img.resize((224, 224))  # Resize to match model input
#             img_array = np.array(img) / 255.0  # Normalize pixel values
#             img_array = img_array.reshape(1, 224, 224, 3)  # Add batch dimension

#             # Make prediction
#             prediction = model.predict(img_array)
#             predicted_class = int(np.argmax(prediction))  # Get the predicted class

#             return Response({'prediction': predicted_class}, status=status.HTTP_200_OK)

#         except Exception as e:
#             print("Error during prediction:", str(e))  # Debugging
#             return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

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

            # Placeholder for SMS integration
            print(f"📲 Sending SMS to {phone_number}... Message: {message}")

            return Response({"status": "success", "message": "Medical alert received"}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error("❌ Error in AlertMedicalStaffView:", exc_info=e)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)