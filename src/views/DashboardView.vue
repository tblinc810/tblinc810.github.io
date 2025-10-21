<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12">
        <v-card>
          <v-card-title class="headline">Dashboard</v-card-title>
          <v-card-text>
            <p>Welcome to your dashboard!</p>
            <p>User: {{ userEmail }}</p>

            <BalanceComponent />

            <v-row>
              <v-col cols="12" md="6">
                <DepositComponent />
              </v-col>
              <v-col cols="12" md="6">
                <WithdrawComponent />
              </v-col>
              <v-col cols="12" md="6">
                <TransferComponent />
              </v-col>
            </v-row>

            <TransactionHistory />

            <v-btn @click="logout" color="error" class="mt-4">Logout</v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { useRouter } from 'vue-router'
import app from '@/firebase'
import BalanceComponent from '@/components/BalanceComponent.vue'
import DepositComponent from '@/components/DepositComponent.vue'
import WithdrawComponent from '@/components/WithdrawComponent.vue'
import TransferComponent from '@/components/TransferComponent.vue'
import TransactionHistory from '@/components/TransactionHistory.vue'

const userEmail = ref<string | null>(null)
const router = useRouter()
const auth = getAuth(app)

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      userEmail.value = user.email
    } else {
      router.push('/login')
    }
  })
})

const logout = async () => {
  try {
    await signOut(auth)
    router.push('/login')
  } catch (error) {
    console.error('Error logging out:', error)
  }
}
</script>
