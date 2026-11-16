import { watchEffect } from 'vue'
import { usePersistedRef } from '@/composables/usePersistedRef'

export type ThemeMode = 'light' | 'dark'

const isThemeMode = (v: unknown): v is ThemeMode => v === 'light' || v === 'dark'

const themeMode = usePersistedRef<ThemeMode>('mala-demo:v1:theme', 'light', isThemeMode)

if (typeof document !== 'undefined') {
  watchEffect(() => {
    document.documentElement.classList.toggle('dark', themeMode.value === 'dark')
  })
}

export function useTheme() {
  function toggleTheme() {
    themeMode.value = themeMode.value === 'dark' ? 'light' : 'dark'
  }

  return {
    themeMode,
    toggleTheme,
  }
}
