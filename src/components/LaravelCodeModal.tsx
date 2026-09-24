import React, { useState } from 'react';
import { LARAVEL_FILES, LaravelFile } from '../data/laravelCode';
import { 
  Code2, 
  Copy, 
  Check, 
  Download, 
  X, 
  FileCode, 
  Terminal, 
  FolderTree, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const LaravelCodeModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<LaravelFile>(LARAVEL_FILES[0]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([selectedFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="glass-panel-dark w-full max-w-5xl h-[90vh] rounded-3xl flex flex-col overflow-hidden border border-white/20 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-display">Msimbo wa Laravel (Laravel Source Code)</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 font-medium">
                  Laravel 11+ & Blade
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Msimbo halisi wa Laravel Blade na Controller tayari kuwekwa kwenye mradi wako
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/15 transition-colors"
              title="Nakili msimbo huu"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Imenakiliwa!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-300" />
                  <span>Nakili Msimbo</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-500/80 to-rose-600/80 hover:from-red-500 hover:to-rose-600 text-white text-xs font-semibold border border-white/20 transition-all shadow-md"
              title="Pakua faili hili moja kwa moja"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Pakua Faili</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors ml-2"
              aria-label="Funga"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 min-h-0">
          
          {/* File Explorer Sidebar */}
          <div className="w-64 border-r border-white/10 p-3 bg-black/20 flex flex-col shrink-0">
            <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase px-2 mb-2 flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5 text-slate-400" />
              <span>Muundo wa Faili</span>
            </div>

            <div className="space-y-1 overflow-y-auto flex-1 pr-1">
              {LARAVEL_FILES.map((file) => {
                const isActive = selectedFile.name === file.name;
                return (
                  <button
                    key={file.name}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex flex-col gap-0.5 border ${
                      isActive 
                        ? 'bg-white/15 text-white border-white/30 shadow-md font-medium' 
                        : 'text-slate-300 hover:bg-white/5 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileCode className={`w-4 h-4 shrink-0 ${isActive ? 'text-red-400' : 'text-slate-400'}`} />
                      <span className="font-mono truncate">{file.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 truncate pl-6">
                      {file.path}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Laravel CLI tips */}
            <div className="mt-3 p-3 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-slate-300 space-y-1.5">
              <div className="flex items-center gap-1 text-red-300 font-semibold">
                <Terminal className="w-3.5 h-3.5" />
                <span>Jinsi ya Kutumia:</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Weka faili hizi kwenye folda ya mradi wako wa Laravel kisha endesha:
              </p>
              <div className="bg-black/50 p-1.5 rounded-lg font-mono text-[10px] text-emerald-400 border border-white/10">
                php artisan serve
              </div>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col min-w-0 bg-slate-950/70">
            {/* File Path Bar */}
            <div className="flex items-center justify-between px-5 py-2.5 bg-black/40 border-b border-white/10 text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px]">
                <span className="text-slate-500">Njia:</span>
                <span className="text-cyan-300 font-medium">{selectedFile.path}</span>
              </div>
              <span className="text-[11px] text-slate-400">
                {selectedFile.descriptionSwahili}
              </span>
            </div>

            {/* Code Pre container */}
            <div className="flex-1 overflow-auto p-5 font-mono text-xs text-slate-200 leading-relaxed selection:bg-red-500/30">
              <pre className="whitespace-pre">
                <code>{selectedFile.code}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-white/5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Muundo huu unatumia Tailwind CSS & Glassmorphism yenye ulinzi wa CSRF na Rate Limiting.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
          >
            Funga Dirisha
          </button>
        </div>

      </div>
    </div>
  );
};
