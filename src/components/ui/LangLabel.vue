<script setup lang="ts">
import { computed } from 'vue'
import { useI18nContext } from '@/composables/useI18n'
import type { MultiLangText } from '@/data/uiText'

const props = defineProps<{
  entry: MultiLangText
  vars?: Record<string, string | number>
  pinyinVars?: Record<string, string | number>
  prefix?: string
  suffix?: string
  pinyinPrefix?: string
  mainClass?: string
  pinyinClass?: string
  subClass?: string
  inlineSub?: boolean
}>()

const { showPinyin, cn, cnPinyin, extraLines } = useI18nContext()

const mainText = computed(() => `${props.prefix ?? ''}${cn(props.entry, props.vars)}${props.suffix ?? ''}`)
const pinyinText = computed(() => {
  if (!showPinyin.value) return ''
  const raw = cnPinyin(props.entry, props.pinyinVars ?? props.vars)
  if (!raw) return ''
  return `${props.pinyinPrefix ?? ''}${raw}`
})
const subLines = computed(() => extraLines(props.entry, props.vars))
</script>

<template>
  <span class="inline-flex flex-col leading-tight">
    <span :class="mainClass">{{ mainText }}</span>
    <span
      v-if="pinyinText"
      :class="pinyinClass ?? 'mt-0.5 text-[10px] font-semibold text-chili'"
    >
      {{ pinyinText }}
    </span>
    <template v-if="subLines.length > 0">
      <span
        v-if="inlineSub"
        :class="subClass ?? 'mt-0.5 text-[11px] font-medium opacity-75'"
      >
        {{ subLines.join(' · ') }}
      </span>
      <span
        v-for="(line, idx) in subLines"
        v-else
        :key="idx"
        :class="subClass ?? 'mt-0.5 text-[11px] font-medium opacity-75'"
      >
        {{ line }}
      </span>
    </template>
  </span>
</template>
