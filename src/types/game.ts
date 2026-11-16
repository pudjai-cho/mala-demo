export type CategoryId = 'veggie' | 'meat' | 'seafood' | 'tofu_noodle'

export type ChineseScript = 'simplified' | 'traditional'

export type NumberStyle = 'normal' | 'formal'

export interface Ingredient {
  id: string
  hanzi: string
  hanziTrad: string
  pinyin: string
  pinyinTrad?: string
  thai: string
  english: string
  unit: string
  unitTrad: string
  unitPinyin: string
  category: CategoryId
  price: number // in 元 (CNY)
  emoji: string
  accent: string
}

export interface OrderItem {
  ingredientId: string
  quantity: number
}

export type OrderMode = 'listening' | 'reading'

export type CheckoutMode = 'auto' | 'read_number' | 'calc_subtotals' | 'calc_manual'

export type VocabDisplayMode = 'text_to_pic' | 'pic_to_text' | 'text_only' | 'all'

export type GamePhase = 'scooping' | 'checkout' | 'result'

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface CustomerPersona {
  name: string
  hanziTitle: string
  hanziTitleTrad: string
  hanziTitlePinyin: string
  avatar: string
  greeting: string
  greetingTrad: string
  greetingPinyin: string
  greetingThai: string
  greetingEnglish: string
}

export interface OrderComparisonItem {
  ingredient: Ingredient
  orderedQty: number
  servedQty: number
  status: 'match' | 'missing' | 'partial' | 'extra'
}
