<script setup lang="ts">
import { useI18nContext } from '@/composables/useI18n'
import type { Ingredient } from '@/types/game'

defineProps<{
  ingredient: Ingredient | undefined
  inlineExtra?: boolean
  showUnitPrice?: boolean
}>()

const { showPinyin, showThai, showEnglish, ingName, ingPinyin, priceHanzi, pricePinyin } =
  useI18nContext()
</script>

<template>
  <div v-if="ingredient" class="leading-snug">
    <div class="flex flex-wrap items-baseline gap-x-1.5">
      <strong class="font-extrabold text-ink">{{ ingName(ingredient) }}</strong>
      <span v-if="showPinyin" class="text-xs font-semibold text-chili">
        {{ ingPinyin(ingredient) }}
      </span>
    </div>
    <div
      v-if="showThai || showEnglish || showUnitPrice"
      class="text-xs text-ink-muted"
      :class="inlineExtra ? 'flex flex-wrap gap-x-1' : 'flex flex-col'"
    >
      <span v-if="showThai">{{ ingredient.thai }}</span>
      <span v-if="showEnglish">{{ ingredient.english }}</span>
      <span v-if="showUnitPrice" class="font-bold text-amber-700 dark:text-amber-300">
        {{ priceHanzi(ingredient.price) }}
        <span v-if="showPinyin" class="font-semibold text-chili">
          ({{ pricePinyin(ingredient.price) }})
        </span>
      </span>
    </div>
  </div>
</template>
