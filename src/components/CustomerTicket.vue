<script setup lang="ts">
import { computed } from 'vue'
import LangLabel from '@/components/ui/LangLabel.vue'
import { useI18nContext } from '@/composables/useI18n'
import { usePersistedRef } from '@/composables/usePersistedRef'
import { INGREDIENT_MAP, formatHanziPair, getIngredientUnit } from '@/data/ingredients'
import { UI_TEXT } from '@/data/uiText'
import { formatQuantityReading } from '@/utils/chineseNumbers'
import type {
  CustomerPersona,
  GamePhase,
  OrderItem,
  OrderMode,
  VocabDisplayMode,
} from '@/types/game'
import { isSpeechSupported } from '@/utils/speech'

interface TicketLangConfig {
  cn: boolean
  pinyin: boolean
  th: boolean
  en: boolean
}

const isTicketLangConfig = (v: unknown): v is TicketLangConfig =>
  typeof v === 'object' &&
  v !== null &&
  typeof (v as TicketLangConfig).cn === 'boolean' &&
  typeof (v as TicketLangConfig).pinyin === 'boolean' &&
  typeof (v as TicketLangConfig).th === 'boolean' &&
  typeof (v as TicketLangConfig).en === 'boolean'

const props = defineProps<{
  customer: CustomerPersona
  order: OrderItem[]
  orderMode: OrderMode
  phase: GamePhase
}>()

const peekTicket = defineModel<boolean>('peekTicket', { required: true })
const vocabDisplayMode = defineModel<VocabDisplayMode>('vocabDisplayMode', { required: true })

const emit = defineEmits<{
  speakOrder: [lang: 'zh' | 'th' | 'en']
  speakPhrase: [phrase: string]
}>()

const {
  cnScript,
  numberStyle,
  showPinyin,
  showThai,
  showEnglish,
  cn,
  cnPinyin,
  ingName,
  ingPinyin,
  qtyHanzi,
} = useI18nContext()
const speechOk = isSpeechSupported()

const ticketLangs = usePersistedRef<TicketLangConfig>(
  'mala-demo:v1:ticketCustomLang',
  { cn: true, pinyin: false, th: false, en: false },
  isTicketLangConfig
)

const isOrderVisible = computed(() => {
  if (props.phase === 'result') return true
  if (props.orderMode === 'reading') return true
  return peekTicket.value
})

const showOrderPictures = computed(
  () => vocabDisplayMode.value === 'pic_to_text' || vocabDisplayMode.value === 'all'
)
const showOrderWords = computed(() => vocabDisplayMode.value !== 'pic_to_text')

const swapButtonEntry = computed(() => {
  if (vocabDisplayMode.value === 'text_to_pic') return UI_TEXT.vocabTextToPic
  if (vocabDisplayMode.value === 'pic_to_text') return UI_TEXT.vocabPicToText
  if (vocabDisplayMode.value === 'text_only') return UI_TEXT.vocabTextBoth
  return UI_TEXT.swapPicText
})

function toggleTicketLang(key: keyof TicketLangConfig) {
  const next = { ...ticketLangs.value, [key]: !ticketLangs.value[key] }
  // Keep at least one language active so the order never becomes blank
  if (!next.cn && !next.pinyin && !next.th && !next.en) return
  ticketLangs.value = next
}

function quantityWithUnit(ingredientId: string, qty: number): string {
  const ing = INGREDIENT_MAP[ingredientId]
  const unit = getIngredientUnit(ing, cnScript.value)
  return `${qtyHanzi(qty)}${unit}`
}

function quantityPinyinWithUnit(ingredientId: string, qty: number): string {
  const ing = INGREDIENT_MAP[ingredientId]
  const numPinyin = formatQuantityReading(qty, numberStyle.value).pinyin
  return ing ? `${numPinyin} ${ing.unitPinyin}` : numPinyin
}

function swapPicAndText() {
  if (vocabDisplayMode.value === 'all') {
    vocabDisplayMode.value = 'text_to_pic'
  } else if (vocabDisplayMode.value === 'text_to_pic') {
    vocabDisplayMode.value = 'pic_to_text'
  } else if (vocabDisplayMode.value === 'pic_to_text') {
    vocabDisplayMode.value = 'text_only'
  } else {
    vocabDisplayMode.value = 'text_to_pic'
  }
}

function toggleShowAll() {
  vocabDisplayMode.value = vocabDisplayMode.value === 'all' ? 'text_to_pic' : 'all'
}
</script>

<template>
  <section
    class="rounded-2xl border-2 border-border-warm bg-white px-5 py-4 shadow-[0_8px_24px_rgba(105,52,22,0.08)]"
  >
    <div class="flex flex-wrap items-start gap-3.5">
      <div
        class="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-200 to-rose-300 text-3xl"
      >
        {{ customer.avatar }}
      </div>

      <div class="min-w-[220px] flex-1">
        <div class="mb-1.5 flex flex-wrap items-center gap-2">
          <div class="flex flex-col leading-tight">
            <span class="text-sm font-extrabold text-ink">
              {{ formatHanziPair(customer.hanziTitle, customer.hanziTitleTrad, cnScript) }}
            </span>
            <span v-if="showPinyin" class="text-[10px] font-semibold text-chili">
              {{ customer.hanziTitlePinyin }}
            </span>
          </div>
          <span class="rounded-lg bg-cream-soft px-2 py-0.5 text-xs font-bold text-ink-muted">
            <LangLabel
              :entry="UI_TEXT.customerRole"
              sub-class="mt-0.5 text-[10px] font-medium opacity-80"
            />
          </span>
          <span
            class="rounded-xl px-2.5 py-1 text-xs font-bold"
            :class="
              orderMode === 'listening'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-sky-100 text-sky-700'
            "
          >
            <LangLabel
              :entry="orderMode === 'listening' ? UI_TEXT.modeListening : UI_TEXT.modeReading"
              :prefix="orderMode === 'listening' ? '👂 ' : '👀 '"
              sub-class="text-[10px] font-medium opacity-85"
            />
          </span>
        </div>

        <!-- Customer Greeting (follows global TopBar language settings) -->
        <p class="m-0 text-xl font-extrabold text-ink">
          {{ formatHanziPair(customer.greeting, customer.greetingTrad, cnScript) }}
        </p>
        <p v-if="showPinyin" class="mt-0.5 text-sm font-semibold text-chili">
          {{ customer.greetingPinyin }}
        </p>
        <p v-if="showThai" class="mt-0.5 text-xs text-ink-muted">{{ customer.greetingThai }}</p>
        <p v-if="showEnglish" class="mt-0.5 text-xs text-ink-muted">
          {{ customer.greetingEnglish }}
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          v-if="speechOk"
          type="button"
          class="cursor-pointer rounded-xl border-[1.5px] border-border-warm bg-cream-soft px-3.5 py-2 text-left text-ink transition hover:bg-orange-100"
          @click="emit('speakOrder', 'zh')"
        >
          <LangLabel
            :entry="UI_TEXT.speakOrderBtn"
            prefix="🔊 "
            suffix=" (中文)"
            main-class="text-sm font-bold"
            sub-class="mt-0.5 text-[10px] font-medium opacity-80"
          />
        </button>
        <button
          v-if="speechOk"
          type="button"
          class="cursor-pointer rounded-xl border-[1.5px] border-border-warm bg-cream-soft px-3.5 py-2 text-sm font-bold text-ink transition hover:bg-orange-100"
          @click="emit('speakOrder', 'th')"
        >
          🔊 ไทย
        </button>
        <button
          v-if="speechOk"
          type="button"
          class="cursor-pointer rounded-xl border-[1.5px] border-border-warm bg-cream-soft px-3.5 py-2 text-sm font-bold text-ink transition hover:bg-orange-100"
          @click="emit('speakOrder', 'en')"
        >
          🔊 EN
        </button>
        <button
          v-if="orderMode === 'listening' && phase !== 'result'"
          type="button"
          class="cursor-pointer rounded-xl border-[1.5px] border-border-warm bg-cream-soft px-3.5 py-2 text-left text-ink transition hover:bg-orange-100"
          @click="peekTicket = !peekTicket"
        >
          <LangLabel
            :entry="peekTicket ? UI_TEXT.peekHide : UI_TEXT.peekShow"
            :prefix="peekTicket ? '🙈 ' : '👁️ '"
            main-class="text-sm font-bold"
            sub-class="mt-0.5 text-[10px] font-medium opacity-80"
          />
        </button>
      </div>
    </div>

    <!-- Separate Ticket Language Toggles & Pic/Text Swap -->
    <div
      class="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-cream-soft pt-3"
    >
      <div class="flex flex-wrap items-center gap-1.5">
        <span class="text-xs font-bold text-ink-muted">
          <LangLabel
            :entry="UI_TEXT.ticketLangLabel"
            suffix=":"
            sub-class="text-[10px] font-medium opacity-80"
          />
        </span>

        <button
          v-for="pill in [
            { key: 'cn' as const, label: '中文', active: ticketLangs.cn },
            { key: 'pinyin' as const, label: '+ Pinyin', active: ticketLangs.pinyin },
            { key: 'th' as const, label: '+ ไทย', active: ticketLangs.th },
            { key: 'en' as const, label: '+ English', active: ticketLangs.en },
          ]"
          :key="pill.key"
          type="button"
          class="cursor-pointer rounded-full border-[1.5px] px-2.5 py-1 text-xs font-semibold transition"
          :class="
            pill.active
              ? 'border-herb bg-herb-soft text-teal-800'
              : 'border-border-warm bg-white text-ink-muted hover:bg-cream-soft'
          "
          @click="toggleTicketLang(pill.key)"
        >
          {{ pill.label }}
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          class="cursor-pointer rounded-xl border-[1.5px] px-3 py-1.5 text-left transition"
          :class="
            vocabDisplayMode !== 'all'
              ? 'border-amber-400 bg-amber-100 text-amber-900'
              : 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
          "
          @click="swapPicAndText"
        >
          <LangLabel
            :entry="swapButtonEntry"
            prefix="⇄ "
            main-class="text-xs font-bold"
            sub-class="text-[10px] font-medium opacity-80"
          />
        </button>
        <button
          type="button"
          class="cursor-pointer rounded-xl border-[1.5px] px-3 py-1.5 text-left transition"
          :class="
            vocabDisplayMode === 'all'
              ? 'border-herb bg-herb-soft text-teal-800'
              : 'border-border-warm bg-white text-ink-muted hover:bg-cream-soft'
          "
          @click="toggleShowAll"
        >
          <LangLabel
            :entry="UI_TEXT.vocabShowAll"
            prefix="✨ "
            main-class="text-xs font-semibold"
            sub-class="text-[10px] font-medium opacity-80"
          />
        </button>
      </div>
    </div>

    <!-- Ticket body -->
    <div
      v-if="isOrderVisible"
      class="mt-3 flex flex-wrap gap-2.5 border-t-2 border-dashed border-border-warm pt-3.5"
    >
      <div
        v-for="item in order"
        :key="item.ingredientId"
        class="flex items-center gap-2.5 rounded-2xl border-[1.5px] border-amber-200 bg-[#fffaf3] px-3.5 py-2"
      >
        <span v-if="showOrderPictures" :class="showOrderWords ? 'text-2xl' : 'text-3xl'">
          {{ INGREDIENT_MAP[item.ingredientId]?.emoji }}
        </span>

        <div v-if="showOrderWords && INGREDIENT_MAP[item.ingredientId]" class="leading-snug">
          <div
            v-if="ticketLangs.cn || ticketLangs.pinyin"
            class="flex flex-wrap items-baseline gap-x-1.5"
          >
            <strong v-if="ticketLangs.cn" class="font-extrabold text-ink">
              {{ ingName(INGREDIENT_MAP[item.ingredientId]) }}
            </strong>
            <span
              v-if="ticketLangs.pinyin"
              :class="
                ticketLangs.cn
                  ? 'text-xs font-semibold text-chili'
                  : 'text-sm font-extrabold text-chili'
              "
            >
              {{ ingPinyin(INGREDIENT_MAP[item.ingredientId]) }}
            </span>
          </div>
          <div
            v-if="ticketLangs.th"
            :class="
              ticketLangs.cn || ticketLangs.pinyin
                ? 'text-xs text-ink-muted'
                : 'text-sm font-extrabold text-ink'
            "
          >
            {{ INGREDIENT_MAP[item.ingredientId].thai }}
          </div>
          <div
            v-if="ticketLangs.en"
            :class="
              ticketLangs.cn || ticketLangs.pinyin || ticketLangs.th
                ? 'text-xs text-ink-muted'
                : 'text-sm font-extrabold text-ink'
            "
          >
            {{ INGREDIENT_MAP[item.ingredientId].english }}
          </div>
        </div>

        <button
          type="button"
          class="cursor-pointer rounded-full bg-rose-100 px-2.5 py-0.5 text-sm font-black text-chili transition hover:bg-rose-200"
          title="Speak quantity in Chinese"
          @click="emit('speakPhrase', quantityWithUnit(item.ingredientId, item.quantity))"
        >
          {{ quantityWithUnit(item.ingredientId, item.quantity) }}
          <span v-if="ticketLangs.pinyin" class="ml-1 text-xs font-bold opacity-90">
            · {{ quantityPinyinWithUnit(item.ingredientId, item.quantity) }}
          </span>
        </button>
      </div>
    </div>

    <div
      v-else
      class="mt-3 flex items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-amber-400 bg-amber-50 px-4 py-3.5"
    >
      <div class="text-3xl">🤫</div>
      <div class="text-sm">
        <strong class="block text-ink">{{ cn(UI_TEXT.listeningHiddenTitle) }}</strong>
        <div v-if="showPinyin" class="text-xs font-semibold text-chili">
          {{ cnPinyin(UI_TEXT.listeningHiddenTitle) }}
        </div>
        <div v-if="showThai" class="font-semibold text-amber-800">
          {{ UI_TEXT.listeningHiddenTitle.th }}
        </div>
        <div v-if="showEnglish" class="font-semibold text-amber-800">
          {{ UI_TEXT.listeningHiddenTitle.en }}
        </div>
        <p class="mt-0.5 text-xs text-ink-muted">{{ cn(UI_TEXT.listeningHiddenDesc) }}</p>
        <p v-if="showPinyin" class="mt-0.5 text-[11px] font-semibold text-chili">
          {{ cnPinyin(UI_TEXT.listeningHiddenDesc) }}
        </p>
        <p v-if="showThai" class="mt-0.5 text-xs text-ink-muted">
          {{ UI_TEXT.listeningHiddenDesc.th }}
        </p>
        <p v-if="showEnglish" class="mt-0.5 text-xs text-ink-muted">
          {{ UI_TEXT.listeningHiddenDesc.en }}
        </p>
      </div>
    </div>
  </section>
</template>
