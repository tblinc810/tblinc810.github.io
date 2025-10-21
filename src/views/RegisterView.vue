<template>
  <v-container fluid fill-height>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="8">
        <v-card class="elevation-12" rounded="lg">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Register</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <RegisterForm @submit="handleRegister" />
            <div class="text-center mt-4">
              <v-btn text to="/login">Already have an account? Login</v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import RegisterForm from '@/components/RegisterForm.vue'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, setDoc } from 'firebase/firestore' // Added Firestore imports
import app from '@/firebase'
import { useRouter } from 'vue-router'

const auth = getAuth(app)
const db = getFirestore(app) // Initialize Firestore
const router = useRouter()

const handleRegister = async ({ email, password, confirmPassword, mobileNumber }: any) => {
  if (password !== confirmPassword) {
    alert('Passwords do not match!')
    return
  }
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Store user data in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      mobileNumber: mobileNumber, // Store mobile number
      balance: 0, // Initialize balance
    })

    router.push('/dashboard')
  } catch (error: any) {
    console.error('Error registering:', error.message)
    alert(error.message) // Basic error display
  }
}
</script>

<style scoped>
.v-container {
  min-height: 100vh;
}
</style>
