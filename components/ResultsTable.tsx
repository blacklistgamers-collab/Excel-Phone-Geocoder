import React, { useState, useMemo, useEffect } from 'react';
import { ProcessedRow, CallStatus } from '../types';
import { CheckCircle2, XCircle, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, Phone, PhoneOff } from 'lucide-react';

interface ResultsTableProps {
  data: ProcessedRow[];
  onStatusUpdate?: (originalIndex: number, status: CallStatus) => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ data, onStatusUpdate }) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [visibleCount, setVisibleCount] = useState(50);

  // Réinitialiser le compteur visible si les données changent (filtre ou nouveau fichier)
  useEffect(() => {
    setVisibleCount(50);
  }, [data]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aRaw = a[sortConfig.key];
      const bRaw = b[sortConfig.key];

      // Gestion sécurisée des valeurs nulles/undefined
      const aValue = aRaw === null || aRaw === undefined ? '' : aRaw;
      const bValue = bRaw === null || bRaw === undefined ? '' : bRaw;

      // Tri alphabétique pour les chaînes (gère les accents correctement pour les Pays)
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue, 'fr')
          : bValue.localeCompare(aValue, 'fr');
      }

      // Tri standard pour les nombres ou autres types
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 50);
  };

  if (data.length === 0) return null;

  // Get headers, ensure 'Pays' is at the end or prominent. Exclude internal fields.
  const headers = Object.keys(data[0]).filter(k => k !== 'OriginalIndex' && k !== 'callStatus');

  const getSortIcon = (key: string) => {
    if (sortConfig?.key !== key) {
      return <ArrowUpDown className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-50 transition-opacity" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-blue-600" />
      : <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  const currentData = sortedData.slice(0, visibleCount);

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 bg-white">
        <thead className="bg-slate-50">
          <tr>
            {/* New Status Column Header */}
            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50 w-48">
              Suivi Appel
            </th>
            {headers.map((header) => (
              <th
                key={header}
                scope="col"
                onClick={() => handleSort(header)}
                className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer group select-none transition-colors ${
                  header === 'Pays' ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{header}</span>
                  {getSortIcon(header)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {currentData.map((row, idx) => (
            <tr key={idx} className="hover:bg-slate-50 transition-colors group">
              {/* Status Action Buttons */}
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex items-center gap-2">
                   <button
                    onClick={() => onStatusUpdate && row.OriginalIndex !== undefined && onStatusUpdate(row.OriginalIndex, row.callStatus === 'ANSWERED' ? null : 'ANSWERED')}
                    className={`p-2 rounded-full transition-all border ${
                        row.callStatus === 'ANSWERED'
                        ? 'bg-green-100 border-green-300 text-green-700 shadow-inner'
                        : 'bg-white border-slate-200 text-slate-400 hover:border-green-300 hover:text-green-600'
                    }`}
                    title="Patient a pris l'appel"
                   >
                     <Phone className="w-4 h-4" />
                   </button>
                   <button
                    onClick={() => onStatusUpdate && row.OriginalIndex !== undefined && onStatusUpdate(row.OriginalIndex, row.callStatus === 'NO_ANSWER' ? null : 'NO_ANSWER')}
                    className={`p-2 rounded-full transition-all border ${
                        row.callStatus === 'NO_ANSWER'
                        ? 'bg-red-100 border-red-300 text-red-700 shadow-inner'
                        : 'bg-white border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-600'
                    }`}
                    title="Patient n'a pas pris l'appel"
                   >
                     <PhoneOff className="w-4 h-4" />
                   </button>
                </div>
              </td>

              {headers.map((header) => (
                <td
                  key={`${idx}-${header}`}
                  className="px-6 py-4 whitespace-nowrap text-sm text-slate-700"
                >
                  {header === 'Pays' ? (
                     <div className="flex items-center gap-2">
                        {row[header] !== 'Inconnu' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                            <XCircle className="w-4 h-4 text-slate-300" />
                        )}
                        <span className={row[header] !== 'Inconnu' ? 'font-medium text-slate-900' : 'text-slate-400 italic'}>
                            {row[header]}
                        </span>
                     </div>
                  ) : (
                    row[header]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="p-4 flex flex-col items-center gap-3 border-t border-slate-200 bg-slate-50">
        <span className="text-sm text-slate-500">
          Affichage des {currentData.length} premières lignes {sortConfig ? '(triées) ' : ''}sur {data.length}...
        </span>
        
        {visibleCount < data.length && (
          <button
            onClick={handleShowMore}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm"
          >
            <span>Afficher plus</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ResultsTable;