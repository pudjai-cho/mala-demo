<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import IngredientLabels from '@/components/ui/IngredientLabels.vue'
import LangLabel from '@/components/ui/LangLabel.vue'
import { useI18nContext } from '@/composables/useI18n'
import { INGREDIENT_MAP, formatHanziPair } from '@/data/ingredients'
import { UI_TEXT } from '@/data/uiText'
import type { CheckoutMode, OrderItem } from '@/types/game'
import type { ChinesePriceReading } from '@/utils/chineseNumbers'

const props = defineProps<{
  bowl: OrderItem[]
  enteredPriceStr: string
  enteredPrice: number | null
  bowlTotalChinese: ChinesePriceReading
}>()

const checkoutMode = defineModel<CheckoutMode>('checkoutMode', { required: true })

const emit = defineEmits<{
  back: []
  appendDigit: [digit: string]
  backspace: []
  clearDigits: []
  submit: []
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

const isReadNumberMode = computed(() => checkoutMode.value === 'read_number')
const showLineSubtotals = computed(() => checkoutMode.value === 'calc_subtotals')

const totalHanziDisplay = computed(() =>
  formatHanziPair(props.bowlTotalChinese.hanzi, props.bowlTotalChinese.hanziTrad, cnScript.value)
)

const enteredHanziDisplay = computed(() =>
  props.enteredPrice === null ? numHanzi(0) + '元' : priceHanzi(props.enteredPrice)
)

const keypadRows = computed(() => [
  [1, 2, 3].map((d) => ({ digit: String(d), label: numHanzi(d), pinyin: numPinyin(d) })),
  [4, 5, 6].map((d) => ({ digit: String(d), label: numHanzi(d), pinyin: numPinyin(d) })),
  [7, 8, 9].map((d) => ({ digit: String(d), label: numHanzi(d), pinyin: numPinyin(d) })),
])

function toggleSubtotals() {
  checkoutMode.value = checkoutMode.value === 'calc_subtotals' ? 'calc_manual' : 'calc_subtotals'
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key >= '0' && e.key <= '9') {
    emit('appendDigit', e.key)
  } else if (e.key === 'Backspace') {
    emit('backspace')
  } else if (e.key === 'Escape') {
    emit('clearDigits')
  } else if (e.key === 'Enter' && props.enteredPrice !== null) {
    emit('submit')
  }
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <section
    class="rounded-2xl border-2 border-border-warm bg-surface p-5 shadow-[0_8px_24px_rgba(105,52,22,0.08)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
  >
    <div class="mb-4 flex flex-wrap items-center justify-between gap-2.5">
      <div>
        <h2 class="m-0 text-lg font-extrabold">
          <LangLabel
            :entry="isReadNumberMode ? UI_TEXT.checkoutReadNumberTitle : UI_TEXT.checkoutTitle"
            :prefix="isReadNumberMode ? '🔢 ' : '🧮 '"
            sub-class="mt-0.5 text-xs font-medium text-ink-muted"
          />
        </h2>
        <p class="mt-1 text-sm text-ink-muted">
          {{ cn(isReadNumberMode ? UI_TEXT.checkoutReadNumberSub : UI_TEXT.checkoutSub) }}
        </p>
        <p v-if="showPinyin" class="mt-0.5 text-xs font-semibold text-chili">
          {{ cnPinyin(isReadNumberMode ? UI_TEXT.checkoutReadNumberSub : UI_TEXT.checkoutSub) }}
        </p>
        <p v-if="showThai" class="mt-0.5 text-sm text-ink-muted">
          {{ (isReadNumberMode ? UI_TEXT.checkoutReadNumberSub : UI_TEXT.checkoutSub).th }}
        </p>
        <p v-if="showEnglish" class="mt-0.5 text-sm text-ink-muted">
          {{ (isReadNumberMode ? UI_TEXT.checkoutReadNumberSub : UI_TEXT.checkoutSub).en }}
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          v-if="!isReadNumberMode"
          type="button"
          class="cursor-pointer rounded-2xl border-[1.5px] px-3 py-1.5 text-left transition"
          :class="
            showLineSubtotals
              ? 'border-herb bg-herb-soft text-teal-800 dark:text-teal-200'
              : 'border-border-warm bg-surface text-ink-muted hover:bg-cream-soft'
          "
          @click="toggleSubtotals"
        >
          <LangLabel
            :entry="showLineSubtotals ? UI_TEXT.hideSubtotals : UI_TEXT.showSubtotals"
            main-class="text-xs font-semibold"
            sub-class="mt-0.5 text-[10px] font-medium opacity-80"
          />
        </button>
        <button
          type="button"
          class="cursor-pointer rounded-xl border border-border-warm bg-cream-soft px-3.5 py-2 text-left text-ink-muted transition hover:bg-orange-100 dark:hover:bg-white/10"
          @click="emit('back')"
        >
          <LangLabel
            :entry="UI_TEXT.backToScoop"
            prefix="← "
            main-class="text-sm font-bold"
            sub-class="mt-0.5 text-[10px] font-medium opacity-80"
          />
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4.5 md:grid-cols-[1.2fr_0.9fr]">
      <!-- Receipt items / Chinese number prompt -->
      <div class="flex flex-col gap-3 rounded-2xl border-2 border-dashed border-border-warm bg-surface-alt p-4">
        <h3 class="m-0 text-base font-extrabold">
          <LangLabel
            :entry="UI_TEXT.servedItemsTitle"
            sub-class="mt-0.5 text-xs font-medium text-ink-muted"
          />
        </h3>

        <div class="flex flex-col gap-2">
          <div
            v-for="item in bowl"
            :key="item.ingredientId"
            class="flex items-center justify-between gap-2 rounded-xl border border-border-warm bg-surface px-3 py-2"
          >
            <div class="flex items-center gap-2.5">
              <span class="text-2xl">{{ INGREDIENT_MAP[item.ingredientId]?.emoji }}</span>
              <IngredientLabels :ingredient="INGREDIENT_MAP[item.ingredientId]" inline-extra />
            </div>

            <div class="flex items-center gap-2 font-bold">
              <div class="text-right leading-tight">
                <div>
                  {{ priceHanzi(INGREDIENT_MAP[item.ingredientId]?.price ?? 0) }} ×
                  {{ qtyHanzi(item.quantity) }}
                </div>
                <div v-if="showPinyin" class="text-[10px] font-semibold text-chili">
                  {{ pricePinyin(INGREDIENT_MAP[item.ingredientId]?.price ?? 0) }} ×
                  {{ qtyPinyin(item.quantity) }}
                </div>
              </div>
              <span
                v-if="showLineSubtotals"
                class="rounded-xl bg-amber-100 px-2 py-0.5 text-center leading-tight text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"
              >
                <span class="block text-xs font-extrabold">
                  = {{ priceHanzi((INGREDIENT_MAP[item.ingredientId]?.price ?? 0) * item.quantity) }}
                </span>
                <span v-if="showPinyin" class="block text-[9px] font-semibold text-chili">
                  = {{ pricePinyin((INGREDIENT_MAP[item.ingredientId]?.price ?? 0) * item.quantity) }}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div
          v-if="isReadNumberMode"
          class="mt-auto rounded-2xl border-[1.5px] border-emerald-300 bg-emerald-50 px-4 py-3.5 dark:border-emerald-800/70 dark:bg-emerald-950/35"
        >
          <div class="text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <LangLabel
              :entry="UI_TEXT.readPromptTitle"
              prefix="🗣️ "
              sub-class="mt-0.5 text-[11px] font-medium opacity-80"
            />
          </div>
          <div class="mt-1.5 text-3xl font-black text-emerald-950 dark:text-emerald-100">
            “一共 <span class="text-chili">{{ totalHanziDisplay }}</span>”
          </div>
        </div>

        <div v-else class="mt-auto rounded-2xl border-[1.5px] border-emerald-300 bg-emerald-50 px-3.5 py-3 dark:border-emerald-800/70 dark:bg-emerald-950/35">
          <div class="text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <LangLabel
              :entry="UI_TEXT.speakPromptTitle"
              prefix="🗣️ "
              sub-class="mt-0.5 text-[11px] font-medium opacity-80"
            />
          </div>
          <div class="mt-1 text-2xl font-black text-emerald-950 dark:text-emerald-100">
            “一共
            <span class="inline-block min-w-13 border-b-[3px] border-emerald-500 text-center text-chili">
              {{ enteredPrice === null ? '___' : qtyHanzi(enteredPrice) }}
            </span>
            元！”
          </div>
          <div v-if="showPinyin" class="mt-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            Yīgòng ___ yuán!
          </div>
          <div v-if="showThai" class="mt-0.5 text-xs text-emerald-700 dark:text-emerald-300">ทั้งหมด ___ หยวน</div>
          <div v-if="showEnglish" class="mt-0.5 text-xs text-emerald-700 dark:text-emerald-300">Total ___ yuan</div>
        </div>
      </div>

      <!-- Kid-friendly Number Keypad -->
      <div class="flex flex-col gap-3 rounded-2xl border-2 border-border-warm bg-cream-soft p-4">
        <div
          class="flex items-baseline justify-between rounded-2xl border-2 border-border-warm bg-surface px-4 py-3"
        >
          <span class="text-sm font-bold text-ink-muted">
            <LangLabel
              :entry="UI_TEXT.totalPriceLabel"
              sub-class="mt-0.5 text-[11px] font-medium opacity-80"
            />
          </span>
          <div class="text-right leading-tight">
            <div class="text-3xl font-black text-chili">{{ enteredHanziDisplay }}</div>
            <div v-if="showPinyin" class="mt-0.5 text-xs font-semibold text-chili/85">
              {{ enteredPrice === null ? `${numPinyin(0)} yuán` : pricePinyin(enteredPrice) }}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <template v-for="(row, rIdx) in keypadRows" :key="rIdx">
            <button
              v-for="key in row"
              :key="key.digit"
              type="button"
              class="cursor-pointer rounded-xl border-[1.5px] border-border-warm bg-surface py-3 leading-tight text-ink transition hover:bg-cream-soft active:scale-95"
              @click="emit('appendDigit', key.digit)"
            >
              <div class="text-xl font-extrabold">{{ key.label }}</div>
              <div v-if="showPinyin" class="text-[10px] font-semibold text-chili">
                {{ key.pinyin }}
              </div>
            </button>
          </template>
          <button
            type="button"
            class="cursor-pointer rounded-xl border-[1.5px] border-border-warm bg-[#fae8d8] py-3 leading-tight text-ink-muted transition hover:bg-orange-200 active:scale-95 dark:bg-surface-alt dark:hover:bg-white/10"
            @click="emit('clearDigits')"
          >
            <div class="text-base font-extrabold">{{ cn(UI_TEXT.keypadClear) }}</div>
            <div v-if="showPinyin" class="text-[10px] font-semibold text-chili">
              {{ cnPinyin(UI_TEXT.keypadClear) }}
            </div>
          </button>
          <button
            type="button"
            class="cursor-pointer rounded-xl border-[1.5px] border-border-warm bg-surface py-3 leading-tight text-ink transition hover:bg-cream-soft active:scale-95"
            @click="emit('appendDigit', '0')"
          >
            <div class="text-xl font-extrabold">{{ numHanzi(0) }}</div>
            <div v-if="showPinyin" class="text-[10px] font-semibold text-chili">
              {{ numPinyin(0) }}
            </div>
          </button>
          <button
            type="button"
            class="cursor-pointer rounded-xl border-[1.5px] border-border-warm bg-[#fae8d8] py-3.5 text-base font-extrabold text-ink-muted transition hover:bg-orange-200 active:scale-95 dark:bg-surface-alt dark:hover:bg-white/10"
            @click="emit('backspace')"
          >
            ⌫
          </button>
        </div>

        <button
          type="button"
          class="cursor-pointer rounded-xl bg-chili py-3 text-center font-bold text-white shadow-md shadow-chili/30 transition hover:bg-chili-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
          :disabled="enteredPrice === null"
          @click="emit('submit')"
        >
          <LangLabel
            :entry="UI_TEXT.submitBill"
            prefix="💰 "
            main-class="text-base font-bold"
            pinyin-class="mt-0.5 text-[11px] font-semibold text-amber-100"
            sub-class="mt-0.5 text-[11px] font-medium text-white/85"
          />
        </button>
      </div>
    </div>
  </section>
</template>
