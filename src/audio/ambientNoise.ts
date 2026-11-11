/**
 * Ambient Focus Audio Generator (Pink noise, Brown noise, Lo-Fi Rain, Cosmic Hum)
 * Uses procedural Web Audio API buffers.
 */

export type AmbientSoundType = 'none' | 'rain' | 'brown' | 'cosmic';

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private sourceNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private currentType: AmbientSoundType = 'none';
  private volume: number = 0.25;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public stop() {
    if (this.sourceNode) {
      try {
        (this.sourceNode as AudioBufferSourceNode).stop?.();
        this.sourceNode.disconnect();
      } catch {
        // ignore
      }
      this.sourceNode = null;
    }
    this.currentType = 'none';
  }

  public play(type: AmbientSoundType) {
    if (type === 'none') {
      this.stop();
      return;
    }

    if (this.currentType === type && this.sourceNode) {
      return; // already playing
    }

    this.stop();
    const ctx = this.getContext();
    if (!ctx) return;

    this.gainNode = ctx.createGain();
    this.gainNode.gain.setValueAtTime(this.volume, ctx.currentTime);
    this.gainNode.connect(ctx.destination);

    if (type === 'brown' || type === 'rain') {
      // 5-second loopable noise buffer
      const bufferSize = ctx.sampleRate * 5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'brown') {
          // Brown noise integration
          lastOut = (lastOut + 0.02 * white) / 1.02;
          data[i] = lastOut * 3.5;
        } else {
          // Rain simulation (filtered noise + soft crackle)
          lastOut = (lastOut + 0.08 * white) / 1.08;
          const crackle = Math.random() > 0.99 ? (Math.random() - 0.5) * 0.4 : 0;
          data[i] = (lastOut + crackle) * 1.5;
        }
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = type === 'rain' ? 'bandpass' : 'lowpass';
      filter.frequency.setValueAtTime(type === 'rain' ? 850 : 250, ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(this.gainNode);
      noiseSource.start();

      this.sourceNode = noiseSource;
    } else if (type === 'cosmic') {
      // Deep 432Hz harmonic drone
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(108, ctx.currentTime); // Sub-bass

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(216, ctx.currentTime); // Octave

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, ctx.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(this.gainNode);

      osc1.start();
      osc2.start();

      this.sourceNode = filter;
    }

    this.currentType = type;
  }

  public getCurrentType(): AmbientSoundType {
    return this.currentType;
  }
}

export const ambientEngine = new AmbientAudioEngine();
