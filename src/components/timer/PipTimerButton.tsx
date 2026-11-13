import React, { useEffect, useRef, useState } from 'react';
import { Tv, PictureInPicture2 } from 'lucide-react';
import { useTimerStore } from '../../store/useTimerStore';
import { formatTime } from '../../utils/formatters';

export const PipTimerButton: React.FC = () => {
  const { timeRemaining, totalDuration, status, mode, currentRound, taskTitle } = useTimerStore();
  const [isPipActive, setIsPipActive] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (typeof document !== 'undefined' && 'pictureInPictureEnabled' in document) {
      setIsSupported(Boolean(document.pictureInPictureEnabled));
    }
  }, []);

  // Draw timer frame on canvas whenever timer state updates
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background
    ctx.fillStyle = '#0d0c15';
    ctx.fillRect(0, 0, width, height);

    // Border
    ctx.lineWidth = 4;
    ctx.strokeStyle = mode === 'focus' ? '#ff0055' : '#00f0ff';
    ctx.strokeRect(4, 4, width - 8, height - 8);

    // Header Mode Banner
    ctx.fillStyle = mode === 'focus' ? '#ff0055' : '#00f0ff';
    ctx.font = 'bold 13px monospace';
    const modeText = mode === 'focus' ? '⚔️ DEEP FOCUS' : '☕ BREAK TIME';
    ctx.fillText(modeText, 16, 28);

    // Round Pill
    ctx.fillStyle = '#ffd700';
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Round ${currentRound}/4`, width - 16, 28);
    ctx.textAlign = 'left';

    // Divider Line
    ctx.strokeStyle = '#2b2545';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(12, 38);
    ctx.lineTo(width - 12, 38);
    ctx.stroke();

    // Large Digital Timer Digits
    const timeStr = formatTime(timeRemaining);
    ctx.fillStyle = status === 'running' ? '#00f0ff' : '#9f97ba';
    ctx.font = 'bold 52px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(timeStr, width / 2, 102);

    // Task Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    const displayTitle = taskTitle?.trim() || (mode === 'focus' ? 'ChronoQuest Sesi Fokus' : 'Waktu Istirahat');
    const truncatedTitle = displayTitle.length > 28 ? displayTitle.substring(0, 26) + '...' : displayTitle;
    ctx.fillText(truncatedTitle, width / 2, 128);

    // Progress Bar
    const progress = totalDuration > 0 ? 1 - timeRemaining / totalDuration : 0;
    const barX = 20;
    const barY = 148;
    const barW = width - 40;
    const barH = 12;

    // Bar background
    ctx.fillStyle = '#1c1830';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeStyle = '#3b335c';
    ctx.strokeRect(barX, barY, barW, barH);

    // Bar fill
    ctx.fillStyle = mode === 'focus' ? '#00ff66' : '#00f0ff';
    ctx.fillRect(barX, barY, Math.max(0, barW * progress), barH);

    // Status footer
    ctx.fillStyle = '#7a7299';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    const statusText = status === 'running' ? '● TIMER AKTIF' : status === 'paused' ? '❚❚ DIJEDA' : '◼ SIAP';
    ctx.fillText(statusText, width / 2, 178);
  }, [timeRemaining, totalDuration, status, mode, currentRound, taskTitle]);

  const togglePip = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPipActive(false);
        return;
      }

      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      if (!streamRef.current) {
        // Capture 10fps stream from canvas
        streamRef.current = canvas.captureStream ? canvas.captureStream(10) : null;
        if (streamRef.current) {
          video.srcObject = streamRef.current;
        }
      }

      await video.play();
      await video.requestPictureInPicture();
      setIsPipActive(true);

      video.addEventListener(
        'leavepictureinpicture',
        () => {
          setIsPipActive(false);
        },
        { once: true }
      );
    } catch (err) {
      console.warn('Picture-in-picture error:', err);
    }
  };

  if (!isSupported) return null;

  return (
    <>
      {/* Hidden offscreen canvas and video for PiP stream */}
      <canvas ref={canvasRef} width={320} height={190} className="hidden" />
      <video ref={videoRef} muted playsInline autoPlay className="hidden" />

      {/* Trigger Button */}
      <button
        type="button"
        onClick={togglePip}
        className={`flex items-center gap-1.5 px-3 py-1.5 border-2 transition-all cursor-pointer ${
          isPipActive
            ? 'bg-[#00f0ff] text-black border-black font-bold shadow-[2px_2px_0px_#000]'
            : 'bg-[#1e1736] border-[#3b335c] text-[#00f0ff] hover:border-[#00f0ff]'
        }`}
        title="Buka jendela timer melayang (Floating PiP) di atas aplikasi lain"
      >
        {isPipActive ? <PictureInPicture2 size={13} /> : <Tv size={13} />}
        <span>{isPipActive ? 'PiP Melayang Aktif' : 'Floating Timer (PiP)'}</span>
      </button>
    </>
  );
};
