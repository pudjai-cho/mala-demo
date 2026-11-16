import type { CategoryId, ChineseScript, CustomerPersona, Ingredient } from '@/types/game'

export interface IngredientCategory {
  id: CategoryId
  hanzi: string
  hanziTrad: string
  pinyin: string
  thai: string
  english: string
  color: string
  sectionClass: string
}

export interface IngredientCategorySection {
  id: string
  category: IngredientCategory | null
  items: Ingredient[]
}

export const CATEGORIES: IngredientCategory[] = [
  {
    id: 'veggie',
    hanzi: '蔬菜',
    hanziTrad: '蔬菜',
    pinyin: 'shūcài',
    thai: 'ผัก',
    english: 'Vegetables',
    color: '#2A9D8F',
    sectionClass: 'border-teal-200/80 bg-teal-50/55 dark:border-teal-800/70 dark:bg-teal-950/35',
  },
  {
    id: 'meat',
    hanzi: '肉类',
    hanziTrad: '肉類',
    pinyin: 'ròulèi',
    thai: 'เนื้อสัตว์',
    english: 'Meats',
    color: '#E63946',
    sectionClass: 'border-rose-200/80 bg-rose-50/55 dark:border-rose-800/70 dark:bg-rose-950/35',
  },
  {
    id: 'seafood',
    hanzi: '海鲜',
    hanziTrad: '海鮮',
    pinyin: 'hǎixiān',
    thai: 'อาหารทะเล',
    english: 'Seafood',
    color: '#0284C7',
    sectionClass: 'border-sky-200/80 bg-sky-50/55 dark:border-sky-800/70 dark:bg-sky-950/35',
  },
  {
    id: 'tofu_noodle',
    hanzi: '豆蛋面',
    hanziTrad: '豆蛋麵',
    pinyin: 'dòu dàn miàn',
    thai: 'เต้าหู้ ไข่ & เส้น',
    english: 'Tofu, Egg & Noodles',
    color: '#E76F51',
    sectionClass: 'border-amber-200/80 bg-amber-50/60 dark:border-amber-800/70 dark:bg-amber-950/35',
  },
]

export const INGREDIENTS: Ingredient[] = [
  // 蔬菜 (Vegetables)
  {
    id: 'baicai',
    hanzi: '白菜',
    hanziTrad: '白菜',
    pinyin: 'báicài',
    thai: 'ผักกาดขาว',
    english: 'Napa Cabbage',
    unit: '棵',
    unitTrad: '棵',
    unitPinyin: 'kē',
    category: 'veggie',
    price: 2,
    emoji: '🥬',
    accent: '#DCFCE7',
  },
  {
    id: 'yumi',
    hanzi: '玉米',
    hanziTrad: '玉米',
    pinyin: 'yùmǐ',
    thai: 'ข้าวโพด',
    english: 'Corn',
    unit: '根',
    unitTrad: '根',
    unitPinyin: 'gēn',
    category: 'veggie',
    price: 3,
    emoji: '🌽',
    accent: '#FEF9C3',
  },
  {
    id: 'tudou',
    hanzi: '土豆',
    hanziTrad: '馬鈴薯',
    pinyin: 'tǔdòu',
    pinyinTrad: 'mǎlíngshǔ',
    thai: 'มันฝรั่ง',
    english: 'Potato',
    unit: '个',
    unitTrad: '個',
    unitPinyin: 'gè',
    category: 'veggie',
    price: 2,
    emoji: '🥔',
    accent: '#FEF3C7',
  },
  {
    id: 'xianggu',
    hanzi: '香菇',
    hanziTrad: '香菇',
    pinyin: 'xiānggū',
    thai: 'เห็ดหอม',
    english: 'Shiitake',
    unit: '朵',
    unitTrad: '朵',
    unitPinyin: 'duǒ',
    category: 'veggie',
    price: 4,
    emoji: '🍄',
    accent: '#FDE68A',
  },
  {
    id: 'xilanhua',
    hanzi: '西兰花',
    hanziTrad: '青花菜',
    pinyin: 'xīlánhuā',
    pinyinTrad: 'qīnghuācài',
    thai: 'บรอกโคลี',
    english: 'Broccoli',
    unit: '朵',
    unitTrad: '朵',
    unitPinyin: 'duǒ',
    category: 'veggie',
    price: 3,
    emoji: '🥦',
    accent: '#D1FAE5',
  },
  {
    id: 'oupian',
    hanzi: '莲藕',
    hanziTrad: '蓮藕',
    pinyin: 'lián’ǒu',
    thai: 'รากบัว',
    english: 'Lotus Root',
    unit: '片',
    unitTrad: '片',
    unitPinyin: 'piàn',
    category: 'veggie',
    price: 4,
    emoji: '🪷',
    accent: '#FCE7F3',
  },

  // 肉类 / 肉類 (Meats)
  {
    id: 'niurou',
    hanzi: '牛肉',
    hanziTrad: '牛肉',
    pinyin: 'niúròu',
    thai: 'เนื้อวัว',
    english: 'Beef',
    unit: '份',
    unitTrad: '份',
    unitPinyin: 'fèn',
    category: 'meat',
    price: 8,
    emoji: '🥩',
    accent: '#FEE2E2',
  },
  {
    id: 'zhurou',
    hanzi: '猪肉',
    hanziTrad: '豬肉',
    pinyin: 'zhūròu',
    thai: 'เนื้อหมู',
    english: 'Pork',
    unit: '份',
    unitTrad: '份',
    unitPinyin: 'fèn',
    category: 'meat',
    price: 6,
    emoji: '🥓',
    accent: '#FFE4E6',
  },
  {
    id: 'jirou',
    hanzi: '鸡肉',
    hanziTrad: '雞肉',
    pinyin: 'jīròu',
    thai: 'เนื้อไก่',
    english: 'Chicken',
    unit: '份',
    unitTrad: '份',
    unitPinyin: 'fèn',
    category: 'meat',
    price: 5,
    emoji: '🍗',
    accent: '#FFEDD5',
  },
  {
    id: 'xia',
    hanzi: '虾',
    hanziTrad: '蝦',
    pinyin: 'xiā',
    thai: 'กุ้ง',
    english: 'Shrimp',
    unit: '只',
    unitTrad: '隻',
    unitPinyin: 'zhī',
    category: 'seafood',
    price: 9,
    emoji: '🦐',
    accent: '#FECDD3',
  },
  {
    id: 'yuwan',
    hanzi: '鱼丸',
    hanziTrad: '魚丸',
    pinyin: 'yúwán',
    thai: 'ลูกชิ้นปลา',
    english: 'Fish Ball',
    unit: '颗',
    unitTrad: '顆',
    unitPinyin: 'kē',
    category: 'seafood',
    price: 4,
    emoji: '🍢',
    accent: '#FED7AA',
  },
  {
    id: 'huotui',
    hanzi: '火腿',
    hanziTrad: '火腿',
    pinyin: 'huǒtuǐ',
    thai: 'แฮม/ไส้กรอก',
    english: 'Ham',
    unit: '片',
    unitTrad: '片',
    unitPinyin: 'piàn',
    category: 'meat',
    price: 4,
    emoji: '🌭',
    accent: '#FEE2E2',
  },

  // 豆面 / 豆麵 (Tofu & Noodles)
  {
    id: 'doufu',
    hanzi: '豆腐',
    hanziTrad: '豆腐',
    pinyin: 'dòufu',
    thai: 'เต้าหู้',
    english: 'Tofu',
    unit: '块',
    unitTrad: '塊',
    unitPinyin: 'kuài',
    category: 'tofu_noodle',
    price: 3,
    emoji: '🧈',
    accent: '#FEF3C7',
  },
  {
    id: 'jidan',
    hanzi: '鸡蛋',
    hanziTrad: '雞蛋',
    pinyin: 'jīdàn',
    thai: 'ไข่ไก่',
    english: 'Egg',
    unit: '个',
    unitTrad: '個',
    unitPinyin: 'gè',
    category: 'tofu_noodle',
    price: 2,
    emoji: '🥚',
    accent: '#FFFBEB',
  },
  {
    id: 'fensi',
    hanzi: '粉丝',
    hanziTrad: '冬粉',
    pinyin: 'fěnsī',
    pinyinTrad: 'dōngfěn',
    thai: 'วุ้นเส้น',
    english: 'Glass Noodles',
    unit: '把',
    unitTrad: '把',
    unitPinyin: 'bǎ',
    category: 'tofu_noodle',
    price: 3,
    emoji: '🍜',
    accent: '#E0F2FE',
  },
  {
    id: 'niangao',
    hanzi: '年糕',
    hanziTrad: '年糕',
    pinyin: 'niángāo',
    thai: 'ต็อก/เค้กข้าว',
    english: 'Rice Cake',
    unit: '块',
    unitTrad: '塊',
    unitPinyin: 'kuài',
    category: 'tofu_noodle',
    price: 5,
    emoji: '🍡',
    accent: '#F3E8FF',
  },
]

export const INGREDIENT_MAP: Record<string, Ingredient> = Object.fromEntries(
  INGREDIENTS.map((item) => [item.id, item])
)

export function formatHanziPair(
  simplified: string,
  traditional: string,
  script: ChineseScript
): string {
  return script === 'traditional' ? traditional : simplified
}

export function getIngredientPinyin(
  ingredient: Ingredient | undefined,
  script: ChineseScript
): string {
  if (!ingredient) return ''
  return script === 'traditional'
    ? ingredient.pinyinTrad ?? ingredient.pinyin
    : ingredient.pinyin
}

export function getIngredientUnit(
  ingredient: Ingredient | undefined,
  script: ChineseScript
): string {
  if (!ingredient) return '份'
  return formatHanziPair(ingredient.unit, ingredient.unitTrad, script)
}

export function formatCategoryExtras(
  cat: IngredientCategory,
  showThai: boolean,
  showEnglish: boolean
): string {
  return [showThai ? cat.thai : '', showEnglish ? cat.english : '']
    .filter(Boolean)
    .join(' · ')
}

/**
 * Single shared grouping helper used by both IngredientTray and TeacherOrderModal.
 */
export function getIngredientCategorySections(
  filterCategory: CategoryId | 'all' = 'all'
): IngredientCategorySection[] {
  const categories =
    filterCategory === 'all'
      ? CATEGORIES
      : CATEGORIES.filter((c) => c.id === filterCategory)

  return categories.map((cat) => ({
    id: cat.id,
    category: cat,
    items: INGREDIENTS.filter((ing) => ing.category === cat.id),
  }))
}

export const CUSTOMER_PERSONAS: CustomerPersona[] = [
  {
    name: 'Xiao Mei',
    hanziTitle: '小美',
    hanziTitleTrad: '小美',
    hanziTitlePinyin: 'Xiǎo Měi',
    avatar: '👧🏻',
    greeting: '老板，我要点麻辣烫！',
    greetingTrad: '老闆，我要點麻辣燙！',
    greetingPinyin: 'Lǎobǎn, wǒ yào diǎn málàtàng!',
    greetingThai: 'เถ้าแก่ ฉันขอสั่งหม่าล่าทั่ง!',
    greetingEnglish: 'Boss, I want to order Malatang!',
  },
  {
    name: 'Panda Bao',
    hanziTitle: '熊猫宝宝',
    hanziTitleTrad: '熊貓寶寶',
    hanziTitlePinyin: 'Xióngmāo Bǎobǎo',
    avatar: '🐼',
    greeting: '你好！请给我一份麻辣烫。',
    greetingTrad: '你好！請給我一份麻辣燙。',
    greetingPinyin: 'Nǐ hǎo! Qǐng gěi wǒ yī fèn málàtàng.',
    greetingThai: 'สวัสดี! กรุณาให้หม่าล่าทั่งฉันหนึ่งที่',
    greetingEnglish: 'Hello! Please give me one portion of Malatang.',
  },
  {
    name: 'Teacher Wang',
    hanziTitle: '王老师',
    hanziTitleTrad: '王老師',
    hanziTitlePinyin: 'Wáng Lǎoshī',
    avatar: '👩🏻‍🏫',
    greeting: '老板好，我想要这些菜：',
    greetingTrad: '老闆好，我想要這些菜：',
    greetingPinyin: 'Lǎobǎn hǎo, wǒ xiǎng yào zhèxiē cài:',
    greetingThai: 'สวัสดีเถ้าแก่ ฉันอยากได้อาหารพวกนี้:',
    greetingEnglish: 'Hello boss, I would like these dishes:',
  },
  {
    name: 'Bunny',
    hanziTitle: '小兔子',
    hanziTitleTrad: '小兔子',
    hanziTitlePinyin: 'Xiǎo Tùzi',
    avatar: '🐰',
    greeting: '我好饿呀，我要点：',
    greetingTrad: '我好餓呀，我要點：',
    greetingPinyin: 'Wǒ hǎo è ya, wǒ yào diǎn:',
    greetingThai: 'ฉันหิวจังเลย ฉันขอสั่ง:',
    greetingEnglish: "I'm so hungry, I want to order:",
  },
]
