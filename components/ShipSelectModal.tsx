'use client';

import React, { useState } from 'react';
import { ShipId, SHIPS, ShipConfig } from '../game/ships';
import { ProfileManager } from '../game/profileManager';

interface ShipSelectModalProps {
  currentShipId: ShipId;
  isOpen: boolean;
  onSelect: (shipId: ShipId) => void;
  onClose: () => void;
}

export const ShipSelectModal: React.FC<ShipSelectModalProps> = ({
  currentShipId,
  isOpen,
  onSelect,
  onClose,
}) => {
  const [selectedId, setSelectedId] = useState<ShipId>(currentShipId);

  if (!isOpen) return null;

  const shipList = Object.values(SHIPS);
  const activeShip = SHIPS[selectedId] || SHIPS.vanguard;

  const handleConfirm = () => {
    ProfileManager.getInstance().updateProfile({ selectedShipId: selectedId });
    onSelect(selectedId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-5 md:p-8 flex flex-col gap-6 text-white custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-bold">
              FLIGHT HANGAR & DOCK
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-cyan-400 to-yellow-400">
              SELECT YOUR STARSHIP
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-900 border border-slate-700 transition"
          >
            ✕
          </button>
        </div>

        {/* Ship Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {shipList.map((ship: ShipConfig) => {
            const isSelected = ship.id === selectedId;
            return (
              <div
                key={ship.id}
                onClick={() => setSelectedId(ship.id)}
                className={`relative p-4 rounded-xl cursor-pointer transition-all duration-200 flex flex-col justify-between border ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/30 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-600 hover:bg-slate-900'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-400 text-black">
                    ACTIVE
                  </div>
                )}

                {/* Ship Icon / Glyph */}
                <div className="flex flex-col items-center py-3">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-3xl font-black border-2 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      borderColor: ship.primaryColor,
                      backgroundColor: `${ship.primaryColor}15`,
                      boxShadow: `0 0 15px ${ship.primaryColor}40`,
                    }}
                  >
                    {ship.id === 'vanguard' && '🚀'}
                    {ship.id === 'phantom' && '⚡'}
                    {ship.id === 'titan' && '🛡️'}
                    {ship.id === 'spectre' && '🔮'}
                  </div>
                  <h3 className="mt-3 text-lg font-bold tracking-wide text-center">
                    {ship.name}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono text-center">
                    {ship.tagline}
                  </span>
                </div>

                {/* Mini Stat Bars */}
                <div className="space-y-2 text-xs font-mono pt-2 border-t border-slate-800/80">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">SPEED</span>
                    <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-cyan-400 h-full rounded-full"
                        style={{ width: `${(ship.speed / 8.5) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">ARMOR</span>
                    <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-pink-400 h-full rounded-full"
                        style={{ width: `${ship.armorReduction * 250}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">FIRE RATE</span>
                    <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-yellow-400 h-full rounded-full"
                        style={{
                          width: `${Math.max(15, (250 / ship.baseFireCooldown) * 80)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Ship Detail View */}
        <div className="p-4 md:p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-5 items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h4 className="text-xl font-black text-white">{activeShip.name}</h4>
              <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-slate-800 border border-slate-700 text-cyan-400">
                {activeShip.tagline}
              </span>
            </div>
            <p className="text-sm text-slate-300 max-w-xl">{activeShip.description}</p>
            <div className="flex items-center gap-2 text-xs font-mono text-yellow-400 pt-1">
              <span className="font-bold uppercase">Special Perk:</span>
              <span>{activeShip.specialAbility}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={onClose}
              className="flex-1 md:flex-initial px-5 py-3 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 md:flex-initial px-8 py-3 rounded-xl font-black tracking-wider uppercase bg-gradient-to-r from-pink-500 via-rose-500 to-cyan-400 hover:opacity-90 active:scale-95 text-white shadow-lg shadow-pink-500/30 transition-all"
            >
              Deploy {activeShip.name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

