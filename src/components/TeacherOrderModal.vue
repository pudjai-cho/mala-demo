<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import CategorySectionHeader from '@/components/ui/CategorySectionHeader.vue'
import LangLabel from '@/components/ui/LangLabel.vue'
import { useI18nContext } from '@/composables/useI18n'
import {
  INGREDIENT_MAP,
  getCategorySectionGridClass,
  getCategorySectionWrapperClass,
  getIngredientCategorySections,
} from '@/data/ingredients'
import { UI_TEXT } from '@/data/uiText'
import type { Ingredient, OrderItem } from '@/types/game'

const emit = defineEmits<{
  close: []
  apply: [items: OrderItem[]]
}>()

const {
  showPinyin,
  showThai,
  showEnglish,
  ingName,
  ingPinyin,
  priceHanzi,
  pricePinyin,
  numHanzi,
  qtyHanzi,
  qtyPinyin,
} = useI18nContext()

const selectedMap = ref<Record<string, number>>({})

const selectedItems = computed<OrderItem[]>(() =>
  Object.entries(selectedMap.value)
    .filter(([, qty]) => qty > 0)
    .map(([ingredientId, quantity]) => ({ ingredientId, quantity }))
)

const selectedDetails = computed<Array<{ item: OrderItem; ing: Ingredient }>>(() =>
  selectedItems.value.flatMap((item) => {
    const ing = INGREDIENT_MAP[item.ingredientId]
    return ing ? [{ item, ing }] : []
  })
)

const previewTotal = computed(() =>
  selectedDetails.value.reduce((sum, { item, ing }) => sum + ing.price * item.quantity, 0)
)

const categorySections = computed(() => getIngredientCategorySections('all'))

function getSelectedQty(id: string): number {
  return selectedMap.value[id] ?? 0
}

function adjust(id: string, delta: number) {
  const next = (selectedMap.value[id] ?? 0) + delta
  if (next <= 0) {
    const copy = { ...selectedMap.value }
    delete copy[id]
    selectedMap.value = copy
  } else {
    selectedMap.value = { ...selectedMap.value, [id]: Math.min(9, next) }
  }
}

function handleConfirm() {
  if (selectedItems.value.length === 0) return
  emit('apply', selectedItems.value)
  selectedMap.value = {}
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <div
    class="fixed inset-0 z-50 grid place-items-center bg-[#22150e]/55 p-2 backdrop-blur-[2px] sm:p-4"
    role="dialog"
    aria-modal="true"
    @click.self="emit('close')"
  >
    <div
      class="flex max-h-[92vh] w-full max-w-[860px] flex-col overflow-hidden rounded-3xl border-2 border-border-warm bg-surface shadow-2xl"
    >
      <!-- Pinned Header -->
      <div class="flex shrink-0 items-center justify-between gap-3 border-b border-border-warm bg-surface px-4 py-2.5">
        <div class="flex min-w-0 items-center gap-2.5">
          <div
            class="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border-warm bg-gradient-to-br from-rose-50 to-orange-100 text-xl dark:from-rose-950/60 dark:to-orange-950/60"
          >
            👩‍🏫
          </div>
          <div class="min-w-0">
            <h2 class="m-0 text-base font-extrabold leading-tight text-ink">
              <LangLabel
                :entry="UI_TEXT.teacherModalTitle"
                pinyin-class="mt-0.5 text-[11px] font-semibold text-chili"
                sub-class="mt-0.5 text-[11px] font-semibold text-ink-muted"
              />
            </h2>
            <p class="mt-0.5 text-[11px] leading-snug text-ink-muted sm:text-xs">
              <LangLabel
                :entry="UI_TEXT.teacherModalDesc"
                pinyin-class="mt-0.5 text-[11px] font-semibold text-chili"
                sub-class="mt-0.5 text-[11px] font-normal text-ink-muted"
              />
            </p>
          </div>
        </div>

        <button
          type="button"
          class="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-xl bg-cream-soft font-extrabold text-ink transition hover:bg-orange-100 dark:hover:bg-white/10"
          aria-label="Close modal"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <!-- Scrollable Ingredient Sections -->
      <div class="flex-1 overflow-y-auto px-4 py-2.5">
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-6 md:grid-cols-8 md:grid-flow-dense">
          <section
            v-for="section in categorySections"
            :key="section.id"
            class="space-y-1.5 rounded-2xl border p-2"
            :class="[getCategorySectionWrapperClass(section.items.length), section.category?.sectionClass]"
          >
            <CategorySectionHeader v-if="section.category" :category="section.category" compact />

            <div class="grid gap-1.5" :class="getCategorySectionGridClass(section.items.length)">
              <div
                v-for="ing in section.items"
                :key="ing.id"
                role="button"
                tabindex="0"
                class="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 px-1 pt-2 pb-1.5 text-center transition select-none hover:-translate-y-0.5 hover:border-broth hover:shadow-md active:scale-[0.96]"
                :class="
                  getSelectedQty(ing.id) > 0
                    ? 'border-chili bg-surface-active'
                    : 'border-border-warm bg-surface'
                "
                @click="adjust(ing.id, 1)"
                @keydown.enter.self="adjust(ing.id, 1)"
                @keydown.space.self.prevent="adjust(ing.id, 1)"
              >
                <div
                  v-if="getSelectedQty(ing.id) > 0"
                  class="absolute -top-1.5 -right-1.5 flex items-center overflow-hidden rounded-full bg-chili text-white shadow-md shadow-chili/35"
                >
                  <button
                    type="button"
                    class="grid h-5.5 w-5.5 cursor-pointer place-items-center bg-black/15 text-xs font-black transition hover:bg-black/30 active:scale-90"
                    aria-label="Decrease quantity"
                    title="Remove 1"
                    @click.stop="adjust(ing.id, -1)"
                  >
                    −
                  </button>
                  <span class="grid h-5.5 min-w-5 place-items-center px-1 text-[11px] font-extrabold">
                    {{ numHanzi(getSelectedQty(ing.id)) }}
                  </span>
                </div>

                <div
                  class="mb-0.5 grid h-8 w-8 place-items-center rounded-lg text-lg transition-all"
                  :style="{ backgroundColor: ing.accent }"
                >
                  {{ ing.emoji }}
                </div>

                <div class="text-sm font-extrabold leading-tight text-ink">{{ ingName(ing) }}</div>
                <div v-if="showPinyin" class="text-[10px] font-semibold leading-tight text-chili">
                  {{ ingPinyin(ing) }}
                </div>
                <div v-if="showThai" class="text-[10px] leading-tight text-ink-muted">
                  {{ ing.thai }}
                </div>
                <div v-if="showEnglish" class="text-[10px] font-semibold leading-tight text-gray-600 dark:text-ink-muted">
                  {{ ing.english }}
                </div>

                <div
                  class="mt-0.5 inline-flex items-baseline gap-1 rounded-lg bg-amber-100 px-1.5 py-0.5 leading-none text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"
                >
                  <span class="text-[10px] font-extrabold">{{ priceHanzi(ing.price) }}</span>
                  <span v-if="showPinyin" class="text-[9px] font-semibold text-chili">
                    {{ pricePinyin(ing.price) }}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- Pinned Footer -->
      <div
        class="flex shrink-0 flex-col gap-2.5 border-t border-border-warm bg-surface px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="min-w-0 flex-1 space-y-1.5 leading-snug">
          <LangLabel
            :entry="UI_TEXT.selectedCount"
            :vars="{ count: qtyHanzi(selectedItems.length), total: qtyHanzi(previewTotal) }"
            :pinyin-vars="{
              count: qtyPinyin(selectedItems.length),
              total: qtyPinyin(previewTotal),
            }"
            main-class="text-sm font-extrabold text-ink"
            pinyin-class="mt-0.5 text-[11px] font-semibold text-chili"
            sub-class="mt-0.5 text-xs font-medium text-ink-muted"
          />

          <div
            v-if="selectedDetails.length > 0"
            class="flex max-h-[68px] flex-wrap items-center gap-1.5 overflow-y-auto pt-0.5"
          >
            <div
              v-for="{ item, ing } in selectedDetails"
              :key="item.ingredientId"
              class="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50/90 py-0.5 pr-0.5 pl-1.5 text-xs shadow-2xs dark:border-rose-800/70 dark:bg-rose-950/45"
            >
              <span class="text-sm leading-none">{{ ing.emoji }}</span>
              <span class="font-bold text-ink">{{ ingName(ing) }}</span>
              <span v-if="showPinyin" class="text-[10px] font-semibold text-chili">
                {{ ingPinyin(ing) }}
              </span>
              <div class="inline-flex items-center overflow-hidden rounded-lg bg-chili text-white">
                <button
                  type="button"
                  class="grid h-5 w-5 cursor-pointer place-items-center bg-black/15 text-[11px] font-black transition hover:bg-black/30 active:scale-90"
                  aria-label="Decrease quantity"
                  title="Remove 1"
                  @click="adjust(item.ingredientId, -1)"
                >
                  −
                </button>
                <span class="px-1.5 text-[10px] leading-none font-extrabold">
                  ×{{ numHanzi(item.quantity) }}
                </span>
                <button
                  type="button"
                  class="grid h-5 w-5 cursor-pointer place-items-center bg-black/15 text-[11px] font-black transition hover:bg-black/30 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
                  :disabled="item.quantity >= 9"
                  aria-label="Increase quantity"
                  title="Add 1"
                  @click="adjust(item.ingredientId, 1)"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            class="cursor-pointer rounded-xl border border-border-warm bg-cream-soft px-3.5 py-2 text-left leading-tight text-ink-muted transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-45 dark:hover:bg-white/10"
            :disabled="selectedItems.length === 0"
            @click="selectedMap = {}"
          >
            <LangLabel
              :entry="UI_TEXT.clearSelection"
              main-class="text-sm font-bold"
              pinyin-class="mt-0.5 text-[11px] font-semibold text-chili"
              sub-class="mt-0.5 text-[11px] font-medium opacity-80"
            />
          </button>

          <button
            type="button"
            class="cursor-pointer rounded-xl bg-chili px-4 py-2 text-left leading-tight text-white shadow-md shadow-chili/30 transition hover:bg-chili-dark disabled:cursor-not-allowed disabled:opacity-45"
            :disabled="selectedItems.length === 0"
            @click="handleConfirm"
          >
            <LangLabel
              :entry="UI_TEXT.startRound"
              prefix="✅ "
              main-class="text-sm font-extrabold"
              pinyin-class="mt-0.5 text-[11px] font-semibold text-amber-100"
              sub-class="mt-0.5 text-[11px] font-medium text-white/90"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
