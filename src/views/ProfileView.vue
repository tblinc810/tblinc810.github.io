<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12">
        <v-card>
          <v-card-title class="headline">User Profile</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-form>
                  <v-text-field v-model="email" label="Email" type="email" readonly></v-text-field>
                  <v-text-field v-model="displayName" label="Display Name"></v-text-field>
                  <v-text-field v-model="homeLocation" label="Home Location"></v-text-field>
                  <v-text-field v-model="country" label="Country"></v-text-field>
                </v-form>
              </v-col>
              <v-col cols="12" md="6">
                <v-row>
                  <v-col cols="12">
                    <v-card class="mb-4" variant="outlined">
                      <v-card-title class="text-subtitle-1">Current Balance</v-card-title>
                      <v-card-text class="text-h6"
                        >${{ financeStore.balance.toFixed(2) }}</v-card-text
                      >
                    </v-card>
                  </v-col>
                </v-row>
                <v-card-title class="text-h6">Billing Address</v-card-title>
                <v-form>
                  <v-text-field v-model="billingAddressLine1" label="Address Line 1"></v-text-field>
                  <v-text-field v-model="billingCity" label="City"></v-text-field>
                  <v-text-field v-model="billingState" label="State/Province"></v-text-field>
                  <v-text-field v-model="billingZipCode" label="Zip/Postal Code"></v-text-field>
                </v-form>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-btn @click="updateProfile" color="primary" class="mr-2">Update Profile</v-btn>
                <v-btn @click="deleteAccount" color="error">Delete Account</v-btn>
              </v-col>
            </v-row>
            <v-alert v-if="error" type="error" dense class="mt-3">{{ error }}</v-alert>
            <v-alert v-if="success" type="success" dense class="mt-3">{{ success }}</v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue' // Added computed
import {
  getAuth,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  deleteUser,
} from 'firebase/auth'
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
} from 'firebase/firestore' // Added deleteDoc, collection, getDocs, query
import app from '@/firebase'
import { useRouter } from 'vue-router' // Import useRouter
import { useFinanceStore } from '@/stores/finance' // Import finance store

const email = ref<string | null>(null)
const displayName = ref<string | null>(null)
const homeLocation = ref<string | null>(null) // New ref
const country = ref<string | null>(null) // New ref
const billingAddressLine1 = ref<string | null>(null) // New ref
const billingCity = ref<string | null>(null) // New ref
const billingState = ref<string | null>(null) // New ref
const billingZipCode = ref<string | null>(null) // New ref
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const auth = getAuth(app)
const db = getFirestore(app) // Initialize Firestore
const router = useRouter() // Initialize useRouter
const financeStore = useFinanceStore()

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      email.value = user.email
      displayName.value = user.displayName

      const userDocRef = doc(db, 'users', user.uid)
      const userDocSnap = await getDoc(userDocRef)
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data()
        homeLocation.value = userData.homeLocation || null
        country.value = userData.country || null
        billingAddressLine1.value = userData.billingAddressLine1 || null
        billingCity.value = userData.billingCity || null
        billingState.value = userData.billingState || null
        billingZipCode.value = userData.billingZipCode || null
      }
      await financeStore.fetchBalance()
    }
  })
})

const updateProfile = async () => {
  error.value = null
  success.value = null
  const user = auth.currentUser
  if (user) {
    try {
      await firebaseUpdateProfile(user, {
        displayName: displayName.value,
      })

      // Update additional user data in Firestore
      const userDocRef = doc(db, 'users', user.uid)
      await updateDoc(userDocRef, {
        homeLocation: homeLocation.value,
        country: country.value,
        billingAddressLine1: billingAddressLine1.value,
        billingCity: billingCity.value,
        billingState: billingState.value,
        billingZipCode: billingZipCode.value,
      })

      success.value = 'Profile updated successfully!'
    } catch (err: any) {
      error.value = err.message
    }
  }
}

const deleteAccount = async () => {
  if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    return
  }

  error.value = null
  success.value = null
  const user = auth.currentUser

  if (user) {
    try {
      // Delete user's transactions subcollection
      const transactionsRef = collection(db, 'users', user.uid, 'transactions')
      const q = query(transactionsRef)
      const querySnapshot = await getDocs(q)
      const deletePromises: Promise<void>[] = []
      querySnapshot.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref))
      })
      await Promise.all(deletePromises)

      // Delete user document from Firestore
      await deleteDoc(doc(db, 'users', user.uid))

      // Delete user from Firebase Authentication
      await deleteUser(user)

      success.value = 'Account deleted successfully!'
      router.push('/login') // Redirect to login page
    } catch (err: any) {
      console.error('Error deleting account:', err)
      error.value = err.message
      // Handle re-authentication requirement for recent login
      if (err.code === 'auth/requires-recent-login') {
        error.value = 'Please log in again to delete your account.'
        // You might want to redirect to a re-authentication flow here
      }
    }
  }
}
</script>
