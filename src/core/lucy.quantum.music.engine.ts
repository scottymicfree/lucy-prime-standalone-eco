import * as Tone from 'tone';

// --- Types & Moods ---
export type MoodState = 'calm' | 'focus' | 'tension' | 'chaos' | 'exploration';

interface MusicEngineState {
    currentMood: MoodState;
    entropy: number; // 0.0 to 1.0 (calm to high energy/variance)
    isPlaying: boolean;
}

// --- Synthesizers ---
let bassSynth: Tone.PolySynth | null = null;
let melodySynths: Tone.Synth[] = [];
let ambientPad: Tone.PolySynth | null = null;
let percussion: Tone.MembraneSynth | null = null;

let loopSequence: Tone.Loop | null = null;
let currentBpm = 90;

const state: MusicEngineState = {
    currentMood: 'calm',
    entropy: 0.1,
    isPlaying: false
};

// Procedural scales (C minor scale relative)
const scales = {
    calm: ['C4', 'Eb4', 'G4', 'Bb4', 'C5'],
    focus: ['C4', 'D4', 'Eb4', 'F4', 'G4', 'C5'],
    tension: ['C4', 'Db4', 'E4', 'G4', 'Ab4', 'C5'],
    chaos: ['C4', 'Db4', 'Eb4', 'Gb4', 'A4', 'B4', 'C5'],
    exploration: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5'], // Pentatonic major shift
};

function initializeSynths() {
    if (ambientPad) return; // Already init

    const reverb = new Tone.Reverb(4).toDestination();
    const delay = new Tone.PingPongDelay("8n", 0.4).toDestination();

    ambientPad = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 2, decay: 1, sustain: 1, release: 4 }
    }).connect(reverb);
    ambientPad.volume.value = -15;

    bassSynth = new Tone.PolySynth(Tone.FMSynth).connect(reverb);
    bassSynth.volume.value = -10;

    // "Quantum" branching melody synths (we use 3 parallel paths)
    for (let i = 0; i < 3; i++) {
        const branch = new Tone.Synth({
            oscillator: { type: "triangle" },
            envelope: { attack: 0.05, decay: 0.2, sustain: 0.2, release: 1 }
        }).connect(delay).connect(reverb);
        branch.volume.value = -12;
        melodySynths.push(branch);
    }

    percussion = new Tone.MembraneSynth().toDestination();
    percussion.volume.value = -15;
}

// --- Procedural Generation Logic ---

function getMarkovMoodTransition(current: MoodState, entropy: number): MoodState {
    // If entropy is high, push towards chaos/tension. If low, push towards calm/focus.
    const roll = Math.random();
    
    if (entropy > 0.8) {
        if (roll > 0.5) return 'chaos';
        if (roll > 0.2) return 'tension';
        return current;
    } else if (entropy > 0.5) {
        if (roll > 0.6) return 'focus';
        if (roll > 0.3) return 'exploration';
        return current;
    } else {
        if (current === 'tension' || current === 'chaos') return 'focus';
        if (roll > 0.7) return 'exploration';
        return 'calm';
    }
}

function processQuantumStep(time: number) {
    // 1. Evaluate State Transition (slow tick)
    if (Math.random() < 0.1) {
        setMoodState(getMarkovMoodTransition(state.currentMood, state.entropy));
    }

    const scale = scales[state.currentMood];

    // 2. Base Pad (Low interval change)
    if (Math.random() < 0.2) {
        const root = scale[0].replace('4', '3'); // Drop an octave
        ambientPad?.triggerAttackRelease([root, scale[2]], "1m", time);
    }

    // 3. Parallel Melody Generation ("Quantum Branching")
    // We generate 3 potential notes, and collapse to 1 based on an entropy roll
    const possibleNotes = [
        scale[Math.floor(Math.random() * scale.length)],
        scale[Math.floor(Math.random() * scale.length)],
        scale[Math.floor(Math.random() * scale.length)]
    ];

    // Collapse
    let selectedBranch = 0;
    if (state.entropy > 0.6) selectedBranch = Math.floor(Math.random() * 3); // High variance
    else selectedBranch = 0; // Low variance, stick to first path

    const note = possibleNotes[selectedBranch];

    // 4. Trigger the active stream
    if (Math.random() < (0.4 + state.entropy * 0.4)) { // Higher entropy = denser notes
        melodySynths[selectedBranch].triggerAttackRelease(note, "8n", time);
    }

    // 5. Percussion layer (active in focus/tension/chaos)
    if (['focus', 'tension', 'chaos'].includes(state.currentMood)) {
        if (Math.random() < state.entropy) {
            percussion?.triggerAttackRelease("C2", "8n", time);
        }
    }

    // Passively decay entropy over time
    state.entropy = Math.max(0.1, state.entropy - 0.01);
}

// --- Public API ---

export async function playQuantumTrack() {
    if (state.isPlaying) return;
    
    await Tone.start(); // Required by browser to start AudioContext
    initializeSynths();

    Tone.Transport.bpm.value = currentBpm;
    
    loopSequence = new Tone.Loop((time) => {
        processQuantumStep(time);
    }, "8n");
    
    loopSequence.start(0);
    Tone.Transport.start();
    state.isPlaying = true;
    console.log("[LUCY.QUANTUM.MUSIC] Engine Started.");
}

export function stopQuantumTrack() {
    if (!state.isPlaying) return;
    loopSequence?.stop();
    Tone.Transport.stop();
    state.isPlaying = false;
    console.log("[LUCY.QUANTUM.MUSIC] Engine Stopped.");
}

export function setMoodState(mood: MoodState) {
    if (state.currentMood === mood) return;
    state.currentMood = mood;
    
    // Adjust BPM mapping
    switch(mood) {
        case 'calm': Tone.Transport.bpm.rampTo(70, 2); break;
        case 'focus': Tone.Transport.bpm.rampTo(95, 2); break;
        case 'exploration': Tone.Transport.bpm.rampTo(85, 2); break;
        case 'tension': Tone.Transport.bpm.rampTo(110, 1); break;
        case 'chaos': Tone.Transport.bpm.rampTo(140, 0.5); break;
    }
}

export function injectEntropy(amount: number) {
    // amount should be 0.0 to 1.0. We add it to current and clamp.
    state.entropy = Math.min(1.0, state.entropy + amount);
}

export function getCurrentMusicState(): MusicEngineState {
    return { ...state };
}
