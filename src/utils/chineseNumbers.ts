import type { ChineseScript, NumberStyle } from '@/types/game'

const DIGITS_NORMAL = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
const DIGITS_FORMAL_SIMP = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
const DIGITS_FORMAL_TRAD = ['零', '壹', '貳', '參', '肆', '伍', '陸', '柒', '捌', '玖']
const DIGITS_PINYIN = ['líng', 'yī', 'èr', 'sān', 'sì', 'wǔ', 'liù', 'qī', 'bā', 'jiǔ']

export interface ChinesePriceReading {
  hanzi: string
  hanziTrad: string
  pinyin: string
}

function getDigitChars(style: NumberStyle) {
  if (style === 'formal') {
    return {
      simp: DIGITS_FORMAL_SIMP,
      trad: DIGITS_FORMAL_TRAD,
      ten: '拾',
      hundred: '佰',
    }
  }
  return {
    simp: DIGITS_NORMAL,
    trad: DIGITS_NORMAL,
    ten: '十',
    hundred: '百',
  }
}

/**
 * Converts a non-negative integer (0-999) into natural Mandarin price reading with 元.
 */
export function formatPriceInChinese(
  amount: number,
  style: NumberStyle = 'normal'
): ChinesePriceReading {
  const n = Math.max(0, Math.floor(amount))
  if (n === 0) {
    return { hanzi: '零元', hanziTrad: '零元', pinyin: 'líng yuán' }
  }
  if (n === 2 && style === 'normal') {
    return { hanzi: '两元', hanziTrad: '兩元', pinyin: 'liǎng yuán' }
  }

  const { hanzi, hanziTrad, pinyin } = numberToChinese(n, style)
  return {
    hanzi: `${hanzi}元`,
    hanziTrad: `${hanziTrad}元`,
    pinyin: `${pinyin} yuán`,
  }
}

export function numberToChinese(
  n: number,
  style: NumberStyle = 'normal'
): ChinesePriceReading {
  const chars = getDigitChars(style)

  if (n < 10) {
    return {
      hanzi: chars.simp[n],
      hanziTrad: chars.trad[n],
      pinyin: DIGITS_PINYIN[n],
    }
  }

  if (n < 100) {
    const tens = Math.floor(n / 10)
    const ones = n % 10
    const tensSimp = tens === 1 ? chars.ten : `${chars.simp[tens]}${chars.ten}`
    const tensTrad = tens === 1 ? chars.ten : `${chars.trad[tens]}${chars.ten}`
    const tensPinyin = tens === 1 ? 'shí' : `${DIGITS_PINYIN[tens]} shí`
    if (ones === 0) {
      return { hanzi: tensSimp, hanziTrad: tensTrad, pinyin: tensPinyin }
    }
    return {
      hanzi: `${tensSimp}${chars.simp[ones]}`,
      hanziTrad: `${tensTrad}${chars.trad[ones]}`,
      pinyin: `${tensPinyin} ${DIGITS_PINYIN[ones]}`,
    }
  }

  if (n < 1000) {
    const hundreds = Math.floor(n / 100)
    const rem = n % 100
    const useLiang = hundreds === 2 && style === 'normal'
    const hHanzi = useLiang ? '两百' : `${chars.simp[hundreds]}${chars.hundred}`
    const hTrad = useLiang ? '兩百' : `${chars.trad[hundreds]}${chars.hundred}`
    const hPinyin = useLiang ? 'liǎng bǎi' : `${DIGITS_PINYIN[hundreds]} bǎi`

    if (rem === 0) {
      return { hanzi: hHanzi, hanziTrad: hTrad, pinyin: hPinyin }
    }
    if (rem < 10) {
      return {
        hanzi: `${hHanzi}零${chars.simp[rem]}`,
        hanziTrad: `${hTrad}零${chars.trad[rem]}`,
        pinyin: `${hPinyin} líng ${DIGITS_PINYIN[rem]}`,
      }
    }
    const tens = Math.floor(rem / 10)
    const ones = rem % 10
    const remSimp = `${chars.simp[tens]}${chars.ten}${ones > 0 ? chars.simp[ones] : ''}`
    const remTrad = `${chars.trad[tens]}${chars.ten}${ones > 0 ? chars.trad[ones] : ''}`
    const remPinyin = `${DIGITS_PINYIN[tens]} shí${ones > 0 ? ` ${DIGITS_PINYIN[ones]}` : ''}`
    return {
      hanzi: `${hHanzi}${remSimp}`,
      hanziTrad: `${hTrad}${remTrad}`,
      pinyin: `${hPinyin} ${remPinyin}`,
    }
  }

  const str = String(n)
  return { hanzi: str, hanziTrad: str, pinyin: str }
}

/**
 * Formats a standalone non-negative integer (0-999) in Mandarin characters (e.g. 2 -> 二 or 貳).
 */
export function formatChineseNumber(
  n: number,
  script: ChineseScript = 'simplified',
  style: NumberStyle = 'normal'
): string {
  const reading = numberToChinese(Math.max(0, Math.floor(n)), style)
  return script === 'traditional' ? reading.hanziTrad : reading.hanzi
}

/**
 * Formats an order item count / amount before a measure word or 元 (e.g. 2 -> 两 / 兩 or 贰 / 貳).
 */
export function formatQuantityHanzi(
  qty: number,
  script: ChineseScript = 'simplified',
  style: NumberStyle = 'normal'
): string {
  if (qty === 2 && style === 'normal') {
    return script === 'traditional' ? '兩' : '两'
  }
  const reading = numberToChinese(Math.max(0, Math.floor(qty)), style)
  return script === 'traditional' ? reading.hanziTrad : reading.hanzi
}

export function formatQuantityReading(
  qty: number,
  style: NumberStyle = 'normal'
): ChinesePriceReading {
  if (qty === 2 && style === 'normal') {
    return { hanzi: '两', hanziTrad: '兩', pinyin: 'liǎng' }
  }
  return numberToChinese(Math.max(0, Math.floor(qty)), style)
}
