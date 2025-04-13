import React from 'react';
import { User, ChevronDown, Search } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  age: number;
  room: string;
  status: 'stable' | 'critical' | 'warning';
}

interface PatientSelectorProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
}

const statusStyles = {
  stable: 'bg-green-50 text-green-700 border-green-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
  warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
};

const PatientSelector: React.FC<PatientSelectorProps> = ({
  patients,
  selectedPatient,
  onSelectPatient,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-lg px-4 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex items-center">
          <User className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-gray-900">
            {selectedPatient ? selectedPatient.name : 'Select Patient'}
          </span>
        </div>
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredPatients.map((patient) => (
              <button
                key={patient.id}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none"
                onClick={() => {
                  onSelectPatient(patient);
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{patient.name}</div>
                    <div className="text-sm text-gray-500">
                      Age: {patient.age} | Room: {patient.room}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full border ${
                      statusStyles[patient.status]
                    }`}
                  >
                    {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientSelector;