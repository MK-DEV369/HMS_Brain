import React, { useState, useRef } from 'react';
import { FileUp, X, Check, ChevronDown, FileText, Database } from 'lucide-react';

interface DataUploaderProps {
  onFileUpload: (file: File, dataType: string) => void;
  supportedFormats?: string[];
  maxFileSizeMB?: number;
  className?: string;
  title?: string;
}

const DataUploader: React.FC<DataUploaderProps> = ({
  onFileUpload,
  supportedFormats = ['.csv', '.json', '.pdf', '.txt'],
  maxFileSizeMB = 50,
  className = '',
  title = 'Upload Dataset',
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [selectedDataType, setSelectedDataType] = useState('Training Data');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dataTypes = [
    'Training Data',
    'Validation Data',
    'Testing Data',
    'Patient EEG Data',
    'Labeled Data',
    'Unlabeled Data'
  ];

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxFileSizeMB * 1024 * 1024) {
      setErrorMessage(`File size exceeds maximum limit of ${maxFileSizeMB}MB`);
      return false;
    }

    // Check file extension
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!supportedFormats.includes(fileExtension)) {
      setErrorMessage(`Unsupported file format. Please upload: ${supportedFormats.join(', ')}`);
      return false;
    }

    return true;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setUploadStatus('idle');
    setErrorMessage('');
    
    if (validateFile(file)) {
      setUploadedFile(file);
      setUploadStatus('success');
      onFileUpload(file, selectedDataType);
    } else {
      setUploadStatus('error');
      setUploadedFile(null);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadStatus('idle');
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const selectDataType = (type: string) => {
    setSelectedDataType(type);
    setShowTypeDropdown(false);
    
    if (uploadedFile) {
      onFileUpload(uploadedFile, type);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="relative">
          <button
            className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md text-sm font-medium"
            onClick={() => setShowTypeDropdown(!showTypeDropdown)}
          >
            <Database size={16} />
            <span>{selectedDataType}</span>
            <ChevronDown size={16} />
          </button>
          
          {showTypeDropdown && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border">
              <ul className="py-1">
                {dataTypes.map((type) => (
                  <li 
                    key={type}
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                      selectedDataType === type ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                    onClick={() => selectDataType(type)}
                  >
                    {type}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4">
        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
          } ${uploadStatus === 'error' ? 'border-red-400 bg-red-50' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {!uploadedFile ? (
            <div className="space-y-3">
              <div className="flex justify-center">
                <FileUp className="h-12 w-12 text-gray-400" />
              </div>
              <div className="text-sm">
                <p className="font-medium">Drop your file here, or <span className="text-blue-500 cursor-pointer" onClick={() => fileInputRef.current?.click()}>browse</span></p>
                <p className="text-gray-500 mt-1">
                  Supported formats: {supportedFormats.join(', ')} (Max: {maxFileSizeMB}MB)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept={supportedFormats.join(',')}
              />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm truncate max-w-xs">{uploadedFile.name}</p>
                  <p className="text-gray-500 text-xs">{formatFileSize(uploadedFile.size)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {uploadStatus === 'success' && (
                  <div className="bg-green-100 p-1 rounded-full">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                )}
                <button 
                  onClick={removeFile}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Error message */}
        {errorMessage && (
          <div className="mt-2 text-sm text-red-600">
            {errorMessage}
          </div>
        )}
        
        {/* Format description */}
        <div className="mt-4 bg-gray-50 p-3 rounded-md">
          <h4 className="text-sm font-medium mb-2">Expected Data Format</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p><span className="font-medium">CSV:</span> Each row should represent one EEG sample with features as columns.</p>
            <p><span className="font-medium">JSON:</span> Array of objects with feature keys and values.</p>
            <p><span className="font-medium">EDF:</span> European Data Format for EEG recordings.</p>
          </div>
        </div>
        
        {/* Upload button for selected file */}
        {uploadedFile && (
          <div className="mt-4 flex justify-end">
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center space-x-2"
              onClick={() => onFileUpload(uploadedFile, selectedDataType)}
            >
              <FileUp size={16} />
              <span>Process {selectedDataType}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataUploader;