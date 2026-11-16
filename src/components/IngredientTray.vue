<script setup lang="ts">
import { computed } from 'vue'
import CategorySectionHeader from '@/components/ui/CategorySectionHeader.vue'
import LangLabel from '@/components/ui/LangLabel.vue'
import { useI18nContext } from '@/composables/useI18n'
import { usePersistedRef } from '@/composables/usePersistedRef'
import {
  INGREDIENTS,
  getCategorySectionGridClass,
  getCategorySectionWrapperClass,
  getIngredientCategorySections,
  type IngredientCategorySection,
} from '@/data/ingredients'
import { UI_TEXT } from '@/data/uiText'
import type { Ingredient, VocabDisplayMode } from '@/types/game'

const isBoolean = (v: unknown): v is boolean => typeof v === 'boolean'

const props = defineProps<{
  disabled: boolean
  getBowlQty: (id: string) => number
  vocabDisplayMode: VocabDisplayMode
}>()

const menuTapSpeak = defineModel<boolean>('menuTapSpeak', { required: true })

const emit = defineEmits<{
  add: [ingredientId: string]
  decrement: [ingredientId: string]
  speak: [ingredient: Ingredient, lang: 'zh' | 'th' | 'en']
  speakPhrase: [phrase: string]
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
} = useI18nContext()

const groupByCategory = usePersistedRef<boolean>(
  'mala-demo:v1:trayGroupByCategory',
  false,
  isBoolean
)

const showTrayPictures = computed(
  () => props.vocabDisplayMode === 'text_to_pic' || props.vocabDisplayMode === 'all'
)
const showTrayWords = computed(() => props.vocabDisplayMode !== 'text_to_pic')

const traySections = computed<IngredientCategorySection[]>(() => {
  if (!groupByCategory.value) {
    return [{ id: 'flat', category: null, items: INGREDIENTS }]
  }
  return getIngredientCategorySections('all')
})

function sectionWrapperClass(itemCount: number): string {
  if (!groupByCategory.value) return 'col-span-full'
  return getCategorySectionWrapperClass(itemCount)
}

function sectionGridClass(itemCount: number): string {
  if (!groupByCategory.value) return 'grid-cols-2 sm:grid-cols-4 md:grid-cols-6'
  return getCategorySectionGridClass(itemCount)
}

function handleSpeakOnly(event: Event, ing: Ingredient, lang: 'zh' | 'th' | 'en') {
  event.stopPropagation()
  emit('speak', ing, lang)
}

function handleSpeakPrice(event: Event, price: number) {
  event.stopPropagation()
  emit('speakPhrase', priceHanzi(price))
}

function handleCardActivate(id: string) {
  if (props.disabled) return
  emit('add', id)
}

function handleDecrement(event: Event, id: string) {
  event.stopPropagation()
  if (props.disabled) return
  emit('decrement', id)
}
</script>

<template>
  <section
    class="rounded-2xl border-2 border-border-warm bg-surface p-4.5 shadow-[0_8px_24px_rgba(105,52,22,0.08)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
  >
    <div class="mb-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-cream-soft pb-3">
      <h2 class="m-0 text-lg font-extrabold">
        <LangLabel
          :entry="UI_TEXT.trayTitle"
          prefix="🖥️ "
          sub-class="mt-0.5 text-xs font-medium text-ink-muted"
        />
      </h2>

      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="cursor-pointer rounded-xl border-[1.5px] px-3 py-1.5 text-left transition"
          :class="
            menuTapSpeak
              ? 'border-herb bg-herb-soft text-teal-800 dark:text-teal-200'
              : 'border-border-warm bg-surface text-ink-muted hover:bg-cream-soft'
          "
          @click="menuTapSpeak = !menuTapSpeak"
        >
          <LangLabel
            :entry="menuTapSpeak ? UI_TEXT.soundOn : UI_TEXT.soundOff"
            :prefix="menuTapSpeak ? '🔊 ' : '🔇 '"
            main-class="text-xs font-semibold"
            sub-class="mt-0.5 text-[10px] font-medium opacity-80"
          />
        </button>
        <button
          type="button"
          class="cursor-pointer rounded-xl border-[1.5px] px-3 py-1.5 text-left transition"
          :class="
            groupByCategory
              ? 'border-chili bg-surface-active text-chili'
              : 'border-border-warm bg-surface text-ink-muted hover:bg-cream-soft'
          "
          @click="groupByCategory = !groupByCategory"
        >
          <LangLabel
            :entry="UI_TEXT.groupByType"
            prefix="🗂️ "
            main-class="text-xs font-semibold"
            sub-class="mt-0.5 text-[10px] font-medium opacity-80"
          />
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-6">
      <div
        v-for="section in traySections"
        :key="section.id"
        class="space-y-2"
        :class="[
          sectionWrapperClass(section.items.length),
          section.category ? ['rounded-2xl border p-2.5', section.category.sectionClass] : '',
        ]"
      >
        <CategorySectionHeader v-if="section.category" :category="section.category" />

        <div class="grid gap-2" :class="sectionGridClass(section.items.length)">
          <div
            v-for="item in section.items"
            :key="item.id"
            role="button"
            tabindex="0"
            class="relative flex cursor-pointer flex-col items-center justify-center gap-0.5 rounded-2xl border-2 px-1.5 text-center transition select-none hover:-translate-y-0.5 hover:border-broth hover:shadow-md active:scale-[0.96]"
            :class="[
              getBowlQty(item.id) > 0
                ? 'border-chili bg-surface-active'
                : 'border-border-warm bg-surface',
              showTrayPictures && showTrayWords ? 'pt-2.5 pb-2' : 'min-h-[96px] py-3',
              disabled ? 'pointer-events-none opacity-50' : '',
            ]"
            :aria-disabled="disabled"
            @click="handleCardActivate(item.id)"
            @keydown.enter.self="handleCardActivate(item.id)"
            @keydown.space.self.prevent="handleCardActivate(item.id)"
          >
            <div
              v-if="getBowlQty(item.id) > 0"
              class="absolute -top-2 -right-2 flex items-center overflow-hidden rounded-full bg-chili text-white shadow-md shadow-chili/35"
            >
              <button
                type="button"
                class="grid h-6.5 w-6.5 cursor-pointer place-items-center bg-black/15 text-sm font-black transition hover:bg-black/30 active:scale-90"
                aria-label="Decrease quantity"
                title="Remove 1"
                @click="handleDecrement($event, item.id)"
              >
                −
              </button>
              <span class="grid h-6.5 min-w-6 place-items-center px-1.5 text-xs font-extrabold">
                {{ numHanzi(getBowlQty(item.id)) }}
              </span>
            </div>

            <button
              type="button"
              class="absolute top-1 left-1.5 cursor-pointer rounded-md px-1 py-0.5 text-xs opacity-65 transition hover:bg-cream-soft hover:opacity-100"
              title="Speak Chinese"
              @click="handleSpeakOnly($event, item, 'zh')"
            >
              🔊
            </button>

            <div
              v-if="showTrayPictures"
              class="mb-1 grid place-items-center rounded-xl transition-all"
              :class="showTrayWords ? 'h-11 w-11 text-2xl' : 'h-14 w-14 text-3xl'"
              :style="{ backgroundColor: item.accent }"
            >
              {{ item.emoji }}
            </div>
            <template v-if="showTrayWords">
              <div class="text-base font-extrabold leading-tight text-ink">{{ ingName(item) }}</div>
              <div v-if="showPinyin" class="text-[11px] font-semibold leading-tight text-chili">
                {{ ingPinyin(item) }}
              </div>
              <div v-if="showThai" class="text-[11px] leading-tight text-ink-muted">
                {{ item.thai }}
              </div>
              <div v-if="showEnglish" class="text-[11px] font-semibold leading-tight text-gray-600 dark:text-ink-muted">
                {{ item.english }}
              </div>
            </template>
            <button
              type="button"
              class="mt-1 cursor-pointer rounded-xl bg-amber-100 px-2.5 py-0.5 leading-tight text-amber-800 transition hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-200 dark:hover:bg-amber-800/60"
              title="Speak price in Chinese"
              @click="handleSpeakPrice($event, item.price)"
            >
              <div class="text-[11px] font-extrabold">{{ priceHanzi(item.price) }}</div>
              <div v-if="showPinyin" class="text-[9px] font-semibold text-chili">
                {{ pricePinyin(item.price) }}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
