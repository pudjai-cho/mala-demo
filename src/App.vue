<script setup lang="ts">
import { ref } from 'vue'
import CheckoutView from '@/components/CheckoutView.vue'
import CustomerTicket from '@/components/CustomerTicket.vue'
import IngredientTray from '@/components/IngredientTray.vue'
import MalaBowl from '@/components/MalaBowl.vue'
import ResultView from '@/components/ResultView.vue'
import TeacherOrderModal from '@/components/TeacherOrderModal.vue'
import TopBar from '@/components/TopBar.vue'
import TtsWarningBanner from '@/components/TtsWarningBanner.vue'
import { provideI18n } from '@/composables/useI18n'
import { useMalaGame } from '@/composables/useMalaGame'
import type { OrderItem } from '@/types/game'

const game = useMalaGame()
provideI18n(game.i18n)

const teacherModalOpen = ref(false)

function handleApplyCustomOrder(items: OrderItem[]) {
  game.applyCustomOrder(items)
  teacherModalOpen.value = false
}
</script>

<template>
  <div class="mx-auto flex max-w-[1320px] flex-col gap-4 px-5 pt-4 pb-8">
    <TopBar
      v-model:checkout-mode="game.checkoutMode.value"
      v-model:difficulty="game.difficulty.value"
      :stars="game.stars.value"
      :answered-count="game.answeredCount.value"
      :round-number="game.roundNumber.value"
      @new-random="game.startNewRandomRound()"
    />

    <TtsWarningBanner />

    <main class="flex flex-col gap-4">
      <CustomerTicket
        v-model:order-mode="game.orderMode.value"
        v-model:peek-ticket="game.peekListeningTicket.value"
        v-model:vocab-display-mode="game.vocabDisplayMode.value"
        :customer="game.currentCustomer.value"
        :order="game.customerOrder.value"
        :phase="game.phase.value"
        @speak-order="game.speakOrder"
        @speak-phrase="game.speakChinesePhrase"
        @open-teacher-modal="teacherModalOpen = true"
      />

      <!-- SCOOPING STAGE -->
      <div
        v-if="game.phase.value === 'scooping'"
        class="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.45fr_1fr]"
      >
        <IngredientTray
          v-model:menu-tap-speak="game.menuTapSpeak.value"
          :disabled="false"
          :get-bowl-qty="game.getBowlQty"
          :vocab-display-mode="game.vocabDisplayMode.value"
          @add="game.addToBowl"
          @decrement="game.decrementFromBowl"
          @speak="game.speakIngredient"
          @speak-phrase="game.speakChinesePhrase"
        />
        <MalaBowl
          :bowl="game.bowl.value"
          :bowl-count="game.bowlCount.value"
          :checkout-mode="game.checkoutMode.value"
          @add="game.addToBowl"
          @decrement="game.decrementFromBowl"
          @clear="game.clearBowl"
          @serve="game.serveBowl"
        />
      </div>

      <!-- CHECKOUT STAGE -->
      <CheckoutView
        v-else-if="game.phase.value === 'checkout'"
        v-model:checkout-mode="game.checkoutMode.value"
        :bowl="game.bowl.value"
        :entered-price-str="game.enteredPriceStr.value"
        :entered-price="game.enteredPrice.value"
        :bowl-total-chinese="game.bowlTotalChinese.value"
        @back="game.backToScooping"
        @append-digit="game.appendDigit"
        @backspace="game.backspaceDigit"
        @clear-digits="game.clearDigits"
        @submit="game.submitPayment"
      />

      <!-- RESULT STAGE -->
      <ResultView
        v-else
        :checkout-mode="game.checkoutMode.value"
        :bowl-total-price="game.bowlTotalPrice.value"
        :entered-price="game.enteredPrice.value"
        :is-price-correct="game.isPriceCorrect.value"
        :is-bowl-exact="game.isBowlExact.value"
        :bowl-total-chinese="game.bowlTotalChinese.value"
        :comparison-items="game.comparisonItems.value"
        @next-round="game.startNewRandomRound()"
        @speak-total="game.speakTotalChinese"
      />
    </main>

    <TeacherOrderModal
      v-if="teacherModalOpen"
      @close="teacherModalOpen = false"
      @apply="handleApplyCustomOrder"
    />
  </div>
</template>
