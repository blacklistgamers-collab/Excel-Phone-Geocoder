import React, { useState } from 'react';
import { Copy, Check, Terminal, FileCode } from 'lucide-react';
import { PYTHON_SCRIPT_CONTENT } from '../utils/pythonScript';

const PythonViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PYTHON_SCRIPT_CONTENT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
             <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Script Python Autonome</h3>
            <p className="text-slate-500 text-sm mt-1">
              Vous avez demandé un script Python. Ci-dessous se trouve le code complet et prêt à l'emploi. 
              Vous pouvez l'utiliser pour automatiser cette tâche localement sur votre machine sans passer par cette interface web.
            </p>
          </div>
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden bg-slate-900 shadow-xl border border-slate-800">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-300">process_phones.py</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-white/10 hover:bg-white/20 rounded-md transition-colors"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copié !' : 'Copier'}
          </button>
        </div>
        <div className="overflow-x-auto p-4">
          <pre className="font-mono text-sm text-slate-300 leading-relaxed">
            <code>{PYTHON_SCRIPT_CONTENT}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default PythonViewer;