import React from 'react';
import { Flame, Coffee, Coins, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import { useTimerStore } from '../../store/useTimerStore';
import { PixelModal } from '../ui/PixelModal';
import { PixelButton } from '../ui/PixelButton';

export const SessionCompletedModal: React.FC = () => {
  const {
    completedSummary,
    clearCompletedModal,
    startBreakFromModal,
    startNextFocusFromModal,
  } = useTimerStore();

  if (!completedSummary) return null;

  const isFocus = completedSummary.mode === 'focus';

  return (
    <PixelModal
      isOpen={Boolean(completedSummary)}
      onClose={clearCompletedModal}
      title={isFocus ? '⚔️ QUEST FOKUS SELESAI!' : '☕ ISTIRAHAT SELESAI!'}
      maxWidth="sm"
    >
      <div className="space-y-4 font-silkscreen text-xs text-center">
        {/* Banner Icon */}
        <div className="flex justify-center my-1">
          <div
            className={`w-16 h-16 border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_#000] ${
              isFocus ? 'bg-[#ff0055]' : 'bg-[#00f0ff]'
            }`}
          >
            {isFocus ? (
              <Flame size={36} className="text-white animate-pulse" />
            ) : (
              <Coffee size={36} className="text-black" />
            )}
          </div>
        </div>

        {/* Title and Subtitle */}
        <div>
          <h3 className="font-pixel text-sm sm:text-base text-[#ffd700]">
            {isFocus ? 'SESI FOKUS SUKSES!' : 'WAKTU ISTIRAHAT TUNTAS!'}
          </h3>
          <p className="text-xs text-[#d3cbe7] mt-1 italic">
            "{completedSummary.taskTitle}"
          </p>
        </div>

        {/* Rewards & Stats Box */}
        {isFocus ? (
          <div className="p-3 bg-[#130f21] border-2 border-[#2b2545] space-y-2">
            <span className="text-[10px] text-[#9f97ba] uppercase tracking-wider block">
              Hadiah & Progres yang Didapatkan:
            </span>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-[#1b152d] border border-[#3b335c]">
                <div className="text-[10px] text-[#00f0ff] flex items-center justify-center gap-1">
                  <CheckCircle size={11} /> Menit
                </div>
                <div className="font-pixel text-xs text-white mt-1">
                  +{completedSummary.durationMinutes}m
                </div>
              </div>

              <div className="p-2 bg-[#1b152d] border border-[#3b335c]">
                <div className="text-[10px] text-[#e0aaff] flex items-center justify-center gap-1">
                  <Zap size={11} className="text-[#c77dff]" /> EXP
                </div>
                <div className="font-pixel text-xs text-[#e0aaff] mt-1">
                  +{completedSummary.xp}
                </div>
              </div>

              <div className="p-2 bg-[#1b152d] border border-[#3b335c]">
                <div className="text-[10px] text-[#ffd700] flex items-center justify-center gap-1">
                  <Coins size={11} /> Gold
                </div>
                <div className="font-pixel text-xs text-[#ffd700] mt-1">
                  +{completedSummary.gold}
                </div>
              </div>
            </div>

            <p className="text-[10px] text-[#00ff66] pt-1">
              ✓ Sesi resmi tercatat di data statistik & target harian!
            </p>
          </div>
        ) : (
          <div className="p-3 bg-[#130f21] border-2 border-[#2b2545]">
            <p className="text-xs text-[#00f0ff] leading-relaxed">
              Pikiranmu sudah segar kembali. Saatnya melangkah ke ronde berikutnya dan taklukkan target produktivitasmu!
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          {isFocus ? (
            <>
              <PixelButton
                variant="primary"
                size="md"
                onClick={startBreakFromModal}
                fullWidth
              >
                <Coffee size={15} />
                <span>☕ Mulai Istirahat Sekarang</span>
                <ArrowRight size={13} className="ml-1" />
              </PixelButton>

              <PixelButton
                variant="retro-dark"
                size="sm"
                onClick={startNextFocusFromModal}
                fullWidth
              >
                <Flame size={14} className="text-[#ff0055]" />
                <span>⚔️ Lewati Istirahat, Lanjut Fokus Baru</span>
              </PixelButton>
            </>
          ) : (
            <PixelButton
              variant="primary"
              size="md"
              onClick={startNextFocusFromModal}
              fullWidth
            >
              <Flame size={15} />
              <span>⚔️ Mulai Sesi Fokus Ronde Baru</span>
              <ArrowRight size={13} className="ml-1" />
            </PixelButton>
          )}

          <button
            type="button"
            onClick={clearCompletedModal}
            className="text-[10px] text-[#786f94] hover:text-[#f0edf6] underline cursor-pointer pt-1"
          >
            Tutup & Siapkan Nanti
          </button>
        </div>
      </div>
    </PixelModal>
  );
};
