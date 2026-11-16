import { ref, watch, type Ref } from 'vue'

/**
 * Reactive ref backed by localStorage with safe JSON parsing and optional validation.
 */
export function usePersistedRef<T>(
  key: string,
  defaultValue: T,
  validate?: (val: unknown) => val is T
): Ref<T> {
  const readInitial = (): T => {
    if (typeof window === 'undefined') return defaultValue
    try {
      const raw = window.localStorage.getItem(key)
      if (raw === null) return defaultValue
      const parsed: unknown = JSON.parse(raw)
      if (validate && !validate(parsed)) return defaultValue
      return parsed as T
    } catch {
      return defaultValue
    }
  }

  const state = ref<T>(readInitial()) as Ref<T>

  watch(
    state,
    (next) => {
      if (typeof window === 'undefined') return
      try {
        window.localStorage.setItem(key, JSON.stringify(next))
      } catch {
        // Ignore storage quota or private-mode errors
      }
    },
    { deep: true }
  )

  return state
}
