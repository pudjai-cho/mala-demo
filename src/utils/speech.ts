import { reactive } from 'vue'

export type SpeechLang = 'zh-CN' | 'zh-TW' | 'th-TH' | 'en-US'

export type SpeechPlatform = 'windows' | 'macos' | 'ios' | 'android' | 'other'

export interface VoiceOption {
  name: string
  lang: string
  voiceURI: string
}

export interface SpeechSegment {
  text: string
  lang: SpeechLang
  rate?: number
}

export interface SpeechState {
  supported: boolean
  platform: SpeechPlatform
  voicesLoaded: boolean
  voicesCheckComplete: boolean
  zhVoices: VoiceOption[]
  thVoices: VoiceOption[]
  enVoices: VoiceOption[]
  selectedZhVoiceURI: string
  selectedThVoiceURI: string
  selectedEnVoiceURI: string
  lastError: string | null
}

export function detectSpeechPlatform(): SpeechPlatform {
  if (typeof navigator === 'undefined') return 'other'
  const ua = navigator.userAgent || ''
  if (/iPad|iPhone|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    return 'ios'
  }
  if (/Android/i.test(ua)) return 'android'
  if (/Macintosh|Mac OS X/i.test(ua)) return 'macos'
  if (/Windows/i.test(ua)) return 'windows'
  return 'other'
}

export const speechState = reactive<SpeechState>({
  supported: typeof window !== 'undefined' && 'speechSynthesis' in window,
  platform: detectSpeechPlatform(),
  voicesLoaded: false,
  voicesCheckComplete: false,
  zhVoices: [],
  thVoices: [],
  enVoices: [],
  selectedZhVoiceURI: '',
  selectedThVoiceURI: '',
  selectedEnVoiceURI: '',
  lastError: null,
})

let rawVoices: SpeechSynthesisVoice[] = []
let activeUtterance: SpeechSynthesisUtterance | null = null
let pendingTimer: number | null = null
let queueToken = 0
let initialized = false

function isZhVoice(v: SpeechSynthesisVoice): boolean {
  const l = v.lang.toLowerCase().replace('_', '-')
  return l.startsWith('zh') || l.startsWith('cmn')
}

function isThVoice(v: SpeechSynthesisVoice): boolean {
  const l = v.lang.toLowerCase().replace('_', '-')
  return l.startsWith('th')
}

function isEnVoice(v: SpeechSynthesisVoice): boolean {
  const l = v.lang.toLowerCase().replace('_', '-')
  return l.startsWith('en')
}

function scoreVoice(voice: SpeechSynthesisVoice, preferredLang: SpeechLang): number {
  const lang = voice.lang.toLowerCase().replace('_', '-')
  const pref = preferredLang.toLowerCase()
  let score = 0
  if (lang === pref) score += 50
  else if (lang.startsWith(pref.slice(0, 2))) score += 20

  const name = voice.name.toLowerCase()
  if (
    name.includes('xiaoxiao') ||
    name.includes('yunxi') ||
    name.includes('hsiaochen') ||
    name.includes('niwat') ||
    name.includes('premwadee') ||
    name.includes('aria') ||
    name.includes('jenny')
  ) {
    score += 20
  }
  if (name.includes('natural') || name.includes('online')) score += 12
  if (name.includes('google')) score += 10
  return score
}

function toOption(v: SpeechSynthesisVoice): VoiceOption {
  return { name: v.name, lang: v.lang, voiceURI: v.voiceURI }
}

export function refreshVoices(markComplete = false): void {
  if (!speechState.supported) return
  rawVoices = window.speechSynthesis.getVoices()

  const zh = rawVoices.filter(isZhVoice)
  const th = rawVoices.filter(isThVoice)
  const en = rawVoices.filter(isEnVoice)

  speechState.zhVoices = zh.map(toOption)
  speechState.thVoices = th.map(toOption)
  speechState.enVoices = en.map(toOption)
  speechState.voicesLoaded = rawVoices.length > 0
  if (rawVoices.length > 0 || markComplete) {
    speechState.voicesCheckComplete = true
  }

  if (
    speechState.selectedZhVoiceURI &&
    !zh.some((v) => v.voiceURI === speechState.selectedZhVoiceURI)
  ) {
    speechState.selectedZhVoiceURI = ''
  }
  if (th.length > 0 && !th.some((v) => v.voiceURI === speechState.selectedThVoiceURI)) {
    const sorted = [...th].sort((a, b) => scoreVoice(b, 'th-TH') - scoreVoice(a, 'th-TH'))
    speechState.selectedThVoiceURI = sorted[0].voiceURI
  }
  if (en.length > 0 && !en.some((v) => v.voiceURI === speechState.selectedEnVoiceURI)) {
    const sorted = [...en].sort((a, b) => scoreVoice(b, 'en-US') - scoreVoice(a, 'en-US'))
    speechState.selectedEnVoiceURI = sorted[0].voiceURI
  }

  if (zh.length > 0 && speechState.lastError === 'no-zh-voice') {
    speechState.lastError = null
  } else if (speechState.voicesCheckComplete && zh.length === 0) {
    speechState.lastError = 'no-zh-voice'
  }
}

export function initSpeech(): void {
  if (initialized || !speechState.supported) return
  initialized = true

  refreshVoices()
  window.speechSynthesis.addEventListener('voiceschanged', () => refreshVoices(false))
  window.setTimeout(() => refreshVoices(false), 300)
  window.setTimeout(() => refreshVoices(true), 1200)
}

export function isSpeechSupported(): boolean {
  return speechState.supported
}

function pickVoiceForLang(lang: SpeechLang): SpeechSynthesisVoice | undefined {
  if (lang.startsWith('zh')) {
    const matches = rawVoices.filter(isZhVoice)
    if (matches.length === 0) return undefined

    // Respect user's explicit voice selection (e.g. zh-HK Cantonese, zh-TW, zh-CN)
    if (speechState.selectedZhVoiceURI) {
      const selected = matches.find((v) => v.voiceURI === speechState.selectedZhVoiceURI)
      if (selected) return selected
    }

    // Auto mode: pick best voice for the requested script region (zh-CN vs zh-TW)
    return [...matches].sort((a, b) => scoreVoice(b, lang) - scoreVoice(a, lang))[0]
  }

  if (lang.startsWith('th')) {
    const matches = rawVoices.filter(isThVoice)
    if (matches.length === 0) return undefined
    return (
      matches.find((v) => v.voiceURI === speechState.selectedThVoiceURI) ??
      [...matches].sort((a, b) => scoreVoice(b, 'th-TH') - scoreVoice(a, 'th-TH'))[0]
    )
  }

  const matches = rawVoices.filter(isEnVoice)
  if (matches.length === 0) return undefined
  return (
    matches.find((v) => v.voiceURI === speechState.selectedEnVoiceURI) ??
    [...matches].sort((a, b) => scoreVoice(b, 'en-US') - scoreVoice(a, 'en-US'))[0]
  )
}

export function speakSequence(segments: SpeechSegment[]): void {
  const valid = segments.filter((s) => s.text.trim().length > 0)
  if (!speechState.supported || valid.length === 0) return

  initSpeech()
  refreshVoices()

  if (pendingTimer !== null) {
    window.clearTimeout(pendingTimer)
    pendingTimer = null
  }

  const myToken = ++queueToken

  const playAt = (index: number) => {
    if (myToken !== queueToken || index >= valid.length) {
      activeUtterance = null
      return
    }

    const seg = valid[index]
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
      }

      const utterance = new SpeechSynthesisUtterance(seg.text)
      utterance.lang = seg.lang
      utterance.rate = seg.rate ?? 0.85
      utterance.pitch = 1.04
      utterance.volume = 1

      const chosen = pickVoiceForLang(seg.lang)
      if (chosen) {
        utterance.voice = chosen
        utterance.lang = chosen.lang
      } else if (seg.lang.startsWith('zh') && rawVoices.length > 0) {
        speechState.lastError = 'no-zh-voice'
      }

      utterance.onend = () => {
        if (myToken === queueToken) {
          playAt(index + 1)
        }
      }

      utterance.onerror = (ev) => {
        if (ev.error && ev.error !== 'interrupted' && ev.error !== 'canceled') {
          speechState.lastError = ev.error
        }
        if (myToken === queueToken && ev.error !== 'interrupted' && ev.error !== 'canceled') {
          playAt(index + 1)
        }
      }

      activeUtterance = utterance
      if (activeUtterance) {
        window.speechSynthesis.speak(activeUtterance)
      }
    } catch (err) {
      speechState.lastError = err instanceof Error ? err.message : 'speech-error'
    }
  }

  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
    window.speechSynthesis.cancel()
    if (speechState.platform === 'ios') {
      // Keep speak() synchronous inside the user tap gesture on iOS/iPadOS WebKit
      playAt(0)
    } else {
      pendingTimer = window.setTimeout(() => {
        pendingTimer = null
        playAt(0)
      }, 80)
    }
  } else {
    playAt(0)
  }
}

export function speakText(text: string, lang: SpeechLang = 'zh-CN', rate = 0.85): void {
  speakSequence([{ text, lang, rate }])
}

export function speakChinese(
  text: string,
  rate = 0.85,
  preferredLang: 'zh-CN' | 'zh-TW' = 'zh-CN'
): void {
  speakText(text, preferredLang, rate)
}
