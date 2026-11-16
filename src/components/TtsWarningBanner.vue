<script setup lang="ts">
import { ref } from 'vue'
import { useI18nContext } from '@/composables/useI18n'
import { UI_TEXT } from '@/data/uiText'
import { speechState } from '@/utils/speech'

const dismissed = ref(false)
const { showThai, showEnglish, cn } = useI18nContext()
</script>

<template>
  <div
    v-if="
      !dismissed &&
      speechState.supported &&
      speechState.voicesLoaded &&
      speechState.zhVoices.length === 0
    "
    class="flex items-start justify-between gap-3 rounded-2xl border-2 border-amber-400 bg-amber-50 px-4 py-3 text-amber-950"
  >
    <div class="flex flex-col gap-2.5">
      <div>
        <strong class="text-sm font-bold">{{ cn(UI_TEXT.ttsWarningTitle) }}</strong>
        <p class="mt-1 text-xs leading-relaxed">{{ cn(UI_TEXT.ttsWarningBody) }}</p>
      </div>

      <div v-if="showThai" class="border-t border-dashed border-amber-400 pt-2">
        <strong class="text-sm font-bold">{{ UI_TEXT.ttsWarningTitle.th }}</strong>
        <p class="mt-1 text-xs leading-relaxed">{{ UI_TEXT.ttsWarningBody.th }}</p>
      </div>

      <div v-if="showEnglish" class="border-t border-dashed border-amber-400 pt-2">
        <strong class="text-sm font-bold">{{ UI_TEXT.ttsWarningTitle.en }}</strong>
        <p class="mt-1 text-xs leading-relaxed">{{ UI_TEXT.ttsWarningBody.en }}</p>
      </div>
    </div>

    <button
      type="button"
      class="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg bg-amber-100 font-extrabold text-amber-900 hover:bg-amber-200"
      aria-label="Dismiss warning"
      @click="dismissed = true"
    >
      ✕
    </button>
  </div>
</template>
