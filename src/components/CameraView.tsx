import React, { useEffect } from 'react';
import type { CountdownState, FilterId, FrameItem } from '../types/photobooth';
import { getFilterCss } from '../utils/filters';
import { RefreshCw, FlipHorizontal, AlertTriangle, Play, RotateCcw } from 'lucide-react';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isReady: boolean;
  error: string | null;
  currentShot: number;
  totalShots: number;
  countdownValue: number;
  countdownState: CountdownState;
  flashActive: boolean;
  capturedFrames: FrameItem[];
  filterId: FilterId;
  onStartShoot: () => void;
  onRetakeLastShot: () => void;
  onSwitchCamera: () => void;
  onStartCamera: () => void;
  isMirroredPreview: boolean;
  onToggleMirrorPreview: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  isReady,
  error,
  currentShot,
  totalShots,
  countdownValue,
  countdownState,
  flashActive,
  capturedFrames,
  filterId,
  onStartShoot,
  onRetakeLastShot,
  onSwitchCamera,
  onStartCamera,
  isMirroredPreview,
  onToggleMirrorPreview,
}) => {
  useEffect(() => {
    if (!isReady && !error) {
      onStartCamera();
    }
  }, [isReady, error, onStartCamera]);

  const activeFilterCss = getFilterCss(filterId);
  const isCounting = countdownState === 'COUNTING';

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">
      {/* Top Banner / Status */}
      <div className="flex items-center justify-between bg-white/70 backdrop-blur-md px-4 py-2 rounded-2xl border border-purple-100 shadow-xs">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isReady ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
          <span className="text-xs font-bold text-purple-900">
            {isReady ? 'Camera Live' : 'Initializing Camera...'}
          </span>
        </div>

        <div className="text-xs font-heading font-black text-purple-700 bg-purple-100/80 px-3 py-1 rounded-full">
          Shot {Math.min(currentShot + 1, totalShots)} of {totalShots}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMirrorPreview}
            title="Toggle Preview Mirror"
            className="p-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors"
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>
          <button
            onClick={onSwitchCamera}
            title="Switch Camera"
            className="p-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Studio Workspace: Camera View + Sidebar */}
      <div className="grid md:grid-cols-4 gap-4 items-start">
        {/* Main Camera Screen (3 cols) */}
        <div className="md:col-span-3 relative rounded-3xl overflow-hidden bg-slate-950 aspect-[4/3] shadow-xl border-4 border-white">
          {/* Flash Overlay */}
          {flashActive && (
            <div className="absolute inset-0 bg-white z-50 animate-flash pointer-events-none" />
          )}

          {/* Decorative K-Pop Machine Border */}
          <div
            className={`absolute inset-0 z-20 pointer-events-none transition-all duration-300 rounded-3xl ${
              isCounting ? 'ring-4 ring-emerald-400 ring-offset-2 ring-offset-black/20' : 'ring-1 ring-purple-300/40'
            }`}
          >
            {/* Corner Heart Icons */}
            <div className="absolute top-3 left-3 text-pink-400 text-lg drop-shadow-sm">💖</div>
            <div className="absolute top-3 right-3 text-pink-400 text-lg drop-shadow-sm">✨</div>
            <div className="absolute bottom-3 left-3 text-pink-400 text-lg drop-shadow-sm">⭐</div>
            <div className="absolute bottom-3 right-3 text-pink-400 text-lg drop-shadow-sm">🎀</div>
          </div>

          {/* Camera Error Display */}
          {error ? (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-purple-950 text-white space-y-4">
              <AlertTriangle className="w-12 h-12 text-amber-400" />
              <h3 className="font-heading font-bold text-xl">Camera Access Needed</h3>
              <p className="text-sm text-purple-200 max-w-md">{error}</p>
              <button
                onClick={onStartCamera}
                className="px-6 py-2.5 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs"
              >
                Retry Camera
              </button>
            </div>
          ) : (
            /* Live Video Stream */
            <video
              ref={videoRef}
              playsInline
              muted
              style={{
                filter: activeFilterCss !== 'none' ? activeFilterCss : undefined,
                transform: isMirroredPreview ? 'scaleX(-1)' : 'none',
              }}
              className="w-full h-full object-cover rounded-3xl"
            />
          )}

          {/* Countdown Overlay Number */}
          {isCounting && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
              <div
                key={countdownValue}
                className="font-heading font-black text-[180px] text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] animate-countdown select-none"
              >
                {countdownValue}
              </div>
            </div>
          )}

          {/* Between Shots Overlay */}
          {countdownState === 'WAITING' && isReady && !isCounting && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xs space-y-4">
              <div className="text-center space-y-1">
                <span className="inline-block px-3 py-1 rounded-full bg-pink-500/80 text-white text-xs font-bold">
                  Ready to Shoot?
                </span>
                <h3 className="font-heading font-black text-3xl text-white">
                  Pose for Shot {currentShot + 1} of {totalShots}
                </h3>
              </div>
              <button
                onClick={onStartShoot}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 text-white font-heading font-black text-lg shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
              >
                <Play className="w-6 h-6 fill-white" />
                <span>Start Countdown</span>
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Captured Thumbnail Strip (1 col) */}
        <div className="glass-panel p-4 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-heading font-bold text-xs text-purple-900 uppercase tracking-wider">
              Strip Progress
            </h4>
            {capturedFrames.some((f) => !f.isBlank) && (
              <button
                onClick={onRetakeLastShot}
                title="Retake Last Shot"
                className="text-[11px] font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Retake</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-1 gap-2.5">
            {capturedFrames.map((frame, idx) => {
              const isCurrent = currentShot === idx;
              return (
                <div
                  key={frame.id}
                  className={`relative rounded-xl overflow-hidden aspect-[4/3] border transition-all ${
                    isCurrent
                      ? 'border-purple-600 ring-2 ring-purple-400 shadow-sm scale-102'
                      : 'border-purple-100 bg-purple-50/50'
                  }`}
                >
                  {!frame.isBlank ? (
                    <img
                      src={frame.dataUrl}
                      alt={`Shot ${idx + 1}`}
                      className="w-full h-full object-cover animate-pop-in"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-purple-300 font-bold text-xs">
                      {idx + 1}
                    </div>
                  )}
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold">
                    #{idx + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
