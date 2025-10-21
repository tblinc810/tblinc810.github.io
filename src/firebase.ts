// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyARoZXFPeJXS5QweOApF0sNp5k8owYHj6U',
  authDomain: 'tblinc10.firebaseapp.com',
  databaseURL: 'https://tblinc10-default-rtdb.firebaseio.com',
  projectId: 'tblinc10',
  storageBucket: 'tblinc10.firebasestorage.app',
  messagingSenderId: '679993010417',
  appId: '1:679993010417:web:8a15c6fbb85e70dfbc2150',
  measurementId: 'G-3TBPVKF8EQ',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)

export default app
