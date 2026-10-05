import React, { useState } from 'react';
import { Sparkles, Tv, Monitor, Orbit, Check, ArrowRight, X, Palette, Sliders } from 'lucide-react';
import { StudioSettings, ThemeMode } from '../../types';

interface OnboardingWizardProps {
  settings: StudioSettings;
  onComplete: (updated: StudioSettings) => void;
  onSkip: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  settings,
  onComplete,
  onSkip,
}) => {
  const [step, setStep] = useState<number>(1);
  const [studioName, setStudioName] = useState<string>(settings.studio_name);
  const [tagline, setTagline] = useState<string>(settings.tagline);
  const [channelId, setChannelId] = useState<string>(settings.youtube_channel_id || 'UCFw0IWvKFQNsUoAHeyMgihA');
  const [apiKey, setApiKey] = useState<string>(settings.youtube_api_key || '');
  const [themeMode, setThemeMode] = useState<ThemeMode>(settings.theme_mode || 'cinematic');
  const [accentColor, setAccentColor] = useState<string>(settings.accent_color || '#e52b2b');
  const [glowIntensity, setGlowIntensity] = useState<number>(settings.glow_intensity || 65);

  const handleFinish = () => {
    onComplete({
      ...settings,
      studio_name: studioName.trim() || 'Mini Motion Studios',
      tagline: tagline.trim() || 'Stories that stay with you',
      youtube_channel_id: channelId.trim() || 'UCFw0IWvKFQNsUoAHeyMgihA',
      youtube_api_key: apiKey.trim() || undefined,
      theme_mode: themeMode,
      accent_color: accentColor,
      glow_intensity: glowIntensity,
      onboarding_completed: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none text-left font-sans">
      <div className="bg-[#0b0e15] border border-[#232b3d] rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Top Progress Bar */}
        <div className="bg-[#0f131f] px-6 py-4 border-b border-[#1c2333] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center font-bold text-xs">
              0{step}
            </span>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                {step === 1 && 'Step 1: Studio Identity'}
                {step === 2 && 'Step 2: English YouTube Channel'}
                {step === 3 && 'Step 3: Studio Theme & Glow'}
              </p>
              <p className="text-[10px] text-zinc-400 font-mono">Step {step} of 3</p>
            </div>
          </div>

          <button
            onClick={onSkip}
            className="text-xs font-mono text-zinc-400 hover:text-white px-2 py-1 rounded hover:bg-white/5 transition"
          >
            Skip Setup →
          </button>
        </div>

        {/* Step 1: Studio Identity */}
        {step === 1 && (
          <div className="p-6 sm:p-8 space-y-5">
            <div>
              <h2 className="text-xl font-black text-white font-display">Welcome to your Content Desk</h2>
              <p className="text-xs text-zinc-400 font-mono mt-1">
                Configure your studio identity. This will appear on your dashboard, exports, and sidebar.
              </p>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-[10px] uppercase text-zinc-400 mb-1">Studio Name</label>
                <input
                  type="text"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  placeholder="Mini Motion Studios"
                  className="w-full bg-[#121624] border border-[#20293d] rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 outline-none focus:border-red-500/60 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-zinc-400 mb-1">Studio Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Stories that stay with you"
                  className="w-full bg-[#121624] border border-[#20293d] rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 outline-none focus:border-red-500/60 transition"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs transition shadow-[0_0_15px_#ef4444] flex items-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: YouTube Channel */}
        {step === 2 && (
          <div className="p-6 sm:p-8 space-y-5">
            <div>
              <h2 className="text-xl font-black text-white font-display">Connect Your YouTube Channel</h2>
              <p className="text-xs text-zinc-400 font-mono mt-1">
                Your studio is pre-configured for your English channel. Enter your Google Data API v3 key for live telemetry.
              </p>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-[10px] uppercase text-zinc-400 mb-1">YouTube Channel ID</label>
                <input
                  type="text"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  placeholder="UCFw0IWvKFQNsUoAHeyMgihA"
                  className="w-full bg-[#121624] border border-[#20293d] rounded-xl px-3.5 py-2.5 text-white font-mono placeholder-zinc-500 outline-none focus:border-red-500/60 transition"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">Official Channel ID for Mini Motion Studios</span>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-zinc-400 mb-1">YouTube Data API v3 Key (Optional)</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-[#121624] border border-[#20293d] rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 outline-none focus:border-red-500/60 transition"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Leave blank to connect later in Settings. Data is read-only.
                </span>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-zinc-400 hover:text-white transition"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs transition shadow-[0_0_15px_#ef4444] flex items-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Theme & Accents */}
        {step === 3 && (
          <div className="p-6 sm:p-8 space-y-5">
            <div>
              <h2 className="text-xl font-black text-white font-display">Select Studio Look & Feel</h2>
              <p className="text-xs text-zinc-400 font-mono mt-1">
                Choose your default interface layout, accent lighting, and glow intensity.
              </p>
            </div>

            {/* Theme mode options */}
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setThemeMode('cinematic')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition text-left space-y-1 ${
                  themeMode === 'cinematic' 
                    ? 'border-red-500 bg-red-950/20 shadow-[0_0_15px_rgba(229,43,43,0.3)]' 
                    : 'border-[#1f2738] bg-[#111420] hover:border-zinc-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-bold text-white font-mono">Cinematic Desk</span>
                </div>
                <p className="text-[10px] text-zinc-400 font-mono leading-snug">Clean studio desk with segmented story goals & pipeline.</p>
              </div>

              <div
                onClick={() => setThemeMode('scifi')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition text-left space-y-1 ${
                  themeMode === 'scifi' 
                    ? 'border-red-500 bg-red-950/20 shadow-[0_0_15px_rgba(229,43,43,0.3)]' 
                    : 'border-[#1f2738] bg-[#111420] hover:border-zinc-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Orbit className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-bold text-white font-mono">Command Deck HUD</span>
                </div>
                <p className="text-[10px] text-zinc-400 font-mono leading-snug">Futuristic cockpit with 3D status gauge & holographic dials.</p>
              </div>
            </div>

            {/* Accent Color Picker */}
            <div className="space-y-2">
              <label className="block text-[10px] font-mono uppercase text-zinc-400">Accent Color</label>
              <div className="flex items-center gap-3">
                {[
                  { name: 'Crimson Red', hex: '#e52b2b' },
                  { name: 'Solar Amber', hex: '#f59e0b' },
                  { name: 'Cyber Cyan', hex: '#06b6d4' },
                  { name: 'Neon Emerald', hex: '#10b981' },
                  { name: 'Royal Purple', hex: '#8b5cf6' },
                ].map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setAccentColor(c.hex)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      accentColor === c.hex ? 'scale-125 border-white shadow-lg' : 'border-transparent hover:scale-110'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
                <input 
                  type="color" 
                  value={accentColor} 
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                />
              </div>
            </div>

            {/* Glow Intensity Slider */}
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>Glow Intensity</span>
                <span className="text-white font-bold">{glowIntensity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={glowIntensity}
                onChange={(e) => setGlowIntensity(Number(e.target.value))}
                className="w-full accent-red-500 cursor-pointer"
              />
            </div>

            <div className="pt-3 flex items-center justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-zinc-400 hover:text-white transition"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs transition shadow-[0_0_15px_#ef4444] flex items-center gap-2"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Launch Studio</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
