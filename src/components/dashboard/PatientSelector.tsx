import React, { useState } from 'react';
import { User, ChevronDown, Search } from 'lucide-react';
import { Patient } from '../../utils/types';

interface PatientSelectorProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
}

const statusStyles = {
  stable: 'bg-green-100 text-green-700 border-green-300',
  warning: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  critical: 'bg-red-100 text-red-700 border-red-300',
};

const PatientSelector: React.FC<PatientSelectorProps> = ({ patients, selectedPatient, onSelectPatient }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full">
      {/* Main button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5 text-gray-400" />
          <span className="text-gray-800 font-medium">
            {selectedPatient ? selectedPatient.name : 'Select Patient'}
          </span>
        </div>
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          {/* Search */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients..."
                className="w-full pl-9 pr-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => {
                    onSelectPatient(patient);
                    setIsOpen(false);
                  }}
                  className="w-full flex justify-between items-center px-4 py-2 hover:bg-gray-50 focus:outline-none"
                >
                  <div>
                    <div className="font-semibold text-gray-800">{patient.name}</div>
                    <div className="text-sm text-gray-500">
                      Age: {patient.age} | Room: {patient.room}
                    </div>
                  </div>
                  
                  {patient.status && (
                    <span
                      className={`px-2 py-1 text-xs rounded-full border ${statusStyles[patient.status]}`}
                    >
                      {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                    </span>
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500 text-sm text-center">
                No patients found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientSelector;
