from django.urls import path
from .views import EEGData, AlertMedicalStaffView, PatientsView, PredictEEG, EEGDataView, PatientDetailsView

urlpatterns = [
    path('predict/', PredictEEG.as_view(), name='predict_eeg'),
    path('patients/', PatientsView.as_view(), name='patients'),
    path('eeg/patients/<str:patient_id>/', PatientDetailsView.as_view(), name='patient_details'), # remove eeg if necessary
    path('data/<str:patient_id>/', EEGDataView.as_view(), name='eeg_data'),
    path('eeg/alerts/', AlertMedicalStaffView.as_view(), name='alert_medical_staff'),
]