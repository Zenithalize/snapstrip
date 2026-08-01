import React, { useState } from 'react';
import type { CoOpRoom } from '../types/photobooth';
import { Users, Copy, Check, X, Sparkles, Play, AlertCircle, UserCheck } from 'lucide-react';

interface CoOpModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomState: CoOpRoom;
  error: string | null;
  onCreateRoom: (maxPlayers?: number) => void;
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
  const [selectedMaxPlayers, setSelectedMaxPlayers] = useState<number>(6);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    if (roomState.code) {
      navigator.clipboard.writeText(roomState.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentMembersCount = roomState.peerCount + 1;

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
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-500 p-0.5 shadow-sm">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div>
            <h3 className="font-heading font-black text-xl text-purple-950">Multi-Player Party Booth</h3>
            <p className="text-xs text-purple-600 font-medium">Shoot together online with up to 6 friends!</p>
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
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Party Room Code</span>
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
                Share this code with up to {roomState.maxPlayers || 6} friends to join!
              </p>
            </div>

            {/* Live Party Members Roster */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                <span>Party Lobby Members ({currentMembersCount} / {roomState.maxPlayers || 6})</span>
                <span className="text-[11px] text-purple-600 font-normal">
                  Your Slot: Shot #{roomState.playerIndex + 1}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: roomState.maxPlayers || 6 }).map((_, idx) => {
                  const isConnected = idx < currentMembersCount;
                  const isMe = idx === roomState.playerIndex;
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                        isMe
                          ? 'border-purple-600 bg-purple-100/70 text-purple-950 font-bold shadow-2xs'
                          : isConnected
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                          : 'border-purple-100 bg-gray-50 text-gray-400 opacity-60'
                      }`}
                    >
                      <UserCheck className={`w-4 h-4 ${isConnected ? 'text-purple-600' : 'text-gray-300'}`} />
                      <span className="text-[10px] font-bold">
                        Player #{idx + 1}
                      </span>
                      <span className="text-[9px] font-semibold">
                        {isMe ? '(You)' : isConnected ? 'Ready ✨' : 'Waiting...'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={onStartCoOpShoot}
                disabled={currentMembersCount < 2}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 text-white font-heading font-black text-sm shadow-md hover:scale-102 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Party Shoot Sequence</span>
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
            {/* Party Size Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-purple-900">Select Room Capacity:</label>
              <div className="grid grid-cols-3 gap-2">
                {[2, 3, 6].map((num) => (
                  <button
                    key={num}
                    onClick={() => setSelectedMaxPlayers(num)}
                    className={`py-2 rounded-2xl border text-xs font-bold transition-all ${
                      selectedMaxPlayers === num
                        ? 'border-purple-600 bg-purple-50 text-purple-950 ring-2 ring-purple-300'
                        : 'border-purple-100 bg-white text-purple-700 hover:bg-purple-50'
                    }`}
                  >
                    {num === 6 ? '6 Party 🎉' : `${num} Players`}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => onCreateRoom(selectedMaxPlayers)}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 text-white font-heading font-bold text-sm shadow-md hover:scale-102 transition-transform flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Host {selectedMaxPlayers}-Player Party Booth</span>
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
                Join Party Room
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
