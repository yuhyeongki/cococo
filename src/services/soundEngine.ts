/**
 * Teacher Wellness Sound Engine
 * Pure Web Audio API synthesized ambient sounds & healing soundscapes
 * 100% reliable, zero network dependency, seamless loops.
 */

export type SoundType = 'rain' | 'forest' | 'waves' | 'fire' | 'singing_bowl';

interface SoundNodeMap {
  gainNode: GainNode;
  stop: () => void;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeSounds: Map<SoundType, SoundNodeMap> = new Map();
  private singingBowlInterval: any = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMasterVolume(val: number) {
    this.initContext();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime, 0.05);
    }
  }

  public setSoundVolume(type: SoundType, val: number) {
    const sound = this.activeSounds.get(type);
    if (sound && this.ctx) {
      sound.gainNode.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime, 0.05);
    }
  }

  public isPlaying(type: SoundType): boolean {
    return this.activeSounds.has(type);
  }

  public toggleSound(type: SoundType, volume: number = 0.5): boolean {
    if (this.activeSounds.has(type)) {
      this.stopSound(type);
      return false;
    } else {
      this.startSound(type, volume);
      return true;
    }
  }

  public startSound(type: SoundType, volume: number = 0.5) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    if (this.activeSounds.has(type)) return;

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gainNode.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.2);
    gainNode.connect(this.masterGain);

    let stopFn: () => void = () => {};

    switch (type) {
      case 'rain':
        stopFn = this.createRain(gainNode);
        break;
      case 'forest':
        stopFn = this.createForest(gainNode);
        break;
      case 'waves':
        stopFn = this.createWaves(gainNode);
        break;
      case 'fire':
        stopFn = this.createFire(gainNode);
        break;
      case 'singing_bowl':
        stopFn = this.createSingingBowl(gainNode);
        break;
    }

    this.activeSounds.set(type, { gainNode, stop: stopFn });
  }

  public stopSound(type: SoundType) {
    const sound = this.activeSounds.get(type);
    if (sound && this.ctx) {
      sound.gainNode.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.2);
      setTimeout(() => {
        sound.stop();
        this.activeSounds.delete(type);
      }, 300);
    }
  }

  public stopAll() {
    for (const type of Array.from(this.activeSounds.keys())) {
      this.stopSound(type);
    }
  }

  // --- Rain Synthesis ---
  private createRain(dest: GainNode): () => void {
    if (!this.ctx) return () => {};
    // Pink noise buffer
    const bufferSize = this.ctx.sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
      b6 = white * 0.115926;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Filters for rain body
    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(1200, this.ctx.currentTime);

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(350, this.ctx.currentTime);

    noise.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(dest);
    noise.start();

    return () => {
      try { noise.stop(); } catch {}
      noise.disconnect();
    };
  }

  // --- Forest Breeze Synthesis ---
  private createForest(dest: GainNode): () => void {
    if (!this.ctx) return () => {};
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(650, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(1.8, this.ctx.currentTime);

    // LFO for swaying breeze
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.18, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(320, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(bandpass.frequency);

    noise.connect(bandpass);
    bandpass.connect(dest);

    noise.start();
    lfo.start();

    return () => {
      try { noise.stop(); lfo.stop(); } catch {}
      noise.disconnect();
      lfo.disconnect();
    };
  }

  // --- Ocean Waves Synthesis ---
  private createWaves(dest: GainNode): () => void {
    if (!this.ctx) return () => {};
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.2;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, this.ctx.currentTime);

    const waveGain = this.ctx.createGain();
    waveGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

    // Slow swell LFO (8s cycle)
    const swellLfo = this.ctx.createOscillator();
    swellLfo.type = 'sine';
    swellLfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);

    const swellGain = this.ctx.createGain();
    swellGain.gain.setValueAtTime(0.28, this.ctx.currentTime);
    swellLfo.connect(swellGain);
    swellGain.connect(waveGain.gain);

    // Filter frequency sweep for breaker sound
    const filterGain = this.ctx.createGain();
    filterGain.gain.setValueAtTime(250, this.ctx.currentTime);
    swellLfo.connect(filterGain);
    filterGain.connect(filter.frequency);

    noise.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(dest);

    noise.start();
    swellLfo.start();

    return () => {
      try { noise.stop(); swellLfo.stop(); } catch {}
      noise.disconnect();
      swellLfo.disconnect();
    };
  }

  // --- Fireplace Hearth Synthesis ---
  private createFire(dest: GainNode): () => void {
    if (!this.ctx) return () => {};
    // Base low rumble
    const bufferSize = this.ctx.sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.12;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(280, this.ctx.currentTime);

    noise.connect(lowpass);
    lowpass.connect(dest);
    noise.start();

    // Crackle generator interval
    let isRunning = true;
    const triggerCrackle = () => {
      if (!isRunning || !this.ctx) return;
      const crack = this.ctx.createOscillator();
      const crackGain = this.ctx.createGain();
      crack.type = 'triangle';
      crack.frequency.setValueAtTime(400 + Math.random() * 800, this.ctx.currentTime);
      crackGain.gain.setValueAtTime(0.12 + Math.random() * 0.15, this.ctx.currentTime);
      crackGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.06);

      crack.connect(crackGain);
      crackGain.connect(dest);
      crack.start();
      crack.stop(this.ctx.currentTime + 0.07);

      const nextTime = 100 + Math.random() * 450;
      setTimeout(triggerCrackle, nextTime);
    };

    triggerCrackle();

    return () => {
      isRunning = false;
      try { noise.stop(); } catch {}
      noise.disconnect();
    };
  }

  // --- Tibetan Singing Bowl Synthesis (432Hz Healing Frequency) ---
  private createSingingBowl(dest: GainNode): () => void {
    if (!this.ctx) return () => {};

    let isRunning = true;

    const playStrike = () => {
      if (!isRunning || !this.ctx) return;
      const now = this.ctx.currentTime;
      const fundamentalFreq = 432; // Calming frequency

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const osc3 = this.ctx.createOscillator();

      const gain1 = this.ctx.createGain();
      const gain2 = this.ctx.createGain();
      const gain3 = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(fundamentalFreq, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(fundamentalFreq * 2.76, now); // Overtone harmonic

      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(fundamentalFreq * 5.12, now); // High shimmer

      // Envelope: gentle strike with long 7-second ringout
      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(0.4, now + 0.08);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 6.8);

      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.linearRampToValueAtTime(0.18, now + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 5.2);

      gain3.gain.setValueAtTime(0.001, now);
      gain3.gain.linearRampToValueAtTime(0.08, now + 0.03);
      gain3.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

      osc1.connect(gain1);
      osc2.connect(gain2);
      osc3.connect(gain3);

      gain1.connect(dest);
      gain2.connect(dest);
      gain3.connect(dest);

      osc1.start(now);
      osc2.start(now);
      osc3.start(now);

      osc1.stop(now + 7.0);
      osc2.stop(now + 7.0);
      osc3.stop(now + 7.0);
    };

    // Play immediately and repeat every 7.5 seconds
    playStrike();
    const intervalId = setInterval(playStrike, 7500);

    return () => {
      isRunning = false;
      clearInterval(intervalId);
    };
  }
}

export const soundEngine = new SoundEngine();
