// Web Audio API sound effects — no external files needed

const SOUND_KEY = 'ggm_sound_enabled';

export const isSoundEnabled = (): boolean =>
    localStorage.getItem(SOUND_KEY) !== 'false';

export const setSoundEnabled = (on: boolean): void =>
    localStorage.setItem(SOUND_KEY, on ? 'true' : 'false');

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioCtx;
}

function playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainVal = 0.25,
    delay = 0
) {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    gain.gain.setValueAtTime(gainVal, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration + 0.01);
}

function playNoise(duration: number, gainVal = 0.08, delay = 0) {
    const ctx = getCtx();
    const sampleRate = ctx.sampleRate;
    const bufferSize = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 600;
    filter.Q.value = 0.4;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(gainVal, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime + delay);
}

/** Big roar for a CÚL — crowd noise + ascending fanfare */
export function playGoalSound() {
    if (!isSoundEnabled()) return;
    try {
        playNoise(2.0, 0.14);
        // Ascending fanfare: C5 E5 G5 C6
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            playTone(freq, 0.22, 'square', 0.18, i * 0.11);
        });
        // Final chord sustain
        playTone(1047, 0.9, 'sine', 0.28, 0.46);
        playTone(784, 0.9, 'sine', 0.18, 0.46);
        playTone(659, 0.9, 'sine', 0.12, 0.46);
    } catch (_) { /* audio unavailable */ }
}

/** Short bright ping for a point */
export function playPointSound() {
    if (!isSoundEnabled()) return;
    try {
        playTone(880, 0.12, 'sine', 0.22);
        playTone(1100, 0.18, 'sine', 0.22, 0.1);
    } catch (_) {}
}

/** Sharp referee whistle */
export function playWhistleSound() {
    if (!isSoundEnabled()) return;
    try {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2400, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(2600, ctx.currentTime + 0.06);
        osc.frequency.linearRampToValueAtTime(2200, ctx.currentTime + 0.14);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
    } catch (_) {}
}

/** Triumphant ascending arpeggio for a win */
export function playWinSound() {
    if (!isSoundEnabled()) return;
    try {
        playNoise(0.6, 0.06, 0.3);
        const notes = [523, 659, 784, 1047, 1319];
        notes.forEach((freq, i) => {
            playTone(freq, 0.28, 'sine', 0.22, i * 0.1);
        });
        playTone(1047, 1.0, 'sine', 0.2, 0.55);
    } catch (_) {}
}

/** Descending minor tones for a loss */
export function playLossSound() {
    if (!isSoundEnabled()) return;
    try {
        const notes = [440, 392, 370, 330];
        notes.forEach((freq, i) => {
            playTone(freq, 0.38, 'sine', 0.18, i * 0.16);
        });
    } catch (_) {}
}

/** Resume AudioContext if suspended (browsers need a user gesture first) */
export function resumeAudio() {
    try {
        const ctx = getCtx();
        if (ctx.state === 'suspended') {
            ctx.resume();
        }
    } catch (_) {}
}
