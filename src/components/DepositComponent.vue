<template>
  <v-card class="mb-4">
    <v-card-title>Deposit Funds</v-card-title>
    <v-card-text>
      <v-form @submit.prevent="handleDeposit">
        <v-text-field
          v-model.number="amount"
          label="Amount"
          type="number"
          required
          :rules="[rules.required, rules.positiveNumber]"
        ></v-text-field>
        <v-btn type="submit" color="success" :disabled="!amount || amount <= 0">Deposit</v-btn>
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
}

const handleDeposit = async () => {
  error.value = null
  success.value = null
  if (amount.value && amount.value > 0) {
    try {
      await financeStore.deposit(amount.value)
      success.value = `Successfully deposited $${amount.value.toFixed(2)}.`
      amount.value = null // Clear input
    } catch (err: any) {
      error.value = err.message
    }
  }
}
</script>
