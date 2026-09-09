'use client';

import { useState } from 'react';
import { ProfileManager } from '@/game/profileManager';
import { PilotProfile } from '@/game/types';
import { BRAND_PINK, NEON_CYAN, NEON_AMBER, DEEP_PURPLE } from '@/game/constants';
import { AudioManager } from '@/game/audio/AudioManager';
import { AudioEvent } from '@/game/audio/audioEvents';

interface ProfileModalProps {
  onClose: () => void;
  onProfileUpdated: () => void;
}

const COLOR_PRESETS = [
  { name: 'Poguns Hot Pink', hex: BRAND_PINK },
  { name: 'Neon Cyber Cyan', hex: NEON_CYAN },
  { name: 'Solar Amber', hex: NEON_AMBER },
  { name: 'Deep Ultraviolet', hex: DEEP_PURPLE },
  { name: 'Toxic Emerald', hex: '#10B981' },
];

export default function ProfileModal({ onClose, onProfileUpdated }: ProfileModalProps) {
  const profileManager = ProfileManager.getInstance();
  const [profiles, setProfiles] = useState<PilotProfile[]>(profileManager.getProfiles());
  const [activeProfile, setActiveProfile] = useState<PilotProfile>(profileManager.getActiveProfile());
  const [editingCallsign, setEditingCallsign] = useState(activeProfile.callsign);
  const [newCallsign, setNewCallsign] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSelectProfile = (id: string) => {
    AudioManager.getInstance().playEvent(AudioEvent.UI_CLICK);
    profileManager.setActiveProfile(id);
    const updated = profileManager.getActiveProfile();
    setActiveProfile(updated);
    setEditingCallsign(updated.callsign);
    onProfileUpdated();
  };

  const handleSaveCallsign = () => {
    if (!editingCallsign.trim()) return;
    AudioManager.getInstance().playEvent(AudioEvent.UI_CLICK);
    profileManager.updateActiveCallsign(editingCallsign);
    setActiveProfile({ ...profileManager.getActiveProfile() });
    setProfiles(profileManager.getProfiles());
    onProfileUpdated();
  };

  const handleSelectColor = (color: string) => {
    AudioManager.getInstance().playEvent(AudioEvent.UI_CLICK);
    profileManager.updateActiveShipColor(color);
    setActiveProfile({ ...profileManager.getActiveProfile() });
    setProfiles(profileManager.getProfiles());
    onProfileUpdated();
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCallsign.trim()) return;
    AudioManager.getInstance().playEvent(AudioEvent.PLAY_CLICK);
    const created = profileManager.createProfile(newCallsign);
    setProfiles(profileManager.getProfiles());
    setActiveProfile(created);
    setEditingCallsign(created.callsign);
    setNewCallsign('');
    setIsCreating(false);
    onProfileUpdated();
  };

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-40 select-none">
      <div className="bg-[#0b0b1a] border-2 border-[#FF1493] rounded-2xl max-w-lg w-full p-6 shadow-[0_0_35px_rgba(255,20,147,0.4)] flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xl">👨‍✈️</span>
            <h3
              className="text-xl font-bold text-white tracking-wider"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              PILOT DOSSIER & PROGRESS
            </h3>
          </div>
          <button
            onClick={() => {
              AudioManager.getInstance().playEvent(AudioEvent.UI_CLICK);
              onClose();
            }}
            className="text-gray-400 hover:text-white text-xl font-mono px-2"
          >
            ✕
          </button>
        </div>

        {/* Profile Selector Tabs */}
        <div className="mb-5">
          <label className="text-xs text-gray-400 font-mono tracking-widest block mb-2">
            SAVED PILOT PROFILES
          </label>
          <div className="flex flex-wrap gap-2">
            {profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectProfile(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all ${
                  p.id === activeProfile.id
                    ? 'bg-[#FF1493] text-white shadow-[0_0_12px_#FF1493]'
                    : 'bg-white/5 border border-white/10 text-gray-300 hover:border-white/30'
                }`}
              >
                {p.callsign} [LVL {p.level}]
              </button>
            ))}

            <button
              onClick={() => setIsCreating(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider bg-transparent border border-dashed border-[#00F0FF] text-[#00F0FF] hover:bg-[#00F0FF]/10 transition-colors"
            >
              + NEW PILOT
            </button>
          </div>
        </div>

        {/* Create Profile Form Modal Inline */}
        {isCreating && (
          <form onSubmit={handleCreateNew} className="bg-black/60 p-4 rounded-xl border border-[#00F0FF]/40 mb-5">
            <label className="text-xs font-mono text-[#00F0FF] block mb-2">
              ENTER NEW PILOT CALLSIGN
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCallsign}
                onChange={(e) => setNewCallsign(e.target.value.toUpperCase())}
                placeholder="CALLSIGN (e.g. NOVA-9)"
                maxLength={14}
                className="flex-1 bg-white/5 border border-white/20 rounded px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-[#FF1493]"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#00F0FF] text-black font-bold font-mono text-xs rounded hover:bg-[#00F0FF]/80"
              >
                CREATE
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 bg-white/10 text-gray-300 font-mono text-xs rounded"
              >
                CANCEL
              </button>
            </div>
          </form>
        )}

        {/* Active Profile Info */}
        <div className="bg-black/60 border border-white/10 rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 mr-4">
              <label className="text-[10px] text-gray-400 font-mono tracking-widest block mb-1">
                EDIT CALLSIGN
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editingCallsign}
                  onChange={(e) => setEditingCallsign(e.target.value.toUpperCase())}
                  maxLength={14}
                  className="bg-white/5 border border-white/20 rounded px-3 py-1 text-white font-mono text-sm focus:outline-none focus:border-[#FF1493] w-full"
                />
                <button
                  onClick={handleSaveCallsign}
                  className="px-3 py-1 bg-[#FF1493] text-white font-mono text-xs rounded hover:bg-[#FF1493]/80 whitespace-nowrap"
                >
                  SAVE
                </button>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-gray-400 font-mono tracking-widest block">PILOT RANK</span>
              <span
                className="text-base font-black text-[#FF1493]"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                {activeProfile.rank}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="bg-white/5 p-2 rounded">
              <span className="text-gray-400 block text-[10px]">TOTAL XP</span>
              <span className="text-white font-bold">{activeProfile.xp.toLocaleString()}</span>
            </div>
            <div className="bg-white/5 p-2 rounded">
              <span className="text-gray-400 block text-[10px]">LIFETIME HIGH</span>
              <span className="text-[#FFD700] font-bold">{activeProfile.highScore.toLocaleString()}</span>
            </div>
            <div className="bg-white/5 p-2 rounded">
              <span className="text-gray-400 block text-[10px]">TOTAL KILLS</span>
              <span className="text-[#00F0FF] font-bold">{activeProfile.totalKills.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Ship Hull Color Customization */}
        <div className="mb-6">
          <label className="text-xs text-gray-400 font-mono tracking-widest block mb-2">
            HULL COLOR ACCENT
          </label>
          <div className="flex gap-3">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c.hex}
                onClick={() => handleSelectColor(c.hex)}
                title={c.name}
                className={`w-9 h-9 rounded-full border-2 transition-transform ${
                  activeProfile.shipColor === c.hex ? 'scale-110 border-white shadow-[0_0_12px_currentColor]' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.hex, color: c.hex }}
              />
            ))}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            AudioManager.getInstance().playEvent(AudioEvent.UI_CLICK);
            onClose();
          }}
          className="w-full py-3 bg-[#FF1493] hover:bg-[#FF1493]/90 text-white font-bold text-sm rounded-xl tracking-widest transition-colors font-mono"
        >
          CONFIRM & RETURN
        </button>
      </div>
    </div>
  );
}

