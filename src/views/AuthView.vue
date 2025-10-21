<template>
  <div class="auth-container">
    <h2>Login or Register with Google</h2>
    <button @click="signInWithGoogle">Sign in with Google</button>
    <p v-if="error" class="error-message">{{ error }}</p>
    <div v-if="user">
      <p>Welcome, {{ user.displayName }}!</p>
      <button @click="signOut">Sign Out</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import app from '../firebase' // Assuming firebase.ts exports the initialized app

export default defineComponent({
  name: 'AuthView',
  setup() {
    const auth = getAuth(app)
    const user = ref<User | null>(null)
    const error = ref<string | null>(null)

    // Check if user is already logged in
    auth.onAuthStateChanged((currentUser) => {
      user.value = currentUser
    })

    const signInWithGoogle = async () => {
      error.value = null
      const provider = new GoogleAuthProvider()
      try {
        const result = await signInWithPopup(auth, provider)
        user.value = result.user
        // Optionally, redirect or emit an event
        console.log('Successfully signed in:', user.value)
      } catch (e: any) {
        error.value = e.message
        console.error('Error during Google sign-in:', e)
      }
    }

    const signOut = async () => {
      error.value = null
      try {
        await firebaseSignOut(auth)
        user.value = null
        console.log('Successfully signed out.')
      } catch (e: any) {
        error.value = e.message
        console.error('Error during sign-out:', e)
      }
    }

    return {
      user,
      error,
      signInWithGoogle,
      signOut,
    }
  },
})
</script>

<style scoped>
.auth-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  max-width: 400px;
  margin: 50px auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #333;
  margin-bottom: 20px;
}

button {
  background-color: #4285f4;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
}

button:hover {
  background-color: #357ae8;
}

.error-message {
  color: red;
  margin-top: 10px;
}

div[v-if='user'] {
  margin-top: 20px;
  text-align: center;
}
</style>
