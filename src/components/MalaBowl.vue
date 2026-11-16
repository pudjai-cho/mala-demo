<script setup lang="ts">
import IngredientLabels from '@/components/ui/IngredientLabels.vue'
import LangLabel from '@/components/ui/LangLabel.vue'
import QtyStepper from '@/components/ui/QtyStepper.vue'
import { useI18nContext } from '@/composables/useI18n'
import { INGREDIENT_MAP } from '@/data/ingredients'
import { UI_TEXT } from '@/data/uiText'
import type { CheckoutMode, OrderItem } from '@/types/game'

defineProps<{
  bowl: OrderItem[]
  bowlCount: number
  checkoutMode: CheckoutMode
}>()

const emit = defineEmits<{
  add: [ingredientId: string]
  decrement: [ingredientId: string]
  clear: []
  serve: []
}>()

const { showPinyin, showThai, showEnglish, cn, cnPinyin, ingName, qtyHanzi, qtyPinyin } =
  useI18nContext()
</script>

<template>
  <aside
    class="rounded-2xl border-2 border-border-warm bg-white p-4.5 shadow-[0_8px_24px_rgba(105,52,22,0.08)]"
  >
    <div class="flex items-start justify-between gap-2">
      <div>
        <h2 class="m-0 text-lg font-extrabold">
          <LangLabel
            :entry="UI_TEXT.bowlTitle"
            prefix="🧾 "
            sub-class="mt-0.5 text-xs font-medium text-ink-muted"
          />
        </h2>
        <p class="mt-1 text-xs text-ink-muted">
          <LangLabel :entry="UI_TEXT.bowlSubtitle" sub-class="mt-0.5 text-[11px] opacity-85" />
        </p>
      </div>
      <div
        class="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-chili"
      >
        <div class="text-center leading-none">
          <span class="block text-lg font-black">{{ qtyHanzi(bowlCount) }}</span>
          <span v-if="showPinyin" class="mt-0.5 block text-[9px] font-semibold text-chili/85">
            {{ qtyPinyin(bowlCount) }}
          </span>
        </div>
        <LangLabel
          :entry="UI_TEXT.pieceUnit"
          main-class="text-xs font-extrabold"
          sub-class="mt-0.5 text-[10px] font-medium opacity-80"
        />
      </div>
    </div>

    <!-- Visual Pot Preview -->
    <div
      class="my-3.5 rounded-3xl bg-gradient-to-br from-[#4b3b34] to-[#2f241f] p-2.5 shadow-inner"
    >
      <div
        class="flex min-h-[112px] items-center justify-center rounded-2xl border-[3px] border-amber-500 p-3"
        style="background: radial-gradient(circle at center, #ff7b54 0%, #d9381e 75%, #b91c1c 100%)"
      >
        <div v-if="bowl.length === 0" class="text-center text-sm text-amber-50">
          <span class="text-2xl">🧾</span>
          <p class="mt-1">{{ cn(UI_TEXT.bowlEmpty) }}</p>
          <p v-if="showPinyin" class="mt-0.5 text-xs font-semibold text-amber-200">
            {{ cnPinyin(UI_TEXT.bowlEmpty) }}
          </p>
          <p v-if="showThai" class="mt-0.5 text-xs opacity-90">{{ UI_TEXT.bowlEmpty.th }}</p>
          <p v-if="showEnglish" class="mt-0.5 text-xs opacity-90">{{ UI_TEXT.bowlEmpty.en }}</p>
        </div>
        <div v-else class="flex flex-wrap justify-center gap-1.5">
          <template v-for="item in bowl" :key="item.ingredientId">
            <span
              v-for="n in item.quantity"
              :key="`${item.ingredientId}-${n}`"
              class="animate-pop-in grid h-10 w-10 place-items-center rounded-full bg-white/20 text-2xl"
              :title="ingName(INGREDIENT_MAP[item.ingredientId])"
            >
              {{ INGREDIENT_MAP[item.ingredientId]?.emoji }}
            </span>
          </template>
        </div>
      </div>
    </div>

    <!-- Itemized Bowl List -->
    <div v-if="bowl.length > 0" class="mb-3.5 flex max-h-[280px] flex-col gap-2 overflow-y-auto">
      <div
        v-for="item in bowl"
        :key="item.ingredientId"
        class="flex items-center justify-between gap-2 rounded-xl border border-border-warm bg-[#fffaf5] px-2.5 py-2"
      >
        <div class="flex items-center gap-2.5">
          <span class="text-2xl">{{ INGREDIENT_MAP[item.ingredientId]?.emoji }}</span>
          <IngredientLabels
            :ingredient="INGREDIENT_MAP[item.ingredientId]"
            inline-extra
            show-unit-price
          />
        </div>

        <QtyStepper
          :quantity="item.quantity"
          @decrement="emit('decrement', item.ingredientId)"
          @increment="emit('add', item.ingredientId)"
        />
      </div>
    </div>

    <div class="flex gap-2.5">
      <button
        type="button"
        class="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-border-warm bg-cream-soft px-3.5 py-2.5 text-center font-bold text-ink-muted transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-45"
        :disabled="bowl.length === 0"
        @click="emit('clear')"
      >
        <LangLabel
          :entry="UI_TEXT.clearBowl"
          prefix="🗑️ "
          main-class="text-sm font-bold"
          sub-class="mt-0.5 text-[10px] font-medium opacity-80"
        />
      </button>
      <button
        type="button"
        class="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-chili px-4 py-3 text-center font-bold text-white shadow-md shadow-chili/30 transition hover:bg-chili-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
        :disabled="bowl.length === 0"
        @click="emit('serve')"
      >
        <LangLabel
          :entry="checkoutMode === 'auto' ? UI_TEXT.serveOnly : UI_TEXT.serveAndPay"
          prefix="🛎️ "
          main-class="text-base font-bold"
          pinyin-class="mt-0.5 text-[11px] font-semibold text-amber-100"
          sub-class="mt-0.5 text-[11px] font-medium text-white/85"
        />
      </button>
    </div>
  </aside>
</template>
