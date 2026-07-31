import React, { useState } from 'react';
import { downloadPng, downloadJpg, shareStrip, printStrip } from '../utils/export';
import { Download, Share2, Printer, RotateCcw, Check, Sparkles } from 'lucide-react';

interface ExportViewProps {
  canvas: HTMLCanvasElement | null;
  onNewSession: () => void;
}

export const ExportView: React.FC<ExportViewProps> = ({ canvas, onNewSession }) => {
  const [downloaded, setDownloaded] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState<boolean | null>(null);

  const handleDownloadPng = () => {
    if (!canvas) return;
    downloadPng(canvas, `snapstrip_${Date.now()}.png`);
    setDownloaded('PNG');
    setTimeout(() => setDownloaded(null), 3000);
  };

  const handleDownloadJpg = () => {
    if (!canvas) return;
    downloadJpg(canvas, `snapstrip_${Date.now()}.jpg`);
    setDownloaded('JPG');
    setTimeout(() => setDownloaded(null), 3000);
  };

  const handleShare = async () => {
    if (!canvas) return;
    const ok = await shareStrip(canvas);
    setShareSuccess(ok);
    setTimeout(() => setShareSuccess(null), 3000);
  };

  const handlePrint = () => {
    if (!canvas) return;
    printStrip(canvas);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-pop-in">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Your Photo Strip is Ready!</span>
        </div>
        <h2 className="font-heading font-black text-3xl sm:text-4xl text-purple-950">
          Save & Share Your <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 bg-clip-text text-transparent">SnapStrip</span>
        </h2>
        <p className="text-purple-700/80 text-sm">High resolution (1600×2400) print-ready photobooth strip.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* Rendered Canvas / Image Display */}
        <div className="flex justify-center">
          {canvas ? (
            <img
              src={canvas.toDataURL('image/png')}
              alt="Final SnapStrip"
              className="max-w-[320px] sm:max-w-[380px] rounded-2xl shadow-2xl border border-purple-100"
            />
          ) : (
            <div className="w-[320px] h-[480px] bg-purple-50 rounded-2xl flex items-center justify-center text-purple-400 font-bold text-sm">
              Rendering strip...
            </div>
          )}
        </div>

        {/* Export Options Panel */}
        <div className="glass-panel p-6 rounded-3xl space-y-5">
          <h3 className="font-heading font-bold text-lg text-purple-900">Choose Export Format</h3>

          <div className="space-y-3">
            {/* Download PNG */}
            <button
              onClick={handleDownloadPng}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-heading font-bold text-sm shadow-md hover:scale-102 transition-transform flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                <span>Download High-Res PNG</span>
              </div>
              {downloaded === 'PNG' && (
                <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded text-xs">
                  <Check className="w-3.5 h-3.5" /> Saved
                </span>
              )}
            </button>

            {/* Download JPG */}
            <button
              onClick={handleDownloadJpg}
              className="w-full py-3.5 px-5 rounded-2xl bg-white border-2 border-purple-200 text-purple-900 font-heading font-bold text-sm hover:bg-purple-50 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-purple-600" />
                <span>Download Compact JPG (0.92)</span>
              </div>
              {downloaded === 'JPG' && (
                <span className="flex items-center gap-1 text-emerald-600 text-xs">
                  <Check className="w-3.5 h-3.5" /> Saved
                </span>
              )}
            </button>

            {/* Web Share */}
            <button
              onClick={handleShare}
              className="w-full py-3.5 px-5 rounded-2xl bg-white border-2 border-purple-200 text-purple-900 font-heading font-bold text-sm hover:bg-purple-50 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-pink-500" />
                <span>Share via Mobile / Apps</span>
              </div>
              {shareSuccess === true && <span className="text-emerald-600 text-xs font-bold">Shared!</span>}
            </button>

            {/* Browser Print */}
            <button
              onClick={handlePrint}
              className="w-full py-3.5 px-5 rounded-2xl bg-white border-2 border-purple-200 text-purple-900 font-heading font-bold text-sm hover:bg-purple-50 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-cyan-600" />
                <span>Print Photo Strip</span>
              </div>
            </button>
          </div>

          <div className="pt-4 border-t border-purple-100">
            <button
              onClick={onNewSession}
              className="w-full py-3 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-800 font-heading font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Start New Photobooth Session</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
