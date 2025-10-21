<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app right>
      <v-list dense>
        <v-list-item to="/" v-if="!isAuthenticated">
          <v-list-item-icon>
            <v-icon>mdi-home</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Home</v-list-item-title>
        </v-list-item>
        <v-list-item to="/dashboard" v-if="isAuthenticated">
          <v-list-item-icon>
            <v-icon>mdi-view-dashboard</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Dashboard</v-list-item-title>
        </v-list-item>
        <v-list-item to="/profile" v-if="isAuthenticated">
          <v-list-item-icon>
            <v-icon>mdi-account</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Profile</v-list-item-title>
        </v-list-item>
        <v-list-item @click="logout" v-if="isAuthenticated">
          <v-list-item-icon>
            <v-icon>mdi-logout</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-chip class="mr-4" color="white" text-color="black" v-if="isAuthenticated" rounded
        >Balance: ${{ financeStore.balance.toFixed(2) }}</v-chip
      >
      <v-spacer></v-spacer>
      <!-- Keeping some links in the app bar for demonstration, can be removed if preferred -->
      <v-btn text to="/" v-if="!isAuthenticated"> <v-icon left>mdi-home</v-icon>Home </v-btn>
      <v-btn text to="/login" v-if="!isAuthenticated">Login</v-btn>
      <v-btn text to="/register" v-if="!isAuthenticated">Register</v-btn>
      <v-btn text to="/dashboard" v-if="isAuthenticated">Dashboard</v-btn>
      <v-btn text to="/balance" v-if="isAuthenticated" rounded>Balance</v-btn>
      <v-btn text to="/profile" v-if="isAuthenticated">Profile</v-btn>
      <v-btn text @click="logout" v-if="isAuthenticated">Logout</v-btn>
    </v-app-bar>

    <v-main>
      <RouterView />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import app from '@/firebase'
import { useRouter } from 'vue-router'
import { useFinanceStore } from '@/stores/finance'

const isAuthenticated = ref(false)
const auth = getAuth(app)
const router = useRouter()
const drawer = ref(false) // Added for navigation drawer
const financeStore = useFinanceStore()

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    isAuthenticated.value = !!user
    if (user) {
      await financeStore.fetchBalance()
    }
    // Auto-login: if user is authenticated and not on dashboard/login/register, redirect to dashboard
    if (
      user &&
      router.currentRoute.value.path !== '/dashboard' &&
      router.currentRoute.value.path !== '/login' &&
      router.currentRoute.value.path !== '/register'
    ) {
      router.push('/dashboard')
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

<style>
/* You can add global styles here if needed */
</style>
