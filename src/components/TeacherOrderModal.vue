<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import CategorySectionHeader from '@/components/ui/CategorySectionHeader.vue'
import LangLabel from '@/components/ui/LangLabel.vue'
import QtyStepper from '@/components/ui/QtyStepper.vue'
import { useI18nContext } from '@/composables/useI18n'
import {
  CATEGORIES,
  INGREDIENTS,
  formatCategoryExtras,
  formatHanziPair,
  getIngredientCategorySections,
} from '@/data/ingredients'
import { UI_TEXT } from '@/data/uiText'
import type { CategoryId, OrderItem, OrderMode } from '@/types/game'

const props = defineProps<{
  initialMode: OrderMode
}>()

const emit = defineEmits<{
  close: []
  apply: [items: OrderItem[], mode: OrderMode]
}>()

const {
  cnScript,
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
const chosenMode = ref<OrderMode>(props.initialMode)
const activeCategory = ref<CategoryId | 'all'>('all')

const selectedItems = computed<OrderItem[]>(() =>
  Object.entries(selectedMap.value)
    .filter(([, qty]) => qty > 0)
    .map(([ingredientId, quantity]) => ({ ingredientId, quantity }))
)

const previewTotal = computed(() =>
  selectedItems.value.reduce((sum, item) => {
    const ing = INGREDIENTS.find((i) => i.id === item.ingredientId)
    return sum + (ing ? ing.price * item.quantity : 0)
  }, 0)
)

const categorySections = computed(() => getIngredientCategorySections(activeCategory.value))

function categorySelectedCount(catId: CategoryId): number {
  return INGREDIENTS.reduce(
    (count, ing) => count + (ing.category === catId && (selectedMap.value[ing.id] ?? 0) > 0 ? 1 : 0),
    0
  )
}

function catExtras(cat: (typeof CATEGORIES)[number]): string {
  return formatCategoryExtras(cat, showThai.value, showEnglish.value)
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

function handleCardClick(id: string) {
  if ((selectedMap.value[id] ?? 0) === 0) {
    adjust(id, 1)
  }
}

function handleConfirm() {
  if (selectedItems.value.length === 0) return
  emit('apply', selectedItems.value, chosenMode.value)
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
    class="fixed inset-0 z-50 grid place-items-center bg-[#22150e]/55 p-3 backdrop-blur-[2px] sm:p-5"
    role="dialog"
    aria-modal="true"
    @click.self="emit('close')"
  >
    <div
      class="flex max-h-[90vh] w-full max-w-[840px] flex-col overflow-hidden rounded-3xl border-2 border-border-warm bg-white shadow-2xl"
    >
      <!-- Pinned Header -->
      <div class="flex shrink-0 items-start justify-between gap-3 border-b border-border-warm bg-white px-5 pt-4.5 pb-3.5">
        <div class="flex min-w-0 items-start gap-3">
          <div
            class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-border-warm bg-gradient-to-br from-rose-50 to-orange-100 text-2xl"
          >
            👩‍🏫
          </div>
          <div class="min-w-0">
            <h2 class="m-0 text-lg font-extrabold leading-tight text-ink">
              <LangLabel
                :entry="UI_TEXT.teacherModalTitle"
                pinyin-class="mt-0.5 text-xs font-semibold text-chili"
                sub-class="mt-0.5 text-xs font-semibold text-ink-muted"
              />
            </h2>
            <p class="mt-1 text-xs leading-snug text-ink-muted sm:text-sm">
              <LangLabel
                :entry="UI_TEXT.teacherModalDesc"
                pinyin-class="mt-0.5 text-xs font-semibold text-chili"
                sub-class="mt-0.5 text-xs font-normal text-ink-muted"
              />
            </p>
          </div>
        </div>

        <button
          type="button"
          class="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-xl bg-cream-soft font-extrabold text-ink transition hover:bg-orange-100"
          aria-label="Close modal"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <!-- Pinned Controls: Mode & Category Filter -->
      <div class="flex shrink-0 flex-col gap-3 border-b border-border-warm bg-[#fffaf5] px-5 py-3">
        <!-- Mode after starting -->
        <div class="flex flex-col gap-1.5">
          <div class="text-xs font-extrabold text-ink">
            <LangLabel
              :entry="UI_TEXT.teacherModalMode"
              pinyin-class="mt-0.5 text-[11px] font-semibold text-chili"
              sub-class="mt-0.5 text-[11px] font-medium text-ink-muted"
            />
          </div>

          <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              v-for="opt in [
                { value: 'listening' as const, icon: '👂', label: UI_TEXT.modeListening },
                { value: 'reading' as const, icon: '👀', label: UI_TEXT.modeReading },
              ]"
              :key="opt.value"
              type="button"
              class="flex cursor-pointer items-center gap-2.5 rounded-xl border-[1.5px] px-3 py-2 text-left transition"
              :class="
                chosenMode === opt.value
                  ? 'border-chili bg-white text-chili shadow-sm'
                  : 'border-border-warm bg-white/70 text-ink-muted hover:bg-white hover:text-ink'
              "
              @click="chosenMode = opt.value"
            >
              <span
                class="grid h-4 w-4 shrink-0 place-items-center rounded-full border-[1.5px]"
                :class="chosenMode === opt.value ? 'border-chili bg-chili' : 'border-ink-muted/40 bg-white'"
              >
                <span v-if="chosenMode === opt.value" class="h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              <span class="text-lg leading-none">{{ opt.icon }}</span>
              <LangLabel
                :entry="opt.label"
                main-class="text-sm font-extrabold"
                pinyin-class="mt-0.5 text-[11px] font-semibold text-chili"
                sub-class="mt-0.5 text-[11px] font-medium opacity-80"
              />
            </button>
          </div>
        </div>

        <!-- Category Filter Pills -->
        <div class="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            class="cursor-pointer rounded-xl border-[1.5px] px-3 py-1 text-left transition"
            :class="
              activeCategory === 'all'
                ? 'border-chili bg-chili text-white'
                : 'border-border-warm bg-white text-ink-muted hover:bg-cream-soft'
            "
            @click="activeCategory = 'all'"
          >
            <LangLabel
              :entry="UI_TEXT.allCategories"
              main-class="text-xs font-bold"
              :pinyin-class="
                activeCategory === 'all'
                  ? 'mt-0.5 text-[10px] font-semibold text-amber-100'
                  : 'mt-0.5 text-[10px] font-semibold text-chili'
              "
              sub-class="mt-0.5 text-[10px] font-medium opacity-85"
            />
          </button>

          <button
            v-for="cat in CATEGORIES"
            :key="cat.id"
            type="button"
            class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border-[1.5px] px-3 py-1 text-left transition"
            :class="
              activeCategory === cat.id
                ? 'border-chili bg-chili text-white'
                : 'border-border-warm bg-white text-ink-muted hover:bg-cream-soft'
            "
            @click="activeCategory = cat.id"
          >
            <div class="leading-tight">
              <div class="text-xs font-bold">
                {{ formatHanziPair(cat.hanzi, cat.hanziTrad, cnScript) }}
              </div>
              <div
                v-if="showPinyin"
                class="mt-0.5 text-[10px] font-semibold"
                :class="activeCategory === cat.id ? 'text-amber-100' : 'text-chili'"
              >
                {{ cat.pinyin }}
              </div>
              <div v-if="catExtras(cat)" class="mt-0.5 text-[10px] font-medium opacity-85">
                {{ catExtras(cat) }}
              </div>
            </div>
            <span
              v-if="categorySelectedCount(cat.id) > 0"
              class="rounded-full px-1.5 py-0.5 text-[10px] leading-none font-black"
              :class="
                activeCategory === cat.id
                  ? 'bg-white/25 text-white'
                  : 'bg-rose-100 text-chili'
              "
            >
              {{ numHanzi(categorySelectedCount(cat.id)) }}
            </span>
          </button>
        </div>
      </div>

      <!-- Scrollable Ingredient Sections -->
      <div class="flex-1 space-y-3.5 overflow-y-auto px-5 py-4">
        <section
          v-for="section in categorySections"
          :key="section.id"
          class="space-y-2 rounded-2xl border p-3"
          :class="section.category?.sectionClass"
        >
          <CategorySectionHeader v-if="section.category" :category="section.category" />

          <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div
              v-for="ing in section.items"
              :key="ing.id"
              class="flex items-center justify-between gap-3 rounded-2xl border-[1.5px] px-3 py-2.5 transition"
              :class="[
                (selectedMap[ing.id] ?? 0) > 0
                  ? 'border-chili bg-[#fff8f7] shadow-[0_2px_10px_rgba(230,57,70,0.08)]'
                  : 'cursor-pointer border-border-warm bg-white hover:border-broth hover:bg-[#fffdfb]',
              ]"
              @click="handleCardClick(ing.id)"
            >
              <div class="flex min-w-0 flex-1 items-center gap-3">
                <div
                  class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl"
                  :style="{ backgroundColor: ing.accent }"
                >
                  {{ ing.emoji }}
                </div>

                <div class="min-w-0 flex-1 leading-snug">
                  <div class="flex flex-wrap items-baseline gap-x-1.5">
                    <span class="text-[15px] font-extrabold text-ink">{{ ingName(ing) }}</span>
                    <span v-if="showPinyin" class="text-xs font-semibold text-chili">
                      {{ ingPinyin(ing) }}
                    </span>
                  </div>
                  <div v-if="showThai" class="mt-0.5 text-xs text-ink-muted">
                    {{ ing.thai }}
                  </div>
                  <div v-if="showEnglish" class="text-xs font-medium text-slate-600">
                    {{ ing.english }}
                  </div>
                </div>
              </div>

              <div class="flex shrink-0 flex-col items-end gap-1.5" @click.stop>
                <span class="rounded-xl bg-amber-100 px-2 py-0.5 text-right leading-tight text-amber-800">
                  <span class="block text-[11px] font-extrabold">{{ priceHanzi(ing.price) }}</span>
                  <span v-if="showPinyin" class="block text-[9px] font-semibold text-chili">
                    {{ pricePinyin(ing.price) }}
                  </span>
                </span>
                <QtyStepper
                  :quantity="selectedMap[ing.id] ?? 0"
                  :min="0"
                  :max="9"
                  @decrement="adjust(ing.id, -1)"
                  @increment="adjust(ing.id, 1)"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Pinned Footer -->
      <div
        class="flex shrink-0 flex-col gap-3 border-t border-border-warm bg-white px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="min-w-0 leading-snug">
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
        </div>

        <div class="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            class="cursor-pointer rounded-xl border border-border-warm bg-cream-soft px-3.5 py-2 text-left leading-tight text-ink-muted transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-45"
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
