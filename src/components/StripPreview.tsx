import React, { useEffect, useRef, useState } from 'react';
import type {
  FrameItem,
  LayoutConfig,
  BackgroundConfig,
  FilterId,
  StripMeta,
  Sticker,
} from '../types/photobooth';
import { composeStrip, DEFAULT_LAYOUT } from '../utils/canvasCompose';
import { Loader2 } from 'lucide-react';

interface StripPreviewProps {
  frames: FrameItem[];
  layout?: LayoutConfig;
  background: BackgroundConfig;
  filterId: FilterId;
  meta: StripMeta;
  stickers: Sticker[];
  onCanvasGenerated?: (canvas: HTMLCanvasElement) => void;
}

export const StripPreview: React.FC<StripPreviewProps> = ({
  frames,
  layout = DEFAULT_LAYOUT,
  background,
  filterId,
  meta,
  stickers,
  onCanvasGenerated,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsComposing(true);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const canvas = await composeStrip(
          frames,
          layout,
          background,
          filterId,
          meta,
          stickers,
          2 // 2x high resolution
        );

        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          canvas.className = 'w-full h-auto rounded-2xl shadow-2xl border border-purple-100';
          containerRef.current.appendChild(canvas);
        }

        if (onCanvasGenerated) {
          onCanvasGenerated(canvas);
        }
      } catch (err) {
        console.error('Failed to compose strip canvas:', err);
      } finally {
        setIsComposing(false);
      }
    }, 150); // 150ms debounce to prevent thrashing

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [frames, layout, background, filterId, meta, stickers, onCanvasGenerated]);

  return (
    <div className="relative flex justify-center items-center p-2">
      {/* Loading Overlay */}
      {isComposing && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/40 backdrop-blur-xs rounded-2xl">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-900 text-white text-xs font-bold shadow-md">
            <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
            <span>Composing Strip...</span>
          </div>
        </div>
      )}

      {/* Rendered Canvas Container */}
      <div
        id="printable-strip"
        ref={containerRef}
        className="w-full max-w-[380px] sm:max-w-[440px] aspect-[2/3] transition-all"
      />
    </div>
  );
};
