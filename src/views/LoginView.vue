<template>
  <v-container fluid fill-height>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="8">
        <v-card class="elevation-12" rounded="lg">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Login</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <LoginForm @submit="handleLogin" @google-login-success="handleGoogleLoginSuccess" />
            <div class="text-center mt-4">
              <v-btn text to="/register">Don't have an account? Register</v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import LoginForm from '@/components/LoginForm.vue'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import app from '@/firebase'
import { useRouter } from 'vue-router'

const auth = getAuth(app)
const router = useRouter()

const handleLogin = async ({ email, password }: any) => {
  try {
    await signInWithEmailAndPassword(auth, email, password)
    router.push('/dashboard')
  } catch (error: any) {
    console.error('Error logging in:', error.message)
    alert(error.message) // Basic error display
  }
}

// New method to handle successful Google login
const handleGoogleLoginSuccess = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
.v-container {
  min-height: 100vh;
}
</style>
