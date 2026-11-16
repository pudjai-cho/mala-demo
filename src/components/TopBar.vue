<script setup lang="ts">
import { computed } from 'vue'
import LangLabel from '@/components/ui/LangLabel.vue'
import { useI18nContext } from '@/composables/useI18n'
import { UI_TEXT } from '@/data/uiText'
import type { CheckoutMode, Difficulty, OrderMode } from '@/types/game'
import { speechState } from '@/utils/speech'

defineProps<{
  stars: number
  answeredCount: number
  roundNumber: number
}>()

const orderMode = defineModel<OrderMode>('orderMode', { required: true })
const checkoutMode = defineModel<CheckoutMode>('checkoutMode', { required: true })
const difficulty = defineModel<Difficulty>('difficulty', { required: true })

const emit = defineEmits<{
  newRandom: []
  openTeacherModal: []
}>()

const {
  cnScript,
  numberStyle,
  showPinyin,
  showThai,
  showEnglish,
  cn,
  cnPinyin,
  extraLines,
  numHanzi,
  numPinyin,
  qtyHanzi,
  qtyPinyin,
} = useI18nContext()

const subtitleLine = computed(() => extraLines(UI_TEXT.appTitle).join(' · ') || '\u00A0')
</script>

<template>
  <header
    class="flex flex-col gap-3 rounded-2xl border-2 border-border-warm bg-white px-5 py-4 shadow-[0_8px_24px_rgba(105,52,22,0.08)]"
  >
    <!-- Line 1: Brand + Round / Score -->
    <div
      class="flex min-h-10 flex-wrap items-center justify-between gap-3 border-b border-cream-soft pb-2.5"
    >
      <div class="flex items-center gap-3">
        <div
          class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-rose-400 to-chili text-2xl shadow-md shadow-chili/25"
        >
          🍲
        </div>
        <div class="flex flex-col">
          <div class="flex flex-wrap items-baseline gap-x-2">
            <h1 class="m-0 text-xl font-extrabold leading-tight text-chili">
              {{ cn(UI_TEXT.appTitle) }}
            </h1>
            <span v-if="showPinyin" class="text-xs font-semibold text-chili/85">
              {{ cnPinyin(UI_TEXT.appTitle) }}
            </span>
          </div>
          <div class="mt-0.5 min-h-[1.3em] text-sm font-semibold leading-snug text-ink-muted">
            {{ subtitleLine }}
          </div>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <span class="rounded-xl bg-cream-soft px-3 py-1.5 text-xs font-bold text-ink-muted">
          <LangLabel
            :entry="UI_TEXT.roundLabel"
            :vars="{ n: numHanzi(roundNumber) }"
            :pinyin-vars="{ n: numPinyin(roundNumber) }"
            sub-class="mt-0.5 text-[10px] font-medium opacity-80"
          />
        </span>
        <span class="rounded-xl bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800">
          <LangLabel
            :entry="UI_TEXT.starsLabel"
            :prefix="`⭐ ${numHanzi(stars)} / ${numHanzi(answeredCount)} `"
            :pinyin-prefix="`⭐ ${numPinyin(stars)} / ${numPinyin(answeredCount)} `"
            sub-class="mt-0.5 text-[10px] font-medium opacity-80"
          />
        </span>
      </div>
    </div>

    <!-- Line 2: Script & Language Toggles -->
    <div
      class="flex min-h-10 flex-wrap items-center gap-x-3.5 gap-y-2 border-b border-cream-soft pb-2.5"
    >
      <div
        class="inline-flex flex-wrap gap-1 rounded-xl border border-border-warm bg-cream-soft p-1"
        role="group"
        aria-label="Chinese script"
      >
        <button
          type="button"
          class="cursor-pointer rounded-lg px-3 py-1.5 text-center leading-tight transition"
          :class="
            cnScript === 'simplified'
              ? 'bg-white text-chili shadow-sm'
              : 'text-ink-muted hover:text-ink'
          "
          @click="cnScript = 'simplified'"
        >
          <div class="text-sm font-semibold">简体</div>
          <div v-if="showPinyin" class="text-[10px] font-semibold text-chili">Jiǎntǐ</div>
        </button>
        <button
          type="button"
          class="cursor-pointer rounded-lg px-3 py-1.5 text-center leading-tight transition"
          :class="
            cnScript === 'traditional'
              ? 'bg-white text-chili shadow-sm'
              : 'text-ink-muted hover:text-ink'
          "
          @click="cnScript = 'traditional'"
        >
          <div class="text-sm font-semibold">繁體</div>
          <div v-if="showPinyin" class="text-[10px] font-semibold text-chili">Fántǐ</div>
        </button>
      </div>

      <div
        class="inline-flex flex-wrap gap-1 rounded-xl border border-border-warm bg-cream-soft p-1"
        role="group"
        aria-label="Chinese number style"
      >
        <button
          v-for="opt in [
            { id: 'normal' as const, text: UI_TEXT.numberNormal },
            { id: 'formal' as const, text: UI_TEXT.numberFormal },
          ]"
          :key="opt.id"
          type="button"
          class="cursor-pointer rounded-lg px-2.5 py-1 text-left leading-tight transition"
          :class="
            numberStyle === opt.id
              ? 'bg-white text-chili shadow-sm'
              : 'text-ink-muted hover:text-ink'
          "
          @click="numberStyle = opt.id"
        >
          <LangLabel
            :entry="opt.text"
            main-class="text-xs font-bold"
            sub-class="mt-0.5 text-[10px] font-medium opacity-80"
          />
        </button>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="cursor-pointer rounded-full border-[1.5px] px-3 py-1.5 text-xs font-semibold transition"
          :class="
            showPinyin
              ? 'border-herb bg-herb-soft text-teal-800'
              : 'border-border-warm bg-white text-ink-muted hover:bg-cream-soft'
          "
          @click="showPinyin = !showPinyin"
        >
          + Pinyin
        </button>
        <button
          type="button"
          class="cursor-pointer rounded-full border-[1.5px] px-3 py-1.5 text-xs font-semibold transition"
          :class="
            showThai
              ? 'border-herb bg-herb-soft text-teal-800'
              : 'border-border-warm bg-white text-ink-muted hover:bg-cream-soft'
          "
          @click="showThai = !showThai"
        >
          + ไทย
        </button>
        <button
          type="button"
          class="cursor-pointer rounded-full border-[1.5px] px-3 py-1.5 text-xs font-semibold transition"
          :class="
            showEnglish
              ? 'border-herb bg-herb-soft text-teal-800'
              : 'border-border-warm bg-white text-ink-muted hover:bg-cream-soft'
          "
          @click="showEnglish = !showEnglish"
        >
          + English
        </button>
      </div>

      <select
        v-if="speechState.zhVoices.length > 0"
        v-model="speechState.selectedZhVoiceURI"
        class="max-w-[230px] rounded-full border-[1.5px] border-border-warm bg-white px-3 py-1.5 text-xs font-semibold text-ink"
        aria-label="Chinese TTS voice"
      >
        <option value="">
          🗣️ Auto ({{ cnScript === 'traditional' ? '繁體 zh-TW' : '简体 zh-CN' }})
        </option>
        <option v-for="v in speechState.zhVoices" :key="v.voiceURI" :value="v.voiceURI">
          🗣️ {{ v.name }} ({{ v.lang }})
        </option>
      </select>
    </div>

    <!-- Line 3: Order Mode & Checkout / Math Mode -->
    <div class="flex min-h-10 flex-wrap items-center justify-between gap-3">
      <div
        class="inline-flex flex-wrap gap-1 rounded-xl border border-border-warm bg-cream-soft p-1"
        role="group"
      >
        <button
          type="button"
          class="cursor-pointer rounded-lg px-3.5 py-1.5 text-left transition"
          :class="
            orderMode === 'reading'
              ? 'bg-white text-chili shadow-sm'
              : 'text-ink-muted hover:text-ink'
          "
          @click="orderMode = 'reading'"
        >
          <LangLabel
            :entry="UI_TEXT.modeReading"
            prefix="👀 "
            main-class="text-sm font-semibold"
            sub-class="mt-0.5 text-[10px] font-medium opacity-80"
          />
        </button>
        <button
          type="button"
          class="cursor-pointer rounded-lg px-3.5 py-1.5 text-left transition"
          :class="
            orderMode === 'listening'
              ? 'bg-white text-chili shadow-sm'
              : 'text-ink-muted hover:text-ink'
          "
          @click="orderMode = 'listening'"
        >
          <LangLabel
            :entry="UI_TEXT.modeListening"
            prefix="👂 "
            main-class="text-sm font-semibold"
            sub-class="mt-0.5 text-[10px] font-medium opacity-80"
          />
        </button>
      </div>

      <div
        class="inline-flex flex-wrap gap-1 rounded-xl border border-border-warm bg-cream-soft p-1"
        role="group"
        aria-label="Checkout mode"
      >
        <button
          v-for="opt in [
            { id: 'auto' as const, icon: '🔊', text: UI_TEXT.checkoutModeAuto },
            { id: 'read_number' as const, icon: '🔢', text: UI_TEXT.checkoutModeReadNumber },
            { id: 'calc_subtotals' as const, icon: '➕', text: UI_TEXT.checkoutModeCalcSubtotals },
            { id: 'calc_manual' as const, icon: '✖️', text: UI_TEXT.checkoutModeCalcManual },
          ]"
          :key="opt.id"
          type="button"
          class="cursor-pointer rounded-lg px-2.5 py-1.5 text-left leading-tight transition"
          :class="
            checkoutMode === opt.id
              ? 'bg-white text-chili shadow-sm'
              : 'text-ink-muted hover:text-ink'
          "
          @click="checkoutMode = opt.id"
        >
          <LangLabel
            :entry="opt.text"
            :prefix="`${opt.icon} `"
            main-class="text-xs font-bold"
            sub-class="mt-0.5 text-[10px] font-medium opacity-80"
          />
        </button>
      </div>
    </div>

    <!-- Line 4: Difficulty & Teacher Actions -->
    <div class="flex min-h-10 flex-wrap items-center justify-between gap-2.5">
      <div
        class="inline-flex flex-wrap gap-1 rounded-xl border border-border-warm bg-cream-soft p-1"
        role="group"
        aria-label="Difficulty"
      >
        <button
          v-for="opt in [
            {
              id: 'easy' as const,
              entry: UI_TEXT.diffEasy,
              vars: { min: qtyHanzi(2), max: numHanzi(3) },
              pinyinVars: { min: qtyPinyin(2), max: numPinyin(3) },
            },
            {
              id: 'medium' as const,
              entry: UI_TEXT.diffMedium,
              vars: { min: numHanzi(3), max: numHanzi(4) },
              pinyinVars: { min: numPinyin(3), max: numPinyin(4) },
            },
            {
              id: 'hard' as const,
              entry: UI_TEXT.diffHard,
              vars: { min: numHanzi(4), max: numHanzi(5) },
              pinyinVars: { min: numPinyin(4), max: numPinyin(5) },
            },
          ]"
          :key="opt.id"
          type="button"
          class="cursor-pointer rounded-lg px-2.5 py-1.5 text-left leading-tight transition"
          :class="
            difficulty === opt.id
              ? 'bg-white text-chili shadow-sm'
              : 'text-ink-muted hover:text-ink'
          "
          @click="difficulty = opt.id"
        >
          <LangLabel
            :entry="opt.entry"
            :vars="opt.vars"
            :pinyin-vars="opt.pinyinVars"
            main-class="text-xs font-bold"
            sub-class="mt-0.5 text-[10px] font-medium opacity-80"
          />
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border-[1.5px] border-amber-300 bg-amber-50 px-3.5 py-2 text-left text-amber-800 transition hover:bg-amber-200 active:scale-[0.98]"
          @click="emit('newRandom')"
        >
          <LangLabel
            :entry="UI_TEXT.randomOrder"
            prefix="🎲 "
            main-class="text-sm font-bold"
            sub-class="mt-0.5 text-[10px] font-medium opacity-80"
          />
        </button>
        <button
          type="button"
          class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border-[1.5px] border-violet-300 bg-violet-100 px-3.5 py-2 text-left text-violet-800 transition hover:bg-violet-200 active:scale-[0.98]"
          @click="emit('openTeacherModal')"
        >
          <LangLabel
            :entry="UI_TEXT.teacherCustom"
            prefix="👩‍🏫 "
            main-class="text-sm font-bold"
            sub-class="mt-0.5 text-[10px] font-medium opacity-80"
          />
        </button>
      </div>
    </div>
  </header>
</template>
