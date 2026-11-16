import { inject, provide, type InjectionKey } from 'vue'
import { usePersistedRef } from '@/composables/usePersistedRef'
import { formatHanziPair, getIngredientPinyin } from '@/data/ingredients'
import type { MultiLangText } from '@/data/uiText'
import type { ChineseScript, Ingredient, NumberStyle } from '@/types/game'
import {
  formatChineseNumber,
  formatPriceInChinese,
  formatQuantityHanzi,
  formatQuantityReading,
  numberToChinese,
} from '@/utils/chineseNumbers'

const STORAGE_PREFIX = 'mala-demo:v1'

const isChineseScript = (v: unknown): v is ChineseScript =>
  v === 'simplified' || v === 'traditional'

const isNumberStyle = (v: unknown): v is NumberStyle => v === 'normal' || v === 'formal'

const isBoolean = (v: unknown): v is boolean => typeof v === 'boolean'

export function useI18n() {
  const cnScript = usePersistedRef<ChineseScript>(
    `${STORAGE_PREFIX}:cnScript`,
    'simplified',
    isChineseScript
  )
  const numberStyle = usePersistedRef<NumberStyle>(
    `${STORAGE_PREFIX}:numberStyle`,
    'normal',
    isNumberStyle
  )
  const showPinyin = usePersistedRef<boolean>(`${STORAGE_PREFIX}:showPinyin`, false, isBoolean)
  const showThai = usePersistedRef<boolean>(`${STORAGE_PREFIX}:showThai`, false, isBoolean)
  const showEnglish = usePersistedRef<boolean>(`${STORAGE_PREFIX}:showEnglish`, false, isBoolean)

  function applyVars(text: string, vars?: Record<string, string | number>): string {
    if (!vars) return text
    let result = text
    for (const [k, v] of Object.entries(vars)) {
      result = result.replaceAll(`{${k}}`, String(v))
    }
    return result
  }

  function cn(entry: MultiLangText, vars?: Record<string, string | number>): string {
    return applyVars(formatHanziPair(entry.zh, entry.zhTrad, cnScript.value), vars)
  }

  function cnPinyin(entry: MultiLangText, vars?: Record<string, string | number>): string {
    const raw =
      cnScript.value === 'traditional' ? entry.pinyinTrad ?? entry.pinyin : entry.pinyin
    if (!raw) return ''
    return applyVars(raw, vars)
  }

  function inline(entry: MultiLangText, vars?: Record<string, string | number>): string {
    const parts = [cn(entry)]
    if (showThai.value) parts.push(entry.th)
    if (showEnglish.value) parts.push(entry.en)
    return applyVars(parts.join(' · '), vars)
  }

  function extraLines(entry: MultiLangText, vars?: Record<string, string | number>): string[] {
    const lines: string[] = []
    if (showThai.value) lines.push(applyVars(entry.th, vars))
    if (showEnglish.value) lines.push(applyVars(entry.en, vars))
    return lines
  }

  function ingName(ing: Ingredient | undefined): string {
    if (!ing) return ''
    return formatHanziPair(ing.hanzi, ing.hanziTrad, cnScript.value)
  }

  function ingPinyin(ing: Ingredient | undefined): string {
    return getIngredientPinyin(ing, cnScript.value)
  }

  function priceHanzi(amount: number): string {
    const reading = formatPriceInChinese(amount, numberStyle.value)
    return formatHanziPair(reading.hanzi, reading.hanziTrad, cnScript.value)
  }

  function pricePinyin(amount: number): string {
    return formatPriceInChinese(amount, numberStyle.value).pinyin
  }

  function numHanzi(n: number): string {
    return formatChineseNumber(n, cnScript.value, numberStyle.value)
  }

  function numPinyin(n: number): string {
    return numberToChinese(Math.max(0, Math.floor(n)), numberStyle.value).pinyin
  }

  function qtyHanzi(qty: number): string {
    return formatQuantityHanzi(qty, cnScript.value, numberStyle.value)
  }

  function qtyPinyin(qty: number): string {
    return formatQuantityReading(qty, numberStyle.value).pinyin
  }

  return {
    cnScript,
    numberStyle,
    showPinyin,
    showThai,
    showEnglish,
    cn,
    cnPinyin,
    inline,
    extraLines,
    ingName,
    ingPinyin,
    priceHanzi,
    pricePinyin,
    numHanzi,
    numPinyin,
    qtyHanzi,
    qtyPinyin,
  }
}

export type I18nApi = ReturnType<typeof useI18n>

const I18N_KEY: InjectionKey<I18nApi> = Symbol('mala-i18n')

export function provideI18n(api: I18nApi): void {
  provide(I18N_KEY, api)
}

export function useI18nContext(): I18nApi {
  const ctx = inject(I18N_KEY)
  if (!ctx) {
    throw new Error('useI18nContext() must be used inside a component where provideI18n() was called')
  }
  return ctx
}
