import React from 'react';
import type { ChangeEvent } from 'react';
import type { BackgroundConfig, BackgroundType, FilterId } from '../types/photobooth';
import { FILTER_PRESETS } from '../utils/filters';
import { Sparkles, Camera, Users, Upload, Heart, Check } from 'lucide-react';

interface LandingSetupProps {
  background: BackgroundConfig;
  onChangeBackground: (bg: BackgroundConfig) => void;
  selectedFilter: FilterId;
  onChangeFilter: (filter: FilterId) => void;
  onStartShoot: () => void;
  onOpenCoOp: () => void;
  onUploadPhotos: (files: FileList) => void;
}

const BACKGROUND_OPTIONS: { type: BackgroundType; label: string; previewClass: string }[] = [
  { type: 'holographic', label: 'Holographic Sheen', previewClass: 'holographic-bg' },
  { type: 'lace', label: 'Soft Pink Lace', previewClass: 'bg-[#fce4ec]' },
  { type: 'mint', label: 'Mint Cream', previewClass: 'bg-[#f0fff4]' },
  { type: 'starry', label: 'Starry Night', previewClass: 'bg-[#0d1b2a]' },
];

export const LandingSetup: React.FC<LandingSetupProps> = ({
  background,
  onChangeBackground,
  selectedFilter,
  onChangeFilter,
  onStartShoot,
  onOpenCoOp,
  onUploadPhotos,
}) => {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadPhotos(e.target.files);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-pop-in">
      {/* Hero Section */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100/80 text-pink-700 text-xs font-bold shadow-xs">
          <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
          <span>Physical K-Pop Machine Style</span>
        </div>
        <h2 className="font-heading font-black text-4xl sm:text-5xl text-purple-950 tracking-tight">
          Create Your <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 bg-clip-text text-transparent">Iridescent Photo Strip</span>
        </h2>
        <p className="text-purple-700/80 max-w-xl mx-auto text-sm sm:text-base">
          Pose for 6 quick shots, customize with cute stickers & filters, and download or print your polaroid strip in seconds!
        </p>
      </div>

      {/* Main Options Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Step 1: Background Theme */}
        <div className="glass-panel p-6 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-heading font-bold text-lg text-purple-900">1. Select Strip Background</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {BACKGROUND_OPTIONS.map((opt) => {
              const isSelected = background.type === opt.type;
              return (
                <button
                  key={opt.type}
                  onClick={() => onChangeBackground({ type: opt.type })}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all relative overflow-hidden ${
                    isSelected
                      ? 'border-purple-600 ring-2 ring-purple-400/50 bg-purple-50/50'
                      : 'border-purple-100 hover:border-purple-300 bg-white'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl ${opt.previewClass} border border-black/10 shrink-0`} />
                  <span className="text-xs font-bold text-purple-950">{opt.label}</span>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom color input */}
          <div className="pt-2 flex items-center gap-3 border-t border-purple-100">
            <span className="text-xs font-semibold text-purple-700">Custom Pastel Color:</span>
            <input
              type="color"
              value={background.color || '#ffafbd'}
              onChange={(e) => onChangeBackground({ type: 'custom', color: e.target.value })}
              className="w-8 h-8 rounded-lg cursor-pointer border border-purple-200"
            />
          </div>
        </div>

        {/* Step 2: Camera Filter */}
        <div className="glass-panel p-6 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-purple-600" />
            <h3 className="font-heading font-bold text-lg text-purple-900">2. Select Initial Filter</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {FILTER_PRESETS.map((filter) => {
              const isSelected = selectedFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => onChangeFilter(filter.id)}
                  className={`p-2 rounded-xl text-center border text-xs font-semibold transition-all ${
                    isSelected
                      ? 'border-pink-500 bg-pink-50 text-pink-900 ring-2 ring-pink-300'
                      : 'border-purple-100 text-purple-800 hover:bg-purple-50 bg-white'
                  }`}
                >
                  {filter.name}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-purple-500 text-center italic">
            You can also adjust filters and drag frames after capturing!
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button
          onClick={onStartShoot}
          className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 text-white font-heading font-black text-lg shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
        >
          <Camera className="w-6 h-6" />
          <span>Enter Photobooth (6 Shots)</span>
        </button>

        <button
          onClick={onOpenCoOp}
          className="w-full sm:w-auto px-6 py-4 rounded-full bg-white border-2 border-purple-300 text-purple-900 font-heading font-bold text-base shadow-sm hover:bg-purple-50 transition-all flex items-center justify-center gap-2"
        >
          <Users className="w-5 h-5 text-purple-600" />
          <span>2-Player Co-Op Room</span>
        </button>
      </div>

      {/* Fallback Upload */}
      <div className="text-center pt-2">
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold cursor-pointer transition-colors border border-purple-200/60">
          <Upload className="w-4 h-4" />
          <span>No webcam? Upload 6 photos from disk</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};
