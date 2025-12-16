import React, { useState, useMemo } from 'react';
import { FileSpreadsheet, Code2, Download, RefreshCw, Globe2, Filter } from 'lucide-react';
import DragDropUpload from './components/DragDropUpload';
import ResultsTable from './components/ResultsTable';
import PythonViewer from './components/PythonViewer';
import { readExcelFile, processData, exportToExcel } from './utils/excelProcessor';
import { AppTab, ProcessedRow, ProcessingStats, CallStatus } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.PROCESSOR);
  const [isProcessing, setIsProcessing] = useState(false);
  const [data, setData] = useState<ProcessedRow[] | null>(null);
  const [stats, setStats] = useState<ProcessingStats | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [filterCountry, setFilterCountry] = useState<string>('Tous');

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setFileName(file.name);
    setFilterCountry('Tous'); // Reset filter on new upload
    try {
      // 1. Read
      const rawData = await readExcelFile(file);
      
      // 2. Process
      const { processed, stats } = processData(rawData);
      
      // 3. Set State
      setData(processed);
      setStats(stats);
    } catch (error) {
      console.error("Error processing file", error);
      alert("Erreur lors de la lecture du fichier. Assurez-vous qu'il s'agit d'un fichier Excel valide.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusUpdate = (originalIndex: number, status: CallStatus) => {
    setData((prevData) => {
      if (!prevData) return null;
      return prevData.map((row) => 
        row.OriginalIndex === originalIndex ? { ...row, callStatus: status } : row
      );
    });
  };

  // Extract unique countries for the filter dropdown
  const uniqueCountries = useMemo(() => {
    if (!data) return [];
    // Extract unique countries, filter out null/undefined if any
    const countries = new Set(data.map(row => row.Pays).filter((p): p is string => !!p));
    return Array.from(countries).sort((a: string, b: string) => a.localeCompare(b, 'fr'));
  }, [data]);

  // Filter data based on selection
  const filteredData = useMemo(() => {
    if (!data) return null;
    if (filterCountry === 'Tous') return data;
    return data.filter(row => row.Pays === filterCountry);
  }, [data, filterCountry]);

  const handleExport = () => {
    if (filteredData) {
      // Add country name to filename if filtered
      const filename = filterCountry === 'Tous' 
        ? 'output_avec_pays.xlsx' 
        : `contacts_${filterCountry.toLowerCase().replace(/ /g, '_')}.xlsx`;
      
      exportToExcel(filteredData, filename);
    }
  };

  const handleReset = () => {
    setData(null);
    setStats(null);
    setFileName('');
    setFilterCountry('Tous');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg shadow-sm">
                <Globe2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">GeoPhone Analytics</h1>
                <p className="text-xs text-slate-500 font-medium">Excel Phone Enrichment Tool</p>
              </div>
            </div>
            <nav className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab(AppTab.PROCESSOR)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === AppTab.PROCESSOR
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  Application Web
                </div>
              </button>
              <button
                onClick={() => setActiveTab(AppTab.SCRIPT)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === AppTab.SCRIPT
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  Script Python
                </div>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === AppTab.PROCESSOR && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Intro Section */}
            {!data && (
               <div className="text-center max-w-2xl mx-auto mb-12">
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">Enrichissez vos fichiers clients</h2>
                  <p className="text-lg text-slate-600">
                    Détectez automatiquement le pays d'origine à partir des numéros de téléphone internationaux dans vos fichiers Excel.
                    Traitement 100% sécurisé dans votre navigateur.
                  </p>
               </div>
            )}

            {/* Upload Area or Results Header */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {!data ? (
                <div className="p-8">
                  <DragDropUpload onFileUpload={handleFileUpload} />
                  {isProcessing && (
                    <div className="mt-4 text-center text-blue-600 flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Traitement du fichier en cours...
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-b border-slate-200 bg-slate-50 p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                      {fileName}
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm">
                      <span className="text-slate-500">Total: <strong className="text-slate-700">{stats?.total}</strong></span>
                      <span className="text-green-600">Identifiés: <strong>{stats?.identified}</strong></span>
                      <span className="text-red-500">Inconnus: <strong>{stats?.unknown}</strong></span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    {/* Country Filter Dropdown */}
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Filter className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <select
                        value={filterCountry}
                        onChange={(e) => setFilterCountry(e.target.value)}
                        className="pl-9 pr-8 py-2 w-full sm:w-48 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                      >
                        <option value="Tous">Tous les pays</option>
                        <optgroup label="Pays détectés">
                          {uniqueCountries.map(country => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </optgroup>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    <div className="h-6 w-px bg-slate-300 hidden sm:block mx-1"></div>

                    <button
                      onClick={handleReset}
                      className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Nouveau
                    </button>
                    <button
                      onClick={handleExport}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {filterCountry === 'Tous' ? 'Tout télécharger' : 'Télécharger (Filtré)'}
                    </button>
                  </div>
                </div>
              )}
              
              {/* Data Table */}
              {filteredData && (
                <div className="p-0">
                  <ResultsTable data={filteredData} onStatusUpdate={handleStatusUpdate} />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === AppTab.SCRIPT && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PythonViewer />
          </div>
        )}

      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>Généré par une IA experte en React & Python.</p>
          <p className="mt-1">Les données sont traitées localement dans votre navigateur.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;