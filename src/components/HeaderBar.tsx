import React from 'react';
import type { AppState } from '../types/photobooth';
import { Camera, Sparkles, Users, ShieldCheck } from 'lucide-react';

interface HeaderBarProps {
  currentState: AppState;
  onNavigate: (state: AppState) => void;
  onOpenCoOp: () => void;
  isCoOpActive?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentState,
  onNavigate,
  onOpenCoOp,
  isCoOpActive = false,
}) => {
  const steps: { state: AppState; label: string }[] = [
    { state: 'SETUP', label: '1. Theme' },
    { state: 'COUNTDOWN', label: '2. Booth' },
    { state: 'REVIEW', label: '3. Customize' },
    { state: 'EXPORT', label: '4. Export' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-purple-100 px-4 py-3 shadow-xs">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <div
          onClick={() => onNavigate('SETUP')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-400 to-cyan-300 p-0.5 shadow-sm group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Camera className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div>
            <h1 className="font-heading font-black text-xl tracking-tight bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 bg-clip-text text-transparent flex items-center gap-1">
              SnapStrip <Sparkles className="w-4 h-4 text-pink-400 fill-pink-400" />
            </h1>
            <p className="text-[11px] font-medium text-purple-400 -mt-1">K-Pop Photobooth</p>
          </div>
        </div>

        {/* Progress Navigation Steps */}
        <nav className="hidden sm:flex items-center gap-1 bg-purple-50/80 p-1 rounded-full border border-purple-100">
          {steps.map((step) => {
            const isActive = currentState === step.state;
            return (
              <button
                key={step.state}
                onClick={() => onNavigate(step.state)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-xs'
                    : 'text-purple-700 hover:bg-purple-100/60'
                }`}
              >
                {step.label}
              </button>
            );
          })}
        </nav>

        {/* Right actions: Privacy badge & Co-op button */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1 text-[11px] font-medium text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200/50">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
            <span>Photos stay on device</span>
          </div>

          <button
            onClick={onOpenCoOp}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs ${
              isCoOpActive
                ? 'bg-emerald-500 text-white ring-2 ring-emerald-300'
                : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:brightness-110'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{isCoOpActive ? 'Co-Op Active' : '2-Player Co-Op'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
