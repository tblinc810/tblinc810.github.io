<script setup lang="ts">
import { ref, type Ref } from 'vue' // Added Ref import

const email: Ref<string> = ref('')
const password: Ref<string> = ref('')
const confirmPassword: Ref<string> = ref('')
const mobileNumber: Ref<string> = ref('') // Added for mobile number
const showPassword: Ref<boolean> = ref(false) // Added for show/hide password

const emit = defineEmits(['submit'])

const submitForm = () => {
  emit('submit', {
    email: email.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
    mobileNumber: mobileNumber.value, // Added mobile number to emit
  })
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
      label="Mobile Number"
      name="mobileNumber"
      prepend-icon="mdi-phone"
      type="tel"
      v-model="mobileNumber"
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

    <v-text-field
      label="Confirm Password"
      name="confirmPassword"
      prepend-icon="mdi-lock"
      :type="showPassword ? 'text' : 'password'"
      v-model="confirmPassword"
      class="mb-4"
      :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
      @click:append-inner="showPassword = !showPassword"
    ></v-text-field>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="submitForm">Register</v-btn>
    </v-card-actions>
  </v-form>
</template>

<style scoped>
/* Component specific styles can go here */
</style>
