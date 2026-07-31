import React, { useState } from 'react';
import type { CoOpRoom } from '../types/photobooth';
import { Users, Copy, Check, X, Sparkles, Play, AlertCircle } from 'lucide-react';

interface CoOpModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomState: CoOpRoom;
  error: string | null;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  onLeaveRoom: () => void;
  onStartCoOpShoot: () => void;
}

export const CoOpModal: React.FC<CoOpModalProps> = ({
  isOpen,
  onClose,
  roomState,
  error,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
  onStartCoOpShoot,
}) => {
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    if (roomState.code) {
      navigator.clipboard.writeText(roomState.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-sm animate-pop-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-6 shadow-2xl border border-purple-100 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-purple-50 text-purple-400 hover:text-purple-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 p-0.5 shadow-sm">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div>
            <h3 className="font-heading font-black text-xl text-purple-950">2-Player Co-Op Booth</h3>
            <p className="text-xs text-purple-600 font-medium">Take alternate shots with a friend online</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Active Room View */}
        {roomState.code ? (
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 text-center space-y-2">
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Room Code</span>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono font-black text-3xl text-purple-950 tracking-widest">
                  {roomState.code}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 rounded-xl bg-white text-purple-700 hover:bg-purple-100 shadow-xs border border-purple-200 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-purple-500 font-medium">
                Share this 6-character room code with your friend!
              </p>
            </div>

            {/* Peer Status */}
            <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-white border border-purple-100 text-xs font-bold">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  roomState.peerConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-400 animate-pulse'
                }`}
              />
              <span className={roomState.peerConnected ? 'text-emerald-700' : 'text-amber-700'}>
                {roomState.peerConnected ? 'Friend Joined & Ready! 🎉' : 'Waiting for friend to join...'}
              </span>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={onStartCoOpShoot}
                disabled={!roomState.peerConnected}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-heading font-black text-sm shadow-md hover:scale-102 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Co-Op Shoot Sequence</span>
              </button>

              <button
                onClick={onLeaveRoom}
                className="w-full py-2.5 rounded-full text-purple-600 hover:bg-purple-50 font-semibold text-xs transition-colors"
              >
                Leave Room
              </button>
            </div>
          </div>
        ) : (
          /* Host / Join Selection View */
          <div className="space-y-4">
            <button
              onClick={onCreateRoom}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 text-white font-heading font-bold text-sm shadow-md hover:scale-102 transition-transform flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Host a New Booth Room</span>
              </div>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono">Create</span>
            </button>

            <div className="flex items-center gap-3 my-2">
              <div className="h-px bg-purple-100 flex-1" />
              <span className="text-[11px] font-bold text-purple-400 uppercase">OR JOIN</span>
              <div className="h-px bg-purple-100 flex-1" />
            </div>

            <div className="space-y-2">
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-Char Code (e.g. SNAP99)"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 rounded-2xl border border-purple-200 text-center font-mono font-bold text-base focus:outline-none focus:ring-2 focus:ring-purple-400 uppercase"
              />
              <button
                onClick={() => joinCodeInput && onJoinRoom(joinCodeInput)}
                disabled={joinCodeInput.length !== 6}
                className="w-full py-3 rounded-2xl bg-purple-900 hover:bg-purple-950 text-white font-heading font-bold text-xs transition-colors disabled:opacity-50"
              >
                Join Friend's Room
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
