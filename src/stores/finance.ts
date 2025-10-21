import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  where,
} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import app from '@/firebase'

interface Transaction {
  id?: string
  amount: number
  type: 'deposit' | 'withdraw' | 'transfer-out' | 'transfer-in'
  timestamp: any // Use firebase.firestore.Timestamp or Date
  recipientMobile?: string // Optional: for transfer transactions
}

export const useFinanceStore = defineStore('finance', () => {
  const balance = ref(0)
  const transactions = ref<Transaction[]>([]) // Define transactions as a ref
  const db = getFirestore(app)
  const auth = getAuth(app)

  const fetchBalance = async () => {
    const user = auth.currentUser
    if (user) {
      const docRef = doc(db, 'users', user.uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        balance.value = docSnap.data().balance || 0
      } else {
        // Initialize balance if user document doesn't exist
        await setDoc(docRef, { balance: 0 })
        balance.value = 0
      }
    }
  }

  const deposit = async (amount: number) => {
    const user = auth.currentUser
    if (user && amount > 0) {
      const userDocRef = doc(db, 'users', user.uid)
      await updateDoc(userDocRef, { balance: balance.value + amount })
      balance.value += amount

      // Record transaction
      await addDoc(collection(userDocRef, 'transactions'), {
        amount: amount,
        type: 'deposit',
        timestamp: new Date(),
      })
      console.log(`Deposited ${amount}. New balance: ${balance.value}`)
    }
  }

  const withdraw = async (amount: number) => {
    const user = auth.currentUser
    if (user && amount > 0 && balance.value >= amount) {
      const userDocRef = doc(db, 'users', user.uid)
      await updateDoc(userDocRef, { balance: balance.value - amount })
      balance.value -= amount

      // Record transaction
      await addDoc(collection(userDocRef, 'transactions'), {
        amount: amount,
        type: 'withdraw',
        timestamp: new Date(),
      })
      console.log(`Withdrew ${amount}. New balance: ${balance.value}`)
    } else if (user && amount > 0 && balance.value < amount) {
      throw new Error('Insufficient funds')
    }
  }

  const transfer = async (amount: number, recipientMobile: string) => {
    const user = auth.currentUser
    if (!user) throw new Error('User not authenticated')
    if (amount <= 0) throw new Error('Transfer amount must be positive')
    if (balance.value < amount) throw new Error('Insufficient funds for transfer')

    // Find recipient by mobile number
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('mobileNumber', '==', recipientMobile))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      throw new Error('Recipient not found with this mobile number')
    }

    const recipientDoc = querySnapshot.docs[0]

    if (!recipientDoc) {
      throw new Error('Recipient not found with this mobile number')
    }

    const recipientUid = recipientDoc.id
    const recipientBalance = recipientDoc.data().balance || 0

    if (recipientUid === user.uid) {
      throw new Error('Cannot transfer to yourself')
    }

    // Deduct from sender
    const senderDocRef = doc(db, 'users', user.uid)
    await updateDoc(senderDocRef, { balance: balance.value - amount })
    balance.value -= amount

    // Add to recipient
    const recipientDocRef = doc(db, 'users', recipientUid)
    await updateDoc(recipientDocRef, { balance: recipientBalance + amount })

    // Record sender's transaction
    await addDoc(collection(senderDocRef, 'transactions'), {
      amount: amount,
      type: 'transfer-out',
      timestamp: new Date(),
      recipientMobile: recipientMobile,
    })

    // Record recipient's transaction (assuming sender's mobile can be fetched or is not needed for recipient's view)
    // For simplicity, we'll just record the amount and type for the recipient.
    await addDoc(collection(recipientDocRef, 'transactions'), {
      amount: amount,
      type: 'transfer-in',
      timestamp: new Date(),
      // Optionally, add sender's mobile if available and desired for recipient's view
    })

    console.log(`Transferred ${amount} to ${recipientMobile}. New balance: ${balance.value}`)
  }

  const fetchTransactions = async (): Promise<Transaction[]> => {
    const user = auth.currentUser
    if (user) {
      const transactionsColRef = collection(db, 'users', user.uid, 'transactions')
      const q = query(transactionsColRef, orderBy('timestamp', 'desc'), limit(100)) // Fetch last 100 transactions
      const querySnapshot = await getDocs(q)
      transactions.value = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Transaction,
      )
      return transactions.value
    }
    transactions.value = []
    return []
  }

  return {
    balance,
    fetchBalance,
    deposit,
    withdraw,
    transfer,
    transactions,
    fetchTransactions,
  }
})
