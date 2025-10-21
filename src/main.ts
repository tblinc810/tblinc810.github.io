import './assets/main.css'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css' // Keep this import

import '@fontsource/roboto/100.css'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import '@fontsource/roboto/900.css'

/* optional italic styles */
import '@fontsource/roboto/100-italic.css'
import '@fontsource/roboto/300-italic.css'
import '@fontsource/roboto/400-italic.css'
import '@fontsource/roboto/500-italic.css'
import '@fontsource/roboto/700-italic.css'
import '@fontsource/roboto/900-italic.css'

import 'unfonts.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia' // Keep this import

import App from './App.vue'
import router from './router' // Keep this import

import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#1867C0',
          secondary: '#5CBBF6',
        },
      },
    },
    defaultTheme: 'light',
  },
})

const app = createApp(App) // Re-declare app here
app.use(createPinia()) // Keep this use
app.use(router) // Keep this use
app.use(vuetify)

app.mount('#app')
