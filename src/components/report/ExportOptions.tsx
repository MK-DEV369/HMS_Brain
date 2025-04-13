import React from 'react';
import { Download, Printer, Mail, FilePlus, ChevronLeft} from 'lucide-react';

interface ExportOptionsProps {
  isPreviewMode: boolean;
  onBack: () => void;
  onExportPDF: () => void;
  onPrint: () => void;
  onEmail: () => void;
  onGenerateReport: () => void;
  selectedPatient: () => string | null;
}

export const ExportOptions: React.FC<ExportOptionsProps> = ({ 
  isPreviewMode, 
  onBack, 
  onExportPDF, 
  onPrint, 
  onEmail, 
  onGenerateReport,
  selectedPatient
}) => {
  return (
    <div className="flex flex-col space-y-4">
      {isPreviewMode ? (
        <div className="flex flex-col space-y-2">
          <button
            className="bg-gray-500 text-white py-2 px-4 rounded-lg flex items-center space-x-2"
            onClick={onBack}
          >
            <ChevronLeft size={16} />
            <span>Back to Editor</span>
          </button>
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded-lg flex items-center space-x-2"
            onClick={onExportPDF}
          >
            <Download size={16} />
            <span>Export PDF</span>
          </button>
          <button
            className="bg-gray-700 text-white py-2 px-4 rounded-lg flex items-center space-x-2"
            onClick={onPrint}
          >
            <Printer size={16} />
            <span>Print</span>
          </button>
          <button
            className="bg-green-500 text-white py-2 px-4 rounded-lg flex items-center space-x-2"
            onClick={onEmail}
          >
            <Mail size={16} />
            <span>Email</span>
          </button>
        </div>
      ) : (
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded-lg flex items-center space-x-2"
          onClick={onGenerateReport}
          disabled={!selectedPatient}
        >
          <FilePlus size={16} />
          <span>Generate Report</span>
        </button>
      )}
    </div>
  );
};