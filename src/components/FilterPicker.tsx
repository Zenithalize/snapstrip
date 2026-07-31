import React from 'react';
import type { FilterId } from '../types/photobooth';
import { FILTER_PRESETS } from '../utils/filters';
import { Sparkles } from 'lucide-react';

interface FilterPickerProps {
  selectedFilter: FilterId;
  onSelectFilter: (id: FilterId) => void;
  previewImageSrc?: string | null;
}

export const FilterPicker: React.FC<FilterPickerProps> = ({
  selectedFilter,
  onSelectFilter,
  previewImageSrc,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
        <Sparkles className="w-3.5 h-3.5 text-pink-500" />
        <span>Photo Filter Preset</span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-purple-200">
        {FILTER_PRESETS.map((filter) => {
          const isSelected = selectedFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => onSelectFilter(filter.id)}
              className={`flex-shrink-0 flex flex-col items-center gap-1.5 group focus:outline-none`}
            >
              <div
                className={`w-[60px] h-[45px] rounded-xl overflow-hidden border-2 transition-all relative ${
                  isSelected
                    ? 'border-purple-600 ring-2 ring-purple-300 scale-105 shadow-sm'
                    : 'border-purple-200 group-hover:border-purple-400 opacity-90'
                }`}
              >
                {previewImageSrc ? (
                  <img
                    src={previewImageSrc}
                    alt={filter.name}
                    style={{ filter: filter.css !== 'none' ? filter.css : undefined }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    style={{ filter: filter.css !== 'none' ? filter.css : undefined }}
                    className="w-full h-full bg-gradient-to-tr from-pink-300 via-purple-300 to-cyan-300"
                  />
                )}
              </div>
              <span
                className={`text-[11px] font-semibold whitespace-nowrap ${
                  isSelected ? 'text-purple-950 font-bold' : 'text-purple-600'
                }`}
              >
                {filter.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
