<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useFinanceStore } from '@/stores/finance'

interface Transaction {
  id?: string
  amount: number
  type: 'deposit' | 'withdraw' | 'transfer-out' | 'transfer-in'
  timestamp: any // Use firebase.firestore.Timestamp or Date
  recipientMobile?: string // Optional: for transfer transactions
}

const financeStore = useFinanceStore()
const transactions = ref<Transaction[]>([])

const headers = [
  { title: 'Type', key: 'type' },
  { title: 'Amount', key: 'amount' },
  { title: 'Date', key: 'timestamp' },
  { title: 'ID', key: 'id' },
]

const totalDeposits = computed(() => {
  return transactions.value
    .filter((t) => t.type === 'deposit' || t.type === 'transfer-in')
    .reduce((sum, t) => sum + t.amount, 0)
})

const totalWithdrawals = computed(() => {
  return transactions.value
    .filter((t) => t.type === 'withdraw' || t.type === 'transfer-out')
    .reduce((sum, t) => sum + t.amount, 0)
})

const netChange = computed(() => {
  return totalDeposits.value - totalWithdrawals.value
})

const numberOfDeposits = computed(() => {
  return transactions.value.filter((t) => t.type === 'deposit' || t.type === 'transfer-in').length
})

const numberOfWithdrawals = computed(() => {
  return transactions.value.filter((t) => t.type === 'withdraw' || t.type === 'transfer-out').length
})

const fetchHistory = async () => {
  transactions.value = await financeStore.fetchTransactions()
}

onMounted(fetchHistory)
</script>

<template>
  <v-card class="mx-auto" max-width="800">
    <v-card-title class="text-h5">Transaction History</v-card-title>
    <v-card-text>
      <v-row class="mb-4">
        <v-col cols="12" md="4">
          <v-card variant="outlined">
            <v-card-title class="text-subtitle-1">Total Deposits</v-card-title>
            <v-card-text class="text-h6 green--text">${{ totalDeposits.toFixed(2) }}</v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card variant="outlined">
            <v-card-title class="text-subtitle-1">Total Withdrawals</v-card-title>
            <v-card-text class="text-h6 red--text">${{ totalWithdrawals.toFixed(2) }}</v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card variant="outlined">
            <v-card-title class="text-subtitle-1">Current Balance</v-card-title>
            <v-card-text class="text-h6">${{ financeStore.balance.toFixed(2) }}</v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card variant="outlined">
            <v-card-title class="text-subtitle-1">Net Change</v-card-title>
            <v-card-text
              :class="{
                'text-h6': true,
                'green--text': netChange >= 0,
                'red--text': netChange < 0,
              }"
              >${{ netChange.toFixed(2) }}</v-card-text
            >
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card variant="outlined">
            <v-card-title class="text-subtitle-1"># Deposits</v-card-title>
            <v-card-text class="text-h6">{{ numberOfDeposits }}</v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card variant="outlined">
            <v-card-title class="text-subtitle-1"># Withdrawals</v-card-title>
            <v-card-text class="text-h6">{{ numberOfWithdrawals }}</v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-data-table
        :headers="headers"
        :items="transactions"
        item-key="id"
        class="elevation-1"
        v-if="transactions.length > 0"
      >
        <template v-slot:item.type="{ item }">
          <v-chip
            :color="
              item.type === 'deposit' || item.type === 'transfer-in'
                ? 'green'
                : item.type === 'withdraw' || item.type === 'transfer-out'
                  ? 'red'
                  : 'blue'
            "
            dark
            >{{ item.type }}</v-chip
          >
          <div v-if="item.recipientMobile" class="text-caption">To: {{ item.recipientMobile }}</div>
        </template>
        <template v-slot:item.amount="{ item }">
          <span
            :class="{
              'green--text': item.type === 'deposit' || item.type === 'transfer-in',
              'red--text': item.type === 'withdraw' || item.type === 'transfer-out',
            }"
          >
            {{ item.type === 'deposit' || item.type === 'transfer-in' ? '+' : '-' }}${{
              item.amount.toFixed(2)
            }}
          </span>
        </template>
        <template v-slot:item.timestamp="{ item }">
          {{ new Date(item.timestamp.toDate()).toLocaleString() }}
        </template>
      </v-data-table>
      <v-alert type="info" v-else>No transactions yet.</v-alert>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.green--text {
  color: green;
}
.red--text {
  color: red;
}
</style>
