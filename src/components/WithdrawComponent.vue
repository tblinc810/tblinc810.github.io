<template>
  <v-card class="mb-4">
    <v-card-title>Withdraw Funds</v-card-title>
    <v-card-text>
      <v-form @submit.prevent="handleWithdraw">
        <v-text-field
          v-model.number="amount"
          label="Amount"
          type="number"
          required
          :rules="[rules.required, rules.positiveNumber, rules.sufficientFunds]"
        ></v-text-field>
        <v-btn
          type="submit"
          color="warning"
          :disabled="!amount || amount <= 0 || amount > financeStore.balance"
          >Withdraw</v-btn
        >
      </v-form>
      <v-alert v-if="error" type="error" dense class="mt-3">{{ error }}</v-alert>
      <v-alert v-if="success" type="success" dense class="mt-3">{{ success }}</v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFinanceStore } from '@/stores/finance'

const financeStore = useFinanceStore()
const amount = ref<number | null>(null)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const rules = {
  required: (value: any) => !!value || 'Required.',
  positiveNumber: (value: number) => value > 0 || 'Amount must be positive.',
  sufficientFunds: (value: number) => value <= financeStore.balance || 'Insufficient funds.',
}

const handleWithdraw = async () => {
  error.value = null
  success.value = null
  if (amount.value && amount.value > 0) {
    try {
      await financeStore.withdraw(amount.value)
      success.value = `Successfully withdrew $${amount.value.toFixed(2)}.`
      amount.value = null // Clear input
    } catch (err: any) {
      error.value = err.message
    }
  }
}
</script>
