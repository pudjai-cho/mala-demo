<script setup lang="ts">
import { computed } from 'vue'
import { useI18nContext } from '@/composables/useI18n'
import {
  formatCategoryExtras,
  formatHanziPair,
  type IngredientCategory,
} from '@/data/ingredients'

const props = defineProps<{
  category: IngredientCategory
  compact?: boolean
}>()

const { cnScript, showPinyin, showThai, showEnglish } = useI18nContext()

const extras = computed(() =>
  formatCategoryExtras(props.category, showThai.value, showEnglish.value)
)
</script>

<template>
  <div class="flex items-start gap-2">
    <span
      class="mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full"
      :style="{ backgroundColor: category.color }"
    />
    <div class="leading-tight">
      <div class="flex flex-wrap items-baseline gap-x-2">
        <h3 class="m-0 text-sm font-extrabold text-ink">
          {{ formatHanziPair(category.hanzi, category.hanziTrad, cnScript) }}
        </h3>
        <span v-if="showPinyin" class="text-xs font-semibold text-chili">
          {{ category.pinyin }}
        </span>
        <span v-if="compact && extras" class="text-[11px] font-medium text-ink-muted">
          · {{ extras }}
        </span>
      </div>
      <div v-if="!compact && extras" class="mt-0.5 text-[11px] font-medium text-ink-muted">
        {{ extras }}
      </div>
    </div>
  </div>
</template>
