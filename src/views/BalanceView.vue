<template>
  <div class="balance">
    <v-row>
      <v-col cols="12">
        <v-container>
          <v-row justify="center">
            <v-col cols="12">
              <v-card class="mb-4" color="primary">
                <v-card-title>
                  <v-row>
                    <v-col cols="6" class="text-center">Current Balance</v-col>
                    <v-col cols="6" class="text-right"
                      ><v-icon left>mdi-account-circle</v-icon>
                      <span class="primary--text px-2">{{ userName }}</span></v-col
                    >
                  </v-row>
                </v-card-title>
                <v-card-text class="text-h4 text-right">${{ financeStore.balance }}</v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>

        <v-col cols="12">
          <v-container>
            <v-row dense>
              <v-col cols="4" v-for="record in financeStore.transactions" :key="record.id">
                <v-card
                  class="mb-2"
                  :color="
                    record.type === 'deposit' || record.type === 'transfer-in'
                      ? 'light-green-lighten-5'
                      : 'red-lighten-5'
                  "
                >
                  <v-card-title>
                    <v-row>
                      <v-col cols="6" class="text-left">{{ record.type }}</v-col>
                      <v-col cols="6" class="text-right"></v-col>
                    </v-row>
                  </v-card-title>
                  <v-card-text>
                    <v-row>
                      <v-col cols="6" class="text-left"> Amount: ${{ record.amount }} </v-col>
                      <v-col cols="6" class="text-right">
                        Date: {{ new Date(record.timestamp.seconds * 1000).toLocaleDateString() }}
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
          <p v-if="!financeStore.transactions.length">No transactions yet.</p>
        </v-col>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { useFinanceStore } from '@/stores/finance'
import { getAuth } from 'firebase/auth'
import app from '@/firebase'

export default defineComponent({
  name: 'BalanceView',
  setup() {
    const financeStore = useFinanceStore()
    const auth = getAuth(app)
    const userName = ref('Guest')

    onMounted(async () => {
      if (auth.currentUser) {
        userName.value = auth.currentUser.displayName || auth.currentUser.email || 'Unknown User'
      }
      await financeStore.fetchBalance()
      await financeStore.fetchTransactions()
    })

    return {
      financeStore,
      userName,
    }
  },
})
</script>

<style scoped>
.balance {
  padding: 20px;
  text-align: center;
}
</style>
