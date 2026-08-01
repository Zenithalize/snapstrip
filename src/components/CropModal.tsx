import React, { useState, useRef, useEffect } from 'react';
import type { FrameItem } from '../types/photobooth';
import { Crop, RotateCw, ZoomIn, Check, X, Move } from 'lucide-react';

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  frame: FrameItem | null;
  slotIdx: number;
  onSaveCrop: (slotIdx: number, croppedDataUrl: string) => void;
}

export const CropModal: React.FC<CropModalProps> = ({
  isOpen,
  onClose,
  frame,
  slotIdx,
  onSaveCrop,
}) => {
  const [zoom, setZoom] = useState(1.0);
  const [panX, setPanX] = useState(0); // -100 to 100
  const [panY, setPanY] = useState(0); // -100 to 100
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [isDragging, setIsDragging] = useState(false);
  const startPointerRef = useRef<{ x: number; y: number; startPanX: number; startPanY: number }>({
    x: 0,
    y: 0,
    startPanX: 0,
    startPanY: 0,
  });

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Reset controls when a new frame is opened for cropping
  useEffect(() => {
    if (isOpen) {
      setZoom(1.0);
      setPanX(0);
      setPanY(0);
      setRotation(0);
    }
  }, [isOpen, frame]);

  // Render cropped preview onto canvas
  useEffect(() => {
    if (!isOpen || !frame || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // 4:3 aspect ratio canvas (720x540 for crisp cropper output)
      canvas.width = 720;
      canvas.height = 540;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      // Background fill
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Translate to center
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // Apply rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // Apply pan offsets
      const offsetX = (panX / 100) * (canvas.width / 2);
      const offsetY = (panY / 100) * (canvas.height / 2);
      ctx.translate(offsetX, offsetY);

      // Apply zoom scale
      ctx.scale(zoom, zoom);

      // Draw image centered
      const imgRatio = img.width / img.height;
      const canvasRatio = canvas.width / canvas.height;

      let drawW = canvas.width;
      let drawH = canvas.height;

      if (imgRatio > canvasRatio) {
        drawH = canvas.height;
        drawW = canvas.height * imgRatio;
      } else {
        drawW = canvas.width;
        drawH = canvas.width / imgRatio;
      }

      if (frame.mirrored) {
        ctx.scale(-1, 1);
      }

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    };

    img.src = frame.dataUrl;
  }, [isOpen, frame, zoom, panX, panY, rotation]);

  if (!isOpen || !frame) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startPointerRef.current = {
      x: e.clientX,
      y: e.clientY,
      startPanX: panX,
      startPanY: panY,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startPointerRef.current.x;
    const deltaY = e.clientY - startPointerRef.current.y;

    const newPanX = Math.max(-100, Math.min(100, startPointerRef.current.startPanX + (deltaX / 2)));
    const newPanY = Math.max(-100, Math.min(100, startPointerRef.current.startPanY + (deltaY / 2)));

    setPanX(newPanX);
    setPanY(newPanY);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    if (previewCanvasRef.current) {
      const croppedDataUrl = previewCanvasRef.current.toDataURL('image/jpeg', 0.9);
      onSaveCrop(slotIdx, croppedDataUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-sm animate-pop-in">
      <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl border border-purple-100 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-purple-50 text-purple-400 hover:text-purple-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 p-0.5 shadow-sm">
            <div className="w-full h-full bg-white rounded-[12px] flex items-center justify-center">
              <Crop className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <div>
            <h3 className="font-heading font-black text-lg text-purple-950">Crop Shot #{slotIdx + 1}</h3>
            <p className="text-xs text-purple-600 font-medium">Drag, zoom, & adjust crop framing</p>
          </div>
        </div>

        {/* Live Canvas Crop Preview Container */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border-2 border-purple-200 cursor-grab active:cursor-grabbing touch-none select-none shadow-inner group"
        >
          <canvas ref={previewCanvasRef} className="w-full h-full object-contain pointer-events-none" />

          {/* Grid Overlay Guide */}
          <div className="absolute inset-0 border border-white/30 pointer-events-none grid grid-cols-3 grid-rows-3">
            <div className="border-r border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-b border-white/20" />
            <div className="border-r border-white/20" />
            <div className="border-r border-white/20" />
            <div />
          </div>

          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Move className="w-3 h-3 text-pink-400" /> Drag to pan photo
          </div>
        </div>

        {/* Control Sliders & Rotation */}
        <div className="space-y-3 bg-purple-50 p-4 rounded-2xl border border-purple-100 text-xs font-bold text-purple-900">
          {/* Zoom Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-purple-800">
              <span className="flex items-center gap-1"><ZoomIn className="w-3.5 h-3.5 text-purple-600" /> Zoom:</span>
              <span>{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>

          {/* Rotation Button & Reset */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
              className="px-3 py-1.5 rounded-xl bg-white text-purple-800 border border-purple-200 hover:bg-purple-100 flex items-center gap-1.5 text-xs shadow-2xs transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5 text-purple-600" />
              <span>Rotate 90°</span>
            </button>

            <button
              onClick={() => {
                setZoom(1.0);
                setPanX(0);
                setPanY(0);
                setRotation(0);
              }}
              className="text-[11px] text-purple-600 hover:text-purple-900 underline font-semibold"
            >
              Reset Controls
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-full border border-purple-200 text-purple-700 font-bold text-xs hover:bg-purple-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-heading font-bold text-xs shadow-md hover:scale-102 transition-all flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Apply Crop</span>
          </button>
        </div>
      </div>
    </div>
  );
};
