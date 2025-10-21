<script setup lang="ts">
import { ref } from 'vue'
import { useFinanceStore } from '@/stores/finance'

const financeStore = useFinanceStore()

const amount = ref(0)
const recipientMobile = ref('')
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const transferFunds = async () => {
  loading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  try {
    await financeStore.transfer(amount.value, recipientMobile.value)
    successMessage.value = `Successfully transferred $${amount.value.toFixed(2)} to ${recipientMobile.value}`
    amount.value = 0
    recipientMobile.value = ''
    // Refresh balance and transactions after transfer
    await financeStore.fetchBalance()
    // Assuming TransactionHistory component will re-fetch its data on its own or via a prop/event
  } catch (error: any) {
    errorMessage.value = error.message
    console.error('Error during transfer:', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-card class="mb-4">
    <v-card-title>Transfer Funds</v-card-title>
    <v-card-text>
      <v-text-field
        label="Amount"
        type="number"
        v-model.number="amount"
        :rules="[(v) => v > 0 || 'Amount must be positive']"
        prefix="$"
      ></v-text-field>
      <v-text-field
        label="Recipient Mobile Number"
        type="tel"
        v-model="recipientMobile"
        :rules="[(v) => !!v || 'Mobile number is required']"
      ></v-text-field>
      <v-btn color="primary" @click="transferFunds" :loading="loading" block> Transfer </v-btn>
      <v-alert v-if="successMessage" type="success" class="mt-3">{{ successMessage }}</v-alert>
      <v-alert v-if="errorMessage" type="error" class="mt-3">{{ errorMessage }}</v-alert>
    </v-card-text>
  </v-card>
</template>

<style scoped>
/* Component specific styles */
</style>
