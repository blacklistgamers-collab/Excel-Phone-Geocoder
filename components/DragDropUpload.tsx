import React, { useCallback } from 'react';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';

interface DragDropUploadProps {
  onFileUpload: (file: File) => void;
}

const DragDropUpload: React.FC<DragDropUploadProps> = ({ onFileUpload }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        validateAndUpload(files[0]);
      }
    },
    [onFileUpload]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const validateAndUpload = (file: File) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];
    
    // Simple check on extension as fallback
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || validTypes.includes(file.type);

    if (isExcel) {
      onFileUpload(file);
    } else {
      alert("Veuillez télécharger un fichier Excel valide (.xlsx ou .xls)");
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center bg-white hover:bg-slate-50 transition-colors cursor-pointer group"
    >
      <input
        type="file"
        id="fileInput"
        className="hidden"
        accept=".xlsx, .xls"
        onChange={handleChange}
      />
      <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center">
        <div className="bg-blue-50 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-200">
          <FileSpreadsheet className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">
          Glissez-déposez votre fichier Excel ici
        </h3>
        <p className="text-slate-500 mb-6 max-w-sm mx-auto">
          ou cliquez pour parcourir. Le fichier doit contenir une colonne "Numéro".
        </p>
        <span className="inline-flex items-center text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-lg group-hover:bg-blue-100 transition-colors">
          <Upload className="w-4 h-4 mr-2" />
          Sélectionner un fichier
        </span>
      </label>
    </div>
  );
};

export default DragDropUpload;