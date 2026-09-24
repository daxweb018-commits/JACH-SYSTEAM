import React, { useState } from 'react';
import { Image, Sliders, Sparkles, Check, ChevronDown, Layers, Sun } from 'lucide-react';

export interface BackgroundConfig {
  id: string;
  name: string;
  url: string;
  blurLevel: 'sm' | 'md' | 'lg' | 'xl';
  overlayOpacity: number;
  showOrbs: boolean;
}

interface Props {
  config: BackgroundConfig;
  onChange: (newConfig: BackgroundConfig) => void;
  presetImages: Array<{ id: string; name: string; url: string }>;
}

export const BackgroundSettings: React.FC<Props> = ({ config, onChange, presetImages }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  const handleSelectPreset = (url: string, id: string, name: string) => {
    onChange({
      ...config,
      id,
      name,
      url,
    });
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      onChange({
        ...config,
        id: 'custom',
        name: 'Picha Maalum',
        url: customUrl.trim(),
      });
    }
  };

  return (
    <div className="relative z-30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-medium shadow-lg transition-all"
        title="Badili Mandhari ya Nyuma au Athari za Glassmorphism"
      >
        <Image className="w-4 h-4 text-cyan-300" />
        <span className="hidden sm:inline">Mandhari & Glass:</span>
        <span className="text-slate-300 truncate max-w-[120px]">{config.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 p-4 rounded-3xl glass-panel-dark border border-white/25 shadow-2xl text-white space-y-4 animate-in fade-in zoom-in-95 duration-200">
          
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-bold font-display uppercase tracking-wider text-slate-300">
              Mipangilio ya Mandhari (Background)
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Funga
            </button>
          </div>

          {/* Preset Images */}
          <div className="space-y-2">
            <label className="text-[11px] font-medium text-slate-300">Chagua Picha ya Nyuma:</label>
            <div className="grid grid-cols-2 gap-2">
              {presetImages.map((preset) => {
                const isSelected = config.url === preset.url;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.url, preset.id, preset.name)}
                    className={`relative rounded-xl overflow-hidden h-16 border text-left p-2 transition-all flex flex-col justify-end group ${
                      isSelected 
                        ? 'border-cyan-400 ring-2 ring-cyan-400/30' 
                        : 'border-white/15 hover:border-white/40'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
                    <span className="relative z-10 text-[10px] font-semibold text-white truncate drop-shadow">
                      {preset.name}
                    </span>
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 z-10 p-0.5 rounded-full bg-cyan-500 text-white">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom URL input */}
          <form onSubmit={handleApplyCustomUrl} className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-300">Weka Kiungo (URL) kingine:</label>
            <div className="flex gap-1.5">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://.../picha.jpg"
                className="glass-input flex-1 px-3 py-1.5 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-semibold"
              >
                Weka
              </button>
            </div>
          </form>

          {/* Glass Overlay Opacity slider */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] text-slate-300">
              <span className="flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-300" />
                <span>Giza la Mandhari (Dark Overlay)</span>
              </span>
              <span className="font-mono">{Math.round(config.overlayOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="0.85"
              step="0.05"
              value={config.overlayOpacity}
              onChange={(e) => onChange({ ...config, overlayOpacity: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 rounded-lg bg-white/20"
            />
          </div>

          {/* Glowing Orbs toggle */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-[11px] text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Mwangaza wa Nyuma (Ambient Glow)</span>
            </span>
            <button
              type="button"
              onClick={() => onChange({ ...config, showOrbs: !config.showOrbs })}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                config.showOrbs ? 'bg-cyan-500' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  config.showOrbs ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
