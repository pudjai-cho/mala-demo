import { computed, ref } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { usePersistedRef } from '@/composables/usePersistedRef'
import { CUSTOMER_PERSONAS, INGREDIENTS, INGREDIENT_MAP, getIngredientUnit } from '@/data/ingredients'
import type {
  CheckoutMode,
  Difficulty,
  GamePhase,
  Ingredient,
  OrderComparisonItem,
  OrderItem,
  OrderMode,
  VocabDisplayMode,
} from '@/types/game'
import { formatChineseNumber, formatPriceInChinese, formatQuantityHanzi } from '@/utils/chineseNumbers'
import { playPartialChime, playSuccessChime, playTryAgainTone } from '@/utils/sfx'
import { initSpeech, speakSequence, speakText } from '@/utils/speech'

const STORAGE_PREFIX = 'mala-demo:v1'

const isOrderMode = (v: unknown): v is OrderMode => v === 'listening' || v === 'reading'
const isCheckoutMode = (v: unknown): v is CheckoutMode =>
  v === 'auto' || v === 'read_number' || v === 'calc_subtotals' || v === 'calc_manual'
const isVocabDisplayMode = (v: unknown): v is VocabDisplayMode =>
  v === 'text_to_pic' || v === 'pic_to_text' || v === 'text_only' || v === 'all'
const isDifficulty = (v: unknown): v is Difficulty =>
  v === 'easy' || v === 'medium' || v === 'hard'
const isBoolean = (v: unknown): v is boolean => typeof v === 'boolean'

function buildRandomOrder(difficulty: Difficulty): OrderItem[] {
  const countRange =
    difficulty === 'easy' ? [2, 3] : difficulty === 'medium' ? [3, 4] : [4, 5]
  const maxQty = difficulty === 'easy' ? 2 : 3

  const targetCount =
    countRange[0] + Math.floor(Math.random() * (countRange[1] - countRange[0] + 1))

  const shuffled = [...INGREDIENTS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, targetCount).map((item) => ({
    ingredientId: item.id,
    quantity: 1 + Math.floor(Math.random() * maxQty),
  }))
}

export function useMalaGame() {
  initSpeech()

  const i18n = useI18n()

  // Persisted teacher preferences
  const menuTapSpeak = usePersistedRef<boolean>(`${STORAGE_PREFIX}:menuTapSpeak`, false, isBoolean)
  const orderMode = usePersistedRef<OrderMode>(`${STORAGE_PREFIX}:orderMode`, 'reading', isOrderMode)
  const checkoutMode = usePersistedRef<CheckoutMode>(
    `${STORAGE_PREFIX}:checkoutMode`,
    'calc_subtotals',
    isCheckoutMode
  )
  const vocabDisplayMode = usePersistedRef<VocabDisplayMode>(
    `${STORAGE_PREFIX}:vocabDisplayMode`,
    'all',
    isVocabDisplayMode
  )
  const difficulty = usePersistedRef<Difficulty>(
    `${STORAGE_PREFIX}:difficulty`,
    'easy',
    isDifficulty
  )

  const peekListeningTicket = ref(false)

  // Session progress
  const roundNumber = ref(1)
  const stars = ref(0)
  const answeredCount = ref(0)
  const phase = ref<GamePhase>('scooping')
  const personaIndex = ref(0)

  // Round state
  const customerOrder = ref<OrderItem[]>(buildRandomOrder(difficulty.value))
  const bowl = ref<OrderItem[]>([])
  const enteredPriceStr = ref('')

  const preferredSpeechLang = computed<'zh-CN' | 'zh-TW'>(() =>
    i18n.cnScript.value === 'traditional' ? 'zh-TW' : 'zh-CN'
  )

  const currentCustomer = computed(
    () => CUSTOMER_PERSONAS[personaIndex.value % CUSTOMER_PERSONAS.length]
  )

  const bowlCount = computed(() =>
    bowl.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  const bowlTotalPrice = computed(() =>
    bowl.value.reduce((sum, item) => {
      const ing = INGREDIENT_MAP[item.ingredientId]
      return sum + (ing ? ing.price * item.quantity : 0)
    }, 0)
  )

  const orderItemsSpeechZh = computed(() => {
    const isTrad = i18n.cnScript.value === 'traditional'
    const parts = customerOrder.value.map((item) => {
      const ing = INGREDIENT_MAP[item.ingredientId]
      if (!ing) return ''
      const name = isTrad ? ing.hanziTrad : ing.hanzi
      const unit = getIngredientUnit(ing, i18n.cnScript.value)
      return `${formatQuantityHanzi(item.quantity, i18n.cnScript.value, i18n.numberStyle.value)}${unit}${name}`
    })
    return `${parts.filter(Boolean).join('，')}。`
  })

  const orderGreetingZh = computed(() =>
    i18n.cnScript.value === 'traditional'
      ? currentCustomer.value.greetingTrad
      : currentCustomer.value.greeting
  )

  const orderItemsSpeechTh = computed(() =>
    customerOrder.value
      .map((item) => {
        const ing = INGREDIENT_MAP[item.ingredientId]
        return ing ? `${ing.thai} ${item.quantity} ที่` : ''
      })
      .filter(Boolean)
      .join(', ')
  )

  const orderItemsSpeechEn = computed(() =>
    customerOrder.value
      .map((item) => {
        const ing = INGREDIENT_MAP[item.ingredientId]
        return ing ? `${item.quantity} ${ing.english}` : ''
      })
      .filter(Boolean)
      .join(', ')
  )

  const enteredPrice = computed(() => {
    const parsed = Number.parseInt(enteredPriceStr.value, 10)
    return Number.isNaN(parsed) ? null : parsed
  })

  const isPriceCorrect = computed(
    () => enteredPrice.value !== null && enteredPrice.value === bowlTotalPrice.value
  )

  const bowlTotalChinese = computed(() =>
    formatPriceInChinese(bowlTotalPrice.value, i18n.numberStyle.value)
  )

  const comparisonItems = computed<OrderComparisonItem[]>(() => {
    const orderMap = new Map(customerOrder.value.map((i) => [i.ingredientId, i.quantity]))
    const bowlMap = new Map(bowl.value.map((i) => [i.ingredientId, i.quantity]))
    const allIds = new Set([...orderMap.keys(), ...bowlMap.keys()])

    const list: OrderComparisonItem[] = []
    for (const id of allIds) {
      const ingredient = INGREDIENT_MAP[id]
      if (!ingredient) continue
      const orderedQty = orderMap.get(id) ?? 0
      const servedQty = bowlMap.get(id) ?? 0

      let status: OrderComparisonItem['status'] = 'match'
      if (orderedQty === 0 && servedQty > 0) status = 'extra'
      else if (orderedQty > 0 && servedQty === 0) status = 'missing'
      else if (orderedQty !== servedQty) status = 'partial'

      list.push({ ingredient, orderedQty, servedQty, status })
    }
    return list
  })

  const isBowlExact = computed(
    () =>
      comparisonItems.value.length > 0 &&
      comparisonItems.value.every((item) => item.status === 'match')
  )

  function getSpeechWord(ing: Ingredient): string {
    return i18n.cnScript.value === 'traditional' ? ing.hanziTrad : ing.hanzi
  }

  function getBowlQty(ingredientId: string): number {
    return bowl.value.find((i) => i.ingredientId === ingredientId)?.quantity ?? 0
  }

  function addToBowl(ingredientId: string): void {
    if (phase.value !== 'scooping') return
    const existing = bowl.value.find((i) => i.ingredientId === ingredientId)
    if (existing) {
      existing.quantity += 1
    } else {
      bowl.value.push({ ingredientId, quantity: 1 })
    }

    if (menuTapSpeak.value) {
      const ing = INGREDIENT_MAP[ingredientId]
      if (ing) speakText(getSpeechWord(ing), preferredSpeechLang.value, 0.9)
    }
  }

  function decrementFromBowl(ingredientId: string): void {
    if (phase.value !== 'scooping') return
    const idx = bowl.value.findIndex((i) => i.ingredientId === ingredientId)
    if (idx === -1) return
    if (bowl.value[idx].quantity > 1) {
      bowl.value[idx].quantity -= 1
    } else {
      bowl.value.splice(idx, 1)
    }
  }

  function clearBowl(): void {
    if (phase.value !== 'scooping') return
    bowl.value = []
  }

  function serveBowl(): void {
    if (bowl.value.length === 0) return
    if (checkoutMode.value === 'auto') {
      enteredPriceStr.value = String(bowlTotalPrice.value)
      answeredCount.value += 1
      phase.value = 'result'
      if (isBowlExact.value) {
        stars.value += 1
        playSuccessChime()
      } else {
        playTryAgainTone()
      }
      return
    }
    enteredPriceStr.value = ''
    phase.value = 'checkout'
  }

  function backToScooping(): void {
    phase.value = 'scooping'
  }

  function appendDigit(digit: string): void {
    if (enteredPriceStr.value.length >= 3) return
    enteredPriceStr.value = enteredPriceStr.value === '0' ? digit : enteredPriceStr.value + digit
    const num = Number.parseInt(digit, 10)
    if (!Number.isNaN(num)) {
      speakText(
        formatChineseNumber(num, i18n.cnScript.value, 'normal'),
        preferredSpeechLang.value,
        0.9
      )
    }
  }

  function backspaceDigit(): void {
    enteredPriceStr.value = enteredPriceStr.value.slice(0, -1)
  }

  function clearDigits(): void {
    enteredPriceStr.value = ''
  }

  function submitPayment(): void {
    if (phase.value !== 'checkout' || enteredPrice.value === null) return
    answeredCount.value += 1
    phase.value = 'result'
    if (isBowlExact.value && isPriceCorrect.value) {
      stars.value += 1
      playSuccessChime()
    } else if (isBowlExact.value || isPriceCorrect.value) {
      playPartialChime()
    } else {
      playTryAgainTone()
    }
  }

  function resetRound(nextOrder: OrderItem[], mode?: OrderMode): void {
    if (mode) orderMode.value = mode
    roundNumber.value += 1
    personaIndex.value = (personaIndex.value + 1) % CUSTOMER_PERSONAS.length
    customerOrder.value = nextOrder
    bowl.value = []
    enteredPriceStr.value = ''
    peekListeningTicket.value = false
    phase.value = 'scooping'
  }

  function startNewRandomRound(nextDifficulty?: Difficulty): void {
    if (nextDifficulty) difficulty.value = nextDifficulty
    resetRound(buildRandomOrder(difficulty.value))
  }

  function applyCustomOrder(items: OrderItem[], mode?: OrderMode): void {
    if (items.length === 0) return
    resetRound(
      items.map((i) => ({ ...i })),
      mode
    )
  }

  function speakOrder(lang: 'zh' | 'th' | 'en' = 'zh'): void {
    if (lang === 'th') {
      speakSequence([
        { text: currentCustomer.value.greetingThai, lang: 'th-TH', rate: 0.92 },
        { text: orderItemsSpeechTh.value, lang: 'th-TH', rate: 0.88 },
      ])
      return
    }
    if (lang === 'en') {
      speakSequence([
        { text: currentCustomer.value.greetingEnglish, lang: 'en-US', rate: 0.95 },
        { text: orderItemsSpeechEn.value, lang: 'en-US', rate: 0.9 },
      ])
      return
    }
    speakSequence([
      { text: orderGreetingZh.value, lang: preferredSpeechLang.value, rate: 0.82 },
      { text: orderItemsSpeechZh.value, lang: preferredSpeechLang.value, rate: 0.78 },
    ])
  }

  function speakTotalChinese(lang: 'zh' | 'th' | 'en' = 'zh'): void {
    if (lang === 'th') {
      speakText(`ทั้งหมด ${bowlTotalPrice.value} หยวน`, 'th-TH', 0.9)
      return
    }
    if (lang === 'en') {
      speakText(`Total ${bowlTotalPrice.value} yuan`, 'en-US', 0.95)
      return
    }
    const totalWord =
      i18n.cnScript.value === 'traditional'
        ? bowlTotalChinese.value.hanziTrad
        : bowlTotalChinese.value.hanzi
    speakText(`一共${totalWord}`, preferredSpeechLang.value, 0.82)
  }

  function speakIngredient(ing: Ingredient, lang: 'zh' | 'th' | 'en' = 'zh'): void {
    if (lang === 'th') {
      speakText(ing.thai, 'th-TH', 0.92)
      return
    }
    if (lang === 'en') {
      speakText(ing.english, 'en-US', 0.95)
      return
    }
    speakText(getSpeechWord(ing), preferredSpeechLang.value, 0.85)
  }

  function speakChinesePhrase(phrase: string): void {
    speakText(phrase, preferredSpeechLang.value, 0.85)
  }

  return {
    i18n,
    menuTapSpeak,
    orderMode,
    checkoutMode,
    vocabDisplayMode,
    difficulty,
    peekListeningTicket,
    roundNumber,
    stars,
    answeredCount,
    phase,
    currentCustomer,
    customerOrder,
    bowl,
    bowlCount,
    bowlTotalPrice,
    enteredPriceStr,
    enteredPrice,
    isPriceCorrect,
    bowlTotalChinese,
    comparisonItems,
    isBowlExact,
    getBowlQty,
    addToBowl,
    decrementFromBowl,
    clearBowl,
    serveBowl,
    backToScooping,
    appendDigit,
    backspaceDigit,
    clearDigits,
    submitPayment,
    startNewRandomRound,
    applyCustomOrder,
    speakOrder,
    speakTotalChinese,
    speakIngredient,
    speakChinesePhrase,
  }
}
