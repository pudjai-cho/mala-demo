let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return null
  if (!audioCtx) {
    audioCtx = new Ctx()
  }
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

function playTone(
  ctx: AudioContext,
  freq: number,
  startOffset: number,
  duration: number,
  gainPeak = 0.16,
  type: OscillatorType = 'triangle'
): void {
  const start = ctx.currentTime + startOffset
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(freq, start)

  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(gainPeak, start + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(start)
  osc.stop(start + duration + 0.02)
}

/**
 * Cheerful celebratory fanfare when both bowl and total price are correct.
 */
export function playSuccessChime(): void {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    // C5 - E5 - G5 - C6 bright chime
    playTone(ctx, 523.25, 0.0, 0.16, 0.16, 'triangle')
    playTone(ctx, 659.25, 0.09, 0.16, 0.16, 'triangle')
    playTone(ctx, 783.99, 0.18, 0.18, 0.18, 'triangle')
    playTone(ctx, 1046.5, 0.28, 0.42, 0.2, 'sine')
    // Subtle sparkle overtone
    playTone(ctx, 1567.98, 0.3, 0.28, 0.07, 'sine')
  } catch {
    // Ignore Web Audio errors in unsupported environments
  }
}

/**
 * Gentle two-note chime when partially correct.
 */
export function playPartialChime(): void {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    playTone(ctx, 440, 0.0, 0.15, 0.12, 'triangle')
    playTone(ctx, 554.37, 0.11, 0.24, 0.13, 'triangle')
  } catch {
    // Ignore
  }
}

/**
 * Soft, friendly tone when both need another try.
 */
export function playTryAgainTone(): void {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    playTone(ctx, 349.23, 0.0, 0.14, 0.1, 'sine')
    playTone(ctx, 293.66, 0.13, 0.22, 0.1, 'sine')
  } catch {
    // Ignore
  }
}
