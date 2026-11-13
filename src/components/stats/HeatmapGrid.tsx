import React, { useState } from 'react';
import { Calendar, Info, BarChart3, Grid3X3, Layers } from 'lucide-react';
import { useStatsStore } from '../../store/useStatsStore';
import { formatDatePretty, formatMinutes } from '../../utils/formatters';
import { FocusBarChart } from './FocusBarChart';

type ViewMode = 'chart' | 'map' | 'both';

export const HeatmapGrid: React.FC = () => {
  const { getHeatmapData } = useStatsStore();
  const [viewMode, setViewMode] = useState<ViewMode>('chart');
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    minutes: number;
    sessions: number;
  } | null>(null);

  // Get past 70 days (10 weeks) of activity data for the matrix
  const heatmapData = getHeatmapData(70);

  // Group into columns of 7 (days of week)
  const columns: typeof heatmapData[] = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    columns.push(heatmapData.slice(i, i + 7));
  }

  const intensityColors = {
    0: 'bg-[#120f20] border-[#201a35]',
    1: 'bg-[#005f73] border-[#0a9396]',
    2: 'bg-[#0a9396] border-[#94d2bd]',
    3: 'bg-[#ee9b00] border-[#ca6702]',
    4: 'bg-[#ff0055] border-[#ff4d79] shadow-[0_0_8px_#ff0055]',
  };

  return (
    <div className="bg-[#181528] pixel-border border-4 border-black p-4 sm:p-5">
      {/* Top Main Navigation Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-[#2b2545]">
        <div>
          <h3 className="font-silkscreen text-sm font-bold text-[#f0edf6] uppercase flex items-center gap-2">
            {viewMode === 'chart' ? (
              <>
                <BarChart3 size={16} className="text-[#00f0ff]" />
                Visualisasi Grafik Batang (Bar Chart)
              </>
            ) : viewMode === 'map' ? (
              <>
                <Grid3X3 size={16} className="text-[#00f0ff]" />
                Peta Matriks Deep Focus (Heatmap Map)
              </>
            ) : (
              <>
                <Layers size={16} className="text-[#00f0ff]" />
                Statistik & Peta Matriks Lengkap
              </>
            )}
          </h3>
          <p className="text-xs text-[#9f97ba] mt-0.5">
            {viewMode === 'chart'
              ? 'Grafik batang dinamis untuk membandingkan durasi fokus harian.'
              : viewMode === 'map'
              ? 'Setiap blok piksel mewakili akumulasi menit fokusmu selama 70 hari.'
              : 'Tampilan terpadu grafik batang harian dan peta matriks 70 hari.'}
          </p>
        </div>

        {/* View Switcher Button Group */}
        <div className="flex items-center gap-1.5 bg-[#120f20] p-1 border-2 border-[#2b2545] shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('chart')}
            className={`px-2.5 py-1 text-xs font-silkscreen cursor-pointer flex items-center gap-1.5 transition-all border ${
              viewMode === 'chart'
                ? 'bg-[#00f0ff] text-black font-bold border-black shadow-[1px_1px_0px_#000]'
                : 'bg-transparent text-[#9f97ba] border-transparent hover:text-white'
            }`}
            title="Tampilkan visualisasi grafik batang"
          >
            <BarChart3 size={13} />
            <span>Grafik Batang</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`px-2.5 py-1 text-xs font-silkscreen cursor-pointer flex items-center gap-1.5 transition-all border ${
              viewMode === 'map'
                ? 'bg-[#00f0ff] text-black font-bold border-black shadow-[1px_1px_0px_#000]'
                : 'bg-transparent text-[#9f97ba] border-transparent hover:text-white'
            }`}
            title="Tampilkan peta matriks piksel 70 hari"
          >
            <Grid3X3 size={13} />
            <span>Peta (Map)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('both')}
            className={`px-2.5 py-1 text-xs font-silkscreen cursor-pointer flex items-center gap-1.5 transition-all border ${
              viewMode === 'both'
                ? 'bg-[#00f0ff] text-black font-bold border-black shadow-[1px_1px_0px_#000]'
                : 'bg-transparent text-[#9f97ba] border-transparent hover:text-white'
            }`}
            title="Tampilkan grafik batang dan peta matriks sekaligus"
          >
            <Layers size={13} />
            <span className="hidden sm:inline">Keduanya</span>
          </button>
        </div>
      </div>

      {/* Render Mode: Bar Chart */}
      {(viewMode === 'chart' || viewMode === 'both') && (
        <div className={viewMode === 'both' ? 'mb-6 pb-6 border-b-2 border-[#2b2545]' : ''}>
          <FocusBarChart hideOuterCard={true} />
        </div>
      )}

      {/* Render Mode: 70-day Pixel Matrix Map */}
      {(viewMode === 'map' || viewMode === 'both') && (
        <div>
          {viewMode === 'both' && (
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={15} className="text-[#00f0ff]" />
              <h4 className="font-silkscreen text-xs font-bold text-[#f0edf6] uppercase">
                Peta Matriks Deep Focus (70 Hari Terakhir)
              </h4>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs text-[#9f97ba]">
              Intensitas fokus 70 hari terakhir (10 minggu):
            </span>

            {/* Legend */}
            <div className="flex items-center gap-1.5 text-[10px] font-silkscreen text-[#8e85aa]">
              <span>Kurang</span>
              <div className="w-3 h-3 bg-[#120f20] border border-[#201a35]" title="0 menit" />
              <div className="w-3 h-3 bg-[#005f73] border border-[#0a9396]" title="1-39 menit" />
              <div className="w-3 h-3 bg-[#0a9396] border border-[#94d2bd]" title="40-74 menit" />
              <div className="w-3 h-3 bg-[#ee9b00] border-[#ca6702]" title="75-119 menit" />
              <div className="w-3 h-3 bg-[#ff0055] border-[#ff4d79]" title="120+ menit" />
              <span>Lebih Banyak</span>
            </div>
          </div>

          {/* Heatmap Grid container */}
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-1.5 min-w-max">
              {columns.map((col, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-1.5">
                  {col.map((day) => (
                    <div
                      key={day.date}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 border cursor-pointer transition-transform hover:scale-125 ${
                        intensityColors[day.intensityLevel]
                      }`}
                      title={`${day.date}: ${day.minutes} menit (${day.sessions} sesi)`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Hover Info Tooltip Bar */}
          <div className="mt-3 pt-2.5 border-t border-[#27213e] flex items-center justify-between text-xs font-silkscreen text-[#9f97ba] min-h-[24px]">
            {hoveredDay ? (
              <div className="flex items-center gap-2">
                <span className="text-[#ffd700] font-bold">{formatDatePretty(hoveredDay.date)}:</span>
                <span className="text-[#00f0ff] font-pixel text-[11px]">
                  {formatMinutes(hoveredDay.minutes)}
                </span>
                <span>({hoveredDay.sessions} sesi fokus selesai)</span>
              </div>
            ) : (
              <span className="text-[#645c81] flex items-center gap-1">
                <Info size={12} /> Arahkan kursor pada piksel untuk melihat rincian tanggal.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
