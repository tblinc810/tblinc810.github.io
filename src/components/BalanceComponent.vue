<template>
  <v-card class="mb-4">
    <v-card-title>Current Balance</v-card-title>
    <v-card-text>
      <p class="text-h4">${{ financeStore.balance.toFixed(2) }}</p>
      <v-btn @click="financeStore.fetchBalance" color="info" small>Refresh Balance</v-btn>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useFinanceStore } from '@/stores/finance'

const financeStore = useFinanceStore()

onMounted(() => {
  financeStore.fetchBalance()
})
</script>
