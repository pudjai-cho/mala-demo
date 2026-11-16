<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18nContext } from '@/composables/useI18n'
import { UI_TEXT, type MultiLangText } from '@/data/uiText'
import { speechState, type SpeechPlatform } from '@/utils/speech'

const dismissed = ref(false)
const { showThai, showEnglish, cn } = useI18nContext()

const PLATFORM_BODY_MAP: Record<SpeechPlatform, MultiLangText> = {
  windows: UI_TEXT.ttsWarningBodyWindows,
  macos: UI_TEXT.ttsWarningBodyMacos,
  ios: UI_TEXT.ttsWarningBodyIos,
  android: UI_TEXT.ttsWarningBodyAndroid,
  other: UI_TEXT.ttsWarningBodyOther,
}

const showBanner = computed(() => {
  if (dismissed.value) return false
  if (!speechState.supported) return true
  return speechState.voicesCheckComplete && speechState.zhVoices.length === 0
})

const warningTitle = computed(() =>
  speechState.supported ? UI_TEXT.ttsWarningTitle : UI_TEXT.ttsUnsupportedTitle
)

const warningBody = computed(() =>
  speechState.supported ? PLATFORM_BODY_MAP[speechState.platform] : UI_TEXT.ttsUnsupportedBody
)
</script>

<template>
  <div
    v-if="showBanner"
    class="flex items-start justify-between gap-3 rounded-2xl border-2 border-amber-400 bg-amber-50 px-4 py-3 text-amber-950 dark:border-amber-700 dark:bg-amber-950/45 dark:text-amber-100"
  >
    <div class="flex flex-col gap-2.5">
      <div>
        <strong class="text-sm font-bold">{{ cn(warningTitle) }}</strong>
        <p class="mt-1 text-xs leading-relaxed">{{ cn(warningBody) }}</p>
      </div>

      <div v-if="showThai" class="border-t border-dashed border-amber-400 pt-2">
        <strong class="text-sm font-bold">{{ warningTitle.th }}</strong>
        <p class="mt-1 text-xs leading-relaxed">{{ warningBody.th }}</p>
      </div>

      <div v-if="showEnglish" class="border-t border-dashed border-amber-400 pt-2">
        <strong class="text-sm font-bold">{{ warningTitle.en }}</strong>
        <p class="mt-1 text-xs leading-relaxed">{{ warningBody.en }}</p>
      </div>
    </div>

    <button
      type="button"
      class="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg bg-amber-100 font-extrabold text-amber-900 hover:bg-amber-200 dark:bg-amber-900/60 dark:text-amber-100 dark:hover:bg-amber-800/70"
      aria-label="Dismiss warning"
      @click="dismissed = true"
    >
      ✕
    </button>
  </div>
</template>
