// Sound notification utilities using Web Audio API

let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
};

// Play a pleasant completion chime
export const playCompletionSound = () => {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        // Create a pleasant three-note chime
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 - Major chord

        frequencies.forEach((freq, index) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, now);

            // Stagger each note
            const startTime = now + index * 0.15;
            const endTime = startTime + 0.4;

            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, endTime);

            oscillator.start(startTime);
            oscillator.stop(endTime + 0.1);
        });
    } catch (error) {
        console.warn('Could not play completion sound:', error);
    }
};

// Play a gentle reminder bell
export const playWarningSound = () => {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, now); // A5

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        oscillator.start(now);
        oscillator.stop(now + 0.4);
    } catch (error) {
        console.warn('Could not play warning sound:', error);
    }
};
