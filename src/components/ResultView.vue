<script setup lang="ts">
import { computed } from 'vue'
import IngredientLabels from '@/components/ui/IngredientLabels.vue'
import LangLabel from '@/components/ui/LangLabel.vue'
import { useI18nContext } from '@/composables/useI18n'
import { formatHanziPair } from '@/data/ingredients'
import { UI_TEXT } from '@/data/uiText'
import type { CheckoutMode, OrderComparisonItem } from '@/types/game'
import type { ChinesePriceReading } from '@/utils/chineseNumbers'

const props = defineProps<{
  checkoutMode: CheckoutMode
  bowlTotalPrice: number
  enteredPrice: number | null
  isPriceCorrect: boolean
  isBowlExact: boolean
  bowlTotalChinese: ChinesePriceReading
  comparisonItems: OrderComparisonItem[]
}>()

const emit = defineEmits<{
  nextRound: []
  speakTotal: [lang: 'zh' | 'th' | 'en']
}>()

const {
  cnScript,
  showPinyin,
  showThai,
  showEnglish,
  cn,
  cnPinyin,
  priceHanzi,
  pricePinyin,
  numHanzi,
  numPinyin,
  qtyHanzi,
  qtyPinyin,
} = useI18nContext()

const isAutoCheckout = computed(() => props.checkoutMode === 'auto')

const resultHeadline = computed(() => {
  if (isAutoCheckout.value) {
    return props.isBowlExact ? UI_TEXT.resultBowlPerfectNoMath : UI_TEXT.resultTryAgain
  }
  if (props.isBowlExact && props.isPriceCorrect) return UI_TEXT.resultPerfect
  if (props.isBowlExact) return UI_TEXT.resultBowlOnly
  if (props.isPriceCorrect) return UI_TEXT.resultPriceOnly
  return UI_TEXT.resultTryAgain
})

const totalHanziDisplay = computed(() =>
  formatHanziPair(props.bowlTotalChinese.hanzi, props.bowlTotalChinese.hanziTrad, cnScript.value)
)

const isPerfect = computed(() =>
  isAutoCheckout.value ? props.isBowlExact : props.isBowlExact && props.isPriceCorrect
)

function statusMeta(status: OrderComparisonItem['status']) {
  if (status === 'match') {
    return {
      rowClass: 'border-green-300 bg-surface dark:border-green-800/70',
      pillClass: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
      entry: UI_TEXT.statusMatch,
    }
  }
  if (status === 'missing') {
    return {
      rowClass: 'border-red-300 bg-red-50 dark:border-red-800/70 dark:bg-red-950/35',
      pillClass: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
      entry: UI_TEXT.statusMissing,
    }
  }
  return {
    rowClass: 'border-amber-300 bg-amber-50 dark:border-amber-800/70 dark:bg-amber-950/35',
    pillClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
    entry: status === 'extra' ? UI_TEXT.statusExtra : UI_TEXT.statusPartial,
  }
}
</script>

<template>
  <section
    class="rounded-2xl border-2 border-border-warm bg-surface p-5 shadow-[0_8px_24px_rgba(105,52,22,0.08)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
  >
    <div
      class="mb-4 flex items-center gap-3.5 rounded-2xl border-2 px-4.5 py-3.5"
      :class="
        isPerfect
          ? 'animate-celebrate border-emerald-400 bg-emerald-50 dark:border-emerald-700/80 dark:bg-emerald-950/35'
          : 'border-orange-300 bg-orange-50 dark:border-orange-800/70 dark:bg-orange-950/35'
      "
    >
      <div class="text-4xl" :class="{ 'animate-bounce-star': isPerfect }">
        {{ isPerfect ? '🎉' : isBowlExact || isPriceCorrect ? '👏' : '💪' }}
      </div>
      <div>
        <h2 class="m-0 text-lg font-extrabold">{{ cn(resultHeadline, { star: numHanzi(1) }) }}</h2>
        <p v-if="showPinyin" class="mt-0.5 text-xs font-semibold text-chili">
          {{ cnPinyin(resultHeadline, { star: numPinyin(1) }) }}
        </p>
        <p v-if="showThai" class="mt-0.5 text-sm text-ink-muted">
          {{ resultHeadline.th.replaceAll('{star}', numHanzi(1)) }}
        </p>
        <p v-if="showEnglish" class="mt-0.5 text-sm text-ink-muted">
          {{ resultHeadline.en.replaceAll('{star}', numHanzi(1)) }}
        </p>
        <p class="mt-1 text-xs text-ink-muted">
          <LangLabel :entry="UI_TEXT.resultSubPrompt" sub-class="mt-0.5 text-[11px] opacity-85" />
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-[1.2fr_1fr]">
      <!-- Order vs Served comparison -->
      <div class="flex flex-col gap-3 rounded-2xl border-[1.5px] border-border-warm bg-surface-alt p-4">
        <h3 class="m-0 text-base font-extrabold">
          <LangLabel
            :entry="UI_TEXT.compareTitle"
            prefix="📋 "
            sub-class="mt-0.5 text-xs font-medium text-ink-muted"
          />
        </h3>

        <div class="flex flex-col gap-2">
          <div
            v-for="row in comparisonItems"
            :key="row.ingredient.id"
            class="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border-[1.5px] px-3 py-2"
            :class="statusMeta(row.status).rowClass"
          >
            <div class="flex items-center gap-2.5">
              <span class="text-2xl">{{ row.ingredient.emoji }}</span>
              <IngredientLabels :ingredient="row.ingredient" inline-extra />
            </div>

            <div class="flex items-center gap-2.5 text-sm">
              <div class="leading-tight">
                <span>
                  {{ cn(UI_TEXT.orderedLabel) }}: <strong>{{ qtyHanzi(row.orderedQty) }}</strong>
                </span>
                <div v-if="showPinyin" class="text-[10px] font-semibold text-chili">
                  {{ cnPinyin(UI_TEXT.orderedLabel) }}: {{ qtyPinyin(row.orderedQty) }}
                </div>
              </div>
              <div class="leading-tight">
                <span>
                  {{ cn(UI_TEXT.servedLabel) }}: <strong>{{ qtyHanzi(row.servedQty) }}</strong>
                </span>
                <div v-if="showPinyin" class="text-[10px] font-semibold text-chili">
                  {{ cnPinyin(UI_TEXT.servedLabel) }}: {{ qtyPinyin(row.servedQty) }}
                </div>
              </div>
              <span
                class="rounded-2xl px-2.5 py-0.5 text-xs font-bold"
                :class="statusMeta(row.status).pillClass"
              >
                <LangLabel
                  :entry="statusMeta(row.status).entry"
                  sub-class="text-[10px] font-medium opacity-80"
                />
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Price & Chinese Number Reading -->
      <div class="flex flex-col gap-3 rounded-2xl border-[1.5px] border-border-warm bg-surface-alt p-4">
        <h3 class="m-0 text-base font-extrabold">
          <LangLabel
            :entry="UI_TEXT.priceCheckTitle"
            prefix="💰 "
            sub-class="mt-0.5 text-xs font-medium text-ink-muted"
          />
        </h3>

        <div
          class="grid gap-2.5"
          :class="isAutoCheckout ? 'grid-cols-1' : 'grid-cols-2'"
        >
          <div
            v-if="!isAutoCheckout"
            class="flex flex-col gap-0.5 rounded-xl border border-border-warm bg-surface px-3 py-2.5"
          >
            <span class="text-xs font-bold text-ink-muted">
              <LangLabel :entry="UI_TEXT.yourAnswer" sub-class="text-[10px] font-medium opacity-80" />
            </span>
            <strong
              class="text-xl font-extrabold"
              :class="isPriceCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
            >
              {{ priceHanzi(enteredPrice ?? 0) }} {{ isPriceCorrect ? '✅' : '❌' }}
            </strong>
            <span v-if="showPinyin" class="text-xs font-semibold text-chili">
              {{ pricePinyin(enteredPrice ?? 0) }}
            </span>
          </div>
          <div class="flex flex-col gap-0.5 rounded-xl border border-border-warm bg-surface px-3 py-2.5">
            <span class="text-xs font-bold text-ink-muted">
              <LangLabel :entry="UI_TEXT.actualTotal" sub-class="text-[10px] font-medium opacity-80" />
            </span>
            <strong class="text-xl font-extrabold text-chili">{{ priceHanzi(bowlTotalPrice) }}</strong>
            <span v-if="showPinyin" class="text-xs font-semibold text-chili/85">
              {{ pricePinyin(bowlTotalPrice) }}
            </span>
          </div>
        </div>

        <div class="rounded-2xl border-[1.5px] border-amber-300 bg-amber-100 p-3.5 text-center dark:border-amber-700/70 dark:bg-amber-950/45">
          <div class="text-xs font-bold text-amber-800 dark:text-amber-200">
            <LangLabel :entry="UI_TEXT.readingLabel" sub-class="mt-0.5 text-[11px] font-medium opacity-80" />
          </div>
          <div class="mt-1 text-3xl font-black text-ink">一共 {{ totalHanziDisplay }}</div>
          <div v-if="showPinyin" class="mb-2.5 text-base font-bold text-chili">
            Yīgòng {{ bowlTotalChinese.pinyin }}
          </div>
          <div class="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              class="flex-1 cursor-pointer rounded-xl border-[1.5px] border-amber-500 bg-surface px-3 py-2 text-sm font-bold text-amber-900 transition hover:bg-amber-50 dark:border-amber-600 dark:text-amber-200 dark:hover:bg-amber-900/40"
              @click="emit('speakTotal', 'zh')"
            >
              🔊 “一共{{ totalHanziDisplay }}”
            </button>
            <button
              v-if="showThai"
              type="button"
              class="cursor-pointer rounded-xl border-[1.5px] border-amber-500 bg-surface px-3 py-2 text-sm font-bold text-amber-900 transition hover:bg-amber-50 dark:border-amber-600 dark:text-amber-200 dark:hover:bg-amber-900/40"
              @click="emit('speakTotal', 'th')"
            >
              🔊 ไทย
            </button>
            <button
              v-if="showEnglish"
              type="button"
              class="cursor-pointer rounded-xl border-[1.5px] border-amber-500 bg-surface px-3 py-2 text-sm font-bold text-amber-900 transition hover:bg-amber-50 dark:border-amber-600 dark:text-amber-200 dark:hover:bg-amber-900/40"
              @click="emit('speakTotal', 'en')"
            >
              🔊 EN
            </button>
          </div>
        </div>

        <button
          type="button"
          class="mt-auto cursor-pointer rounded-xl bg-chili py-3 text-center font-bold text-white shadow-md shadow-chili/30 transition hover:bg-chili-dark active:scale-[0.98]"
          @click="emit('nextRound')"
        >
          <LangLabel
            :entry="UI_TEXT.nextCustomer"
            prefix="➡️ "
            main-class="text-base font-bold"
            pinyin-class="mt-0.5 text-[11px] font-semibold text-amber-100"
            sub-class="mt-0.5 text-[11px] font-medium text-white/85"
          />
        </button>
      </div>
    </div>
  </section>
</template>
