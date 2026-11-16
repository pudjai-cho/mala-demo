<script setup lang="ts">
import { useI18nContext } from '@/composables/useI18n'

defineProps<{
  quantity: number
  min?: number
  max?: number
}>()

const emit = defineEmits<{
  decrement: []
  increment: []
}>()

const { showPinyin, numHanzi, numPinyin } = useI18nContext()
</script>

<template>
  <div class="inline-flex items-center gap-1.5 rounded-xl border border-border-warm bg-surface px-1 py-0.5">
    <button
      type="button"
      class="grid h-7 w-7 cursor-pointer place-items-center rounded-lg bg-cream-soft text-base font-extrabold text-ink transition hover:bg-orange-200 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/15"
      aria-label="Decrease"
      :disabled="min !== undefined && quantity <= min"
      @click="emit('decrement')"
    >
      −
    </button>
    <span class="min-w-[1.75rem] text-center leading-tight">
      <span class="block text-sm font-extrabold">{{ numHanzi(quantity) }}</span>
      <span v-if="showPinyin" class="block text-[9px] font-semibold text-chili">
        {{ numPinyin(quantity) }}
      </span>
    </span>
    <button
      type="button"
      class="grid h-7 w-7 cursor-pointer place-items-center rounded-lg bg-cream-soft text-base font-extrabold text-ink transition hover:bg-orange-200 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/15"
      aria-label="Increase"
      :disabled="max !== undefined && quantity >= max"
      @click="emit('increment')"
    >
      +
    </button>
  </div>
</template>
