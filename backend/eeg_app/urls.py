from django.urls import path
from .views import SPECDataView, AlertMedicalStaffView, PatientsView, PredictEEG, EEGDataView, PatientDetailsView

urlpatterns = [
    path('predict/', PredictEEG.as_view(), name='predict'),
    path('patients/', PatientsView.as_view(), name='patients'),
    path('eeg/patients/<str:patient_id>/', PatientDetailsView.as_view(), name='patient_details'), # remove eeg if necessary
    path('data/<str:patient_id>/', EEGDataView.as_view(), name='eeg_data'),
    path('spec/<str:patient_id>/', SPECDataView.as_view(), name='spec_data'),
    path('alerts/', AlertMedicalStaffView.as_view(), name='alert_medical_staff'),
]