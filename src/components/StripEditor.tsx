import React, { useState, useRef } from 'react';
import type {
  FrameItem,
  BackgroundConfig,
  FilterId,
  StripMeta,
  Sticker,
  BackgroundType,
  OverlayFont,
} from '../types/photobooth';
import { StripPreview } from './StripPreview';
import { FilterPicker } from './FilterPicker';
import {
  FlipHorizontal,
  RotateCcw,
  EyeOff,
  Type,
  Sticker as StickerIcon,
  Palette,
  ArrowRight,
  Trash2,
  Move,
  Maximize2,
  RotateCw,
} from 'lucide-react';

interface StripEditorProps {
  frames: FrameItem[];
  onReorderFrames: (frames: FrameItem[]) => void;
  onRetakeSlot: (slotIdx: number) => void;
  onToggleMirrorSlot: (slotIdx: number) => void;
  onToggleBlankSlot: (slotIdx: number) => void;
  background: BackgroundConfig;
  onChangeBackground: (bg: BackgroundConfig) => void;
  selectedFilter: FilterId;
  onChangeFilter: (f: FilterId) => void;
  meta: StripMeta;
  onChangeMeta: (m: StripMeta) => void;
  stickers: Sticker[];
  onAddSticker: (sticker: Sticker) => void;
  onUpdateSticker: (sticker: Sticker) => void;
  onRemoveSticker: (id: string) => void;
  onProceedToExport: () => void;
  onCanvasGenerated?: (canvas: HTMLCanvasElement) => void;
}

const PRESET_STICKERS = [
  {
    name: 'Glitter Heart',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><defs><linearGradient id="gh" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ff758c"/><stop offset="100%" stop-color="#ff7eb3"/></linearGradient></defs><path fill="url(#gh)" stroke="#ffffff" stroke-width="4" d="M50 88.7L43.8 83C21.8 63 7.3 49.8 7.3 33.6C7.3 20.3 17.7 10 31 10C38.5 10 45.7 13.5 50 19C54.3 13.5 61.5 10 69 10C82.3 10 92.7 20.3 92.7 33.6C92.7 49.8 78.2 63 56.2 83.1L50 88.7Z"/><circle cx="35" cy="28" r="4" fill="#ffffff" opacity="0.8"/></svg>`,
  },
  {
    name: 'Gold Starburst',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><defs><linearGradient id="gs" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ffe066"/><stop offset="100%" stop-color="#f59e0b"/></linearGradient></defs><polygon fill="url(#gs)" stroke="#ffffff" stroke-width="3" points="50,5 64,36 98,39 72,62 80,95 50,77 20,95 28,62 2,39 36,36"/></svg>`,
  },
  {
    name: 'Holo Sparkles',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><defs><linearGradient id="hs" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="50%" stop-color="#c084fc"/><stop offset="100%" stop-color="#f472b6"/></linearGradient></defs><path fill="url(#hs)" stroke="#ffffff" stroke-width="3" d="M50 0L59 38L97 47L59 56L50 94L41 56L3 47L41 38Z"/></svg>`,
  },
  {
    name: 'Pastel Blossom',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="14" fill="#fbbf24" stroke="#ffffff" stroke-width="2"/><circle cx="50" cy="22" r="14" fill="#f472b6" stroke="#ffffff" stroke-width="2"/><circle cx="78" cy="50" r="14" fill="#f472b6" stroke="#ffffff" stroke-width="2"/><circle cx="50" cy="78" r="14" fill="#f472b6" stroke="#ffffff" stroke-width="2"/><circle cx="22" cy="50" r="14" fill="#f472b6" stroke="#ffffff" stroke-width="2"/></svg>`,
  },
  {
    name: 'Tiara Crown',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><defs><linearGradient id="tc" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e879f9"/><stop offset="100%" stop-color="#818cf8"/></linearGradient></defs><polygon fill="url(#tc)" stroke="#ffffff" stroke-width="3" points="10,75 20,30 40,52 50,20 60,52 80,30 90,75"/><circle cx="50" cy="18" r="4" fill="#fef08a"/><circle cx="20" cy="28" r="4" fill="#fef08a"/><circle cx="80" cy="28" r="4" fill="#fef08a"/></svg>`,
  },
  {
    name: 'Kawaii Bunny',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="65" r="28" fill="#ffffff" stroke="#c084fc" stroke-width="4"/><ellipse cx="36" cy="25" rx="8" ry="20" fill="#ffffff" stroke="#c084fc" stroke-width="4"/><ellipse cx="64" cy="25" rx="8" ry="20" fill="#ffffff" stroke="#c084fc" stroke-width="4"/><ellipse cx="36" cy="27" rx="4" ry="14" fill="#f472b6"/><ellipse cx="64" cy="27" rx="4" ry="14" fill="#f472b6"/><circle cx="42" cy="62" r="3" fill="#2d1b69"/><circle cx="58" cy="62" r="3" fill="#2d1b69"/><ellipse cx="50" cy="67" rx="2.5" ry="1.5" fill="#f472b6"/><ellipse cx="35" cy="68" rx="4" ry="2.5" fill="#ffb7d5"/><ellipse cx="65" cy="68" rx="4" ry="2.5" fill="#ffb7d5"/></svg>`,
  },
  {
    name: 'Coquette Bow',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><path fill="#f472b6" stroke="#ffffff" stroke-width="3" d="M50 42 C30 15, 10 42, 45 50 C10 58, 30 85, 50 58 C70 85, 90 58, 55 50 C90 42, 70 15, 50 42 Z"/><circle cx="50" cy="50" r="6" fill="#db2777" stroke="#ffffff" stroke-width="2"/></svg>`,
  },
  {
    name: 'Glossy Cherry',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="35" cy="65" r="18" fill="#dc2626" stroke="#ffffff" stroke-width="2"/><circle cx="70" cy="72" r="18" fill="#dc2626" stroke="#ffffff" stroke-width="2"/><circle cx="28" cy="58" r="4" fill="#ffffff" opacity="0.7"/><circle cx="63" cy="65" r="4" fill="#ffffff" opacity="0.7"/><path stroke="#16a34a" stroke-width="5" fill="none" stroke-linecap="round" d="M35 50 Q 52 18 65 15 M70 56 Q 58 22 65 15"/></svg>`,
  },
  {
    name: 'Cute Speech',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect x="10" y="20" width="80" height="50" rx="25" fill="#fbcfe8" stroke="#ffffff" stroke-width="4"/><polygon points="35,70 45,70 30,88" fill="#fbcfe8" stroke="#ffffff" stroke-width="2"/><text x="50" y="52" font-family="sans-serif" font-weight="900" font-size="18" fill="#9d174d" text-anchor="middle">귀여워 💕</text></svg>`,
  },
];

const PASTEL_COLORS = [
  '#2d1b69', // Deep Purple
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ffffff', // White
  '#000000', // Black
];

export const StripEditor: React.FC<StripEditorProps> = ({
  frames,
  onRetakeSlot,
  onToggleMirrorSlot,
  onToggleBlankSlot,
  background,
  onChangeBackground,
  selectedFilter,
  onChangeFilter,
  meta,
  onChangeMeta,
  stickers,
  onAddSticker,
  onUpdateSticker,
  onRemoveSticker,
  onProceedToExport,
  onCanvasGenerated,
}) => {
  const [activeTab, setActiveTab] = useState<'filter' | 'bg' | 'stickers' | 'text'>('filter');
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const previewWrapperRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);

  const handleAddPresetSticker = (name: string, svg: string) => {
    let formattedSvg = svg;
    if (!formattedSvg.includes('xmlns=')) {
      formattedSvg = formattedSvg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"');
    }
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(formattedSvg)}`;

    const newSticker: Sticker = {
      id: `sticker-${Date.now()}`,
      name,
      svg: formattedSvg,
      src: dataUrl,
      xPercent: 50 + (Math.random() * 20 - 10),
      yPercent: 50 + (Math.random() * 20 - 10),
      scale: 1.0,
      rotation: Math.floor(Math.random() * 30 - 15),
    };
    onAddSticker(newSticker);
    setSelectedStickerId(newSticker.id);
  };

  const handleStickerParamChange = (id: string, updates: Partial<Sticker>) => {
    const target = stickers.find((s) => s.id === id);
    if (!target) return;
    const updated = { ...target, ...updates };
    onUpdateSticker(updated);
  };

  // Dragging sticker logic on preview container
  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    setSelectedStickerId(id);
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent, id: string) => {
    if (!isDraggingRef.current || !previewWrapperRef.current) return;
    const rect = previewWrapperRef.current.getBoundingClientRect();
    const xPercent = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const yPercent = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));
    handleStickerParamChange(id, { xPercent, yPercent });
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const activeSticker = stickers.find((s) => s.id === selectedStickerId);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6">
      {/* Editor Responsive Layout Grid (Order optimized for Mobile vs Desktop) */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Center Column: Live Strip Preview (Order 1 on Mobile, Order 2 on Desktop) */}
        <div className="lg:col-span-5 flex flex-col items-center order-1 lg:order-2">
          <div ref={previewWrapperRef} className="relative w-full max-w-[340px] sm:max-w-[440px]">
            <StripPreview
              frames={frames}
              background={background}
              filterId={selectedFilter}
              meta={meta}
              stickers={stickers}
              onCanvasGenerated={onCanvasGenerated}
            />

            {/* Interactive Sticker Overlay Handles */}
            {stickers.map((stk) => {
              const isSelected = selectedStickerId === stk.id;
              return (
                <div
                  key={stk.id}
                  onPointerDown={(e) => handlePointerDown(e, stk.id)}
                  onPointerMove={(e) => handlePointerMove(e, stk.id)}
                  onPointerUp={handlePointerUp}
                  style={{
                    left: `${stk.xPercent}%`,
                    top: `${stk.yPercent}%`,
                    transform: `translate(-50%, -50%) rotate(${stk.rotation || 0}deg) scale(${stk.scale || 1})`,
                  }}
                  className={`absolute z-30 cursor-grab active:cursor-grabbing touch-none select-none transition-shadow ${
                    isSelected ? 'ring-2 ring-pink-500 ring-offset-2 rounded-xl bg-white/20' : ''
                  }`}
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: stk.svg }}
                    className="w-14 h-14 sm:w-16 sm:h-16 pointer-events-none drop-shadow-md"
                  />
                  {isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveSticker(stk.id);
                        setSelectedStickerId(null);
                      }}
                      className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Customization Controls (Order 2 on Mobile, Order 3 on Desktop) */}
        <div className="lg:col-span-4 space-y-4 order-2 lg:order-3">
          <div className="glass-panel p-4 sm:p-5 rounded-3xl space-y-4">
            {/* Customization Tabs */}
            <div className="flex items-center gap-1 bg-purple-50 p-1 rounded-2xl border border-purple-100 text-xs font-bold">
              <button
                onClick={() => setActiveTab('filter')}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  activeTab === 'filter' ? 'bg-white text-purple-900 shadow-xs' : 'text-purple-600'
                }`}
              >
                Filters
              </button>
              <button
                onClick={() => setActiveTab('bg')}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  activeTab === 'bg' ? 'bg-white text-purple-900 shadow-xs' : 'text-purple-600'
                }`}
              >
                Theme
              </button>
              <button
                onClick={() => setActiveTab('stickers')}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  activeTab === 'stickers' ? 'bg-white text-purple-900 shadow-xs' : 'text-purple-600'
                }`}
              >
                Stickers
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  activeTab === 'text' ? 'bg-white text-purple-900 shadow-xs' : 'text-purple-600'
                }`}
              >
                Text
              </button>
            </div>

            {/* Tab 1: Filters */}
            {activeTab === 'filter' && (
              <div className="space-y-3">
                <FilterPicker
                  selectedFilter={selectedFilter}
                  onSelectFilter={onChangeFilter}
                  previewImageSrc={frames.find((f) => !f.isBlank)?.dataUrl}
                />
              </div>
            )}

            {/* Tab 2: Background Theme */}
            {activeTab === 'bg' && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                  <Palette className="w-3.5 h-3.5 text-purple-600" />
                  <span>Strip Background Theme</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  {(['holographic', 'lace', 'mint', 'starry'] as BackgroundType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => onChangeBackground({ type: t })}
                      className={`p-2.5 rounded-xl border text-left capitalize transition-all ${
                        background.type === t
                          ? 'border-purple-600 ring-2 ring-purple-300 bg-purple-50'
                          : 'border-purple-100 bg-white hover:bg-purple-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Stickers */}
            {activeTab === 'stickers' && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                  <StickerIcon className="w-3.5 h-3.5 text-pink-500" />
                  <span>Add K-Pop Cute Stickers</span>
                </div>

                {/* Sticker Selection Cards Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_STICKERS.map((stk) => (
                    <button
                      key={stk.name}
                      onClick={() => handleAddPresetSticker(stk.name, stk.svg)}
                      className="p-2 bg-white rounded-2xl border border-purple-100 hover:border-pink-300 hover:shadow-sm transition-all flex flex-col items-center gap-1.5 group shrink-0 overflow-hidden"
                    >
                      <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0 overflow-hidden pointer-events-none">
                        <div
                          dangerouslySetInnerHTML={{ __html: stk.svg }}
                          className="w-full h-full max-w-full max-h-full object-contain group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-purple-900 tracking-tight text-center leading-tight truncate w-full">
                        {stk.name}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Selected Sticker Controls */}
                {activeSticker && (
                  <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200/70 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                      <span className="flex items-center gap-1">
                        <Move className="w-3.5 h-3.5 text-purple-600" />
                        <span>Adjust {activeSticker.name}</span>
                      </span>
                      <button
                        onClick={() => {
                          onRemoveSticker(activeSticker.id);
                          setSelectedStickerId(null);
                        }}
                        className="text-red-600 hover:text-red-700 flex items-center gap-1 text-[11px]"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>

                    {/* Position Sliders */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-purple-700">
                      <div className="space-y-1">
                        <span>Position X:</span>
                        <input
                          type="range"
                          min="10"
                          max="90"
                          value={activeSticker.xPercent || 50}
                          onChange={(e) =>
                            handleStickerParamChange(activeSticker.id, { xPercent: parseFloat(e.target.value) })
                          }
                          className="w-full h-1.5 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                      </div>
                      <div className="space-y-1">
                        <span>Position Y:</span>
                        <input
                          type="range"
                          min="10"
                          max="90"
                          value={activeSticker.yPercent || 50}
                          onChange={(e) =>
                            handleStickerParamChange(activeSticker.id, { yPercent: parseFloat(e.target.value) })
                          }
                          className="w-full h-1.5 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                      </div>
                    </div>

                    {/* Scale Control */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-purple-700">
                        <span className="flex items-center gap-1"><Maximize2 className="w-3 h-3" /> Size:</span>
                        <span>{Math.round((activeSticker.scale || 1) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.5"
                        step="0.1"
                        value={activeSticker.scale || 1}
                        onChange={(e) =>
                          handleStickerParamChange(activeSticker.id, { scale: parseFloat(e.target.value) })
                        }
                        className="w-full h-1.5 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                    </div>

                    {/* Rotation Control */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-purple-700">
                        <span className="flex items-center gap-1"><RotateCw className="w-3 h-3" /> Angle:</span>
                        <span>{activeSticker.rotation || 0}°</span>
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        step="5"
                        value={activeSticker.rotation || 0}
                        onChange={(e) =>
                          handleStickerParamChange(activeSticker.id, { rotation: parseInt(e.target.value) })
                        }
                        className="w-full h-1.5 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Custom Text Line */}
            {activeTab === 'text' && (
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                  <Type className="w-3.5 h-3.5 text-purple-600" />
                  <span>Footer Custom Text Overlay</span>
                </div>

                {/* Input Text */}
                <input
                  type="text"
                  maxLength={30}
                  placeholder="e.g. BFF Photobooth ✨"
                  value={meta.label || ''}
                  onChange={(e) => onChangeMeta({ ...meta, label: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-purple-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                />

                {/* Font Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-purple-700">Font Style:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Caveat', 'Playfair Display', 'Space Mono'] as OverlayFont[]).map((f) => (
                      <button
                        key={f}
                        onClick={() => onChangeMeta({ ...meta, font: f })}
                        className={`p-2 rounded-xl border text-center text-xs transition-all ${
                          meta.font === f
                            ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold'
                            : 'border-purple-100 bg-white text-purple-700'
                        }`}
                      >
                        {f === 'Caveat' ? 'Handwritten' : f === 'Playfair Display' ? 'Serif' : 'Mono'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-purple-700">Text Color:</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {PASTEL_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => onChangeMeta({ ...meta, textColor: c })}
                        style={{ backgroundColor: c }}
                        className={`w-6 h-6 rounded-full border border-black/20 transition-transform ${
                          meta.textColor === c ? 'scale-125 ring-2 ring-purple-400' : 'hover:scale-110'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Next Step: Proceed to Export */}
            <div className="pt-2">
              <button
                onClick={onProceedToExport}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 text-white font-heading font-black text-sm shadow-md hover:scale-102 transition-transform flex items-center justify-center gap-2"
              >
                <span>Proceed to Export & Share</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Left Column: Frame Slot Manager & Retake (Order 3 on Mobile, Order 1 on Desktop) */}
        <div className="lg:col-span-3 space-y-4 order-3 lg:order-1">
          <div className="glass-panel p-4 rounded-3xl space-y-3">
            <h3 className="font-heading font-bold text-sm text-purple-900 flex items-center gap-1.5">
              <span>Frame Slots & Actions</span>
            </h3>
            <div className="space-y-2.5">
              {frames.map((frame, idx) => (
                <div
                  key={frame.id}
                  className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-purple-100 shadow-xs"
                >
                  {/* Frame Thumbnail */}
                  <div className="w-16 h-12 rounded-xl overflow-hidden bg-purple-50 border border-purple-200 shrink-0 relative">
                    {!frame.isBlank ? (
                      <img
                        src={frame.dataUrl}
                        alt={`Slot ${idx + 1}`}
                        className={`w-full h-full object-cover ${frame.mirrored ? 'scale-x-[-1]' : ''}`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-purple-300">
                        Blank
                      </div>
                    )}
                    <div className="absolute top-0.5 left-0.5 bg-black/60 text-white text-[9px] font-bold px-1 rounded">
                      #{idx + 1}
                    </div>
                  </div>

                  {/* Slot Action Controls */}
                  <div className="flex-1 flex items-center justify-end gap-1">
                    <button
                      onClick={() => onRetakeSlot(idx)}
                      title="Retake this single shot"
                      className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onToggleMirrorSlot(idx)}
                      title="Toggle flip mirror"
                      className={`p-1.5 rounded-lg transition-colors ${
                        frame.mirrored ? 'bg-purple-600 text-white' : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
                      }`}
                    >
                      <FlipHorizontal className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onToggleBlankSlot(idx)}
                      title="Toggle blank slot"
                      className={`p-1.5 rounded-lg transition-colors ${
                        frame.isBlank ? 'bg-amber-500 text-white' : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
                      }`}
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
