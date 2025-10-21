<script setup lang="ts">
import { ref, type Ref } from 'vue' // Added Ref import
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth' // Added imports
import app from '@/firebase' // Import firebase app

const email: Ref<string> = ref('')
const password: Ref<string> = ref('')
const showPassword: Ref<boolean> = ref(false) // Added for show/hide password

const emit = defineEmits(['submit', 'google-login-success']) // Added 'google-login-success' event

const submitForm = () => {
  emit('submit', { email: email.value, password: password.value })
}

// Google Sign-In
const auth = getAuth(app) // Get auth instance
const provider = new GoogleAuthProvider() // Initialize Google Auth Provider

const signInWithGoogle = async () => {
  try {
    await signInWithPopup(auth, provider)
    // User signed in successfully with Google
    console.log('Signed in with Google successfully!')
    emit('google-login-success') // Emit a custom event for successful Google login
  } catch (error: any) {
    console.error('Error signing in with Google:', error.message)
    alert(error.message)
  }
}
</script>

<template>
  <v-form>
    <v-text-field
      label="Email"
      name="email"
      prepend-icon="mdi-account"
      type="text"
      v-model="email"
      class="mb-4"
    ></v-text-field>

    <v-text-field
      label="Password"
      name="password"
      prepend-icon="mdi-lock"
      :type="showPassword ? 'text' : 'password'"
      v-model="password"
      class="mb-4"
      :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
      @click:append-inner="showPassword = !showPassword"
    ></v-text-field>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="submitForm">Login</v-btn>
      <v-btn color="red" icon="mdi-google" @click="signInWithGoogle" class="ml-2"></v-btn>
    </v-card-actions>
  </v-form>
</template>

<style scoped>
.v-form {
  padding: 16px; /* Add some internal padding */
}
</style>
