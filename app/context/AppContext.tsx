"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

type AppContextType = {
  user: User | null
  userProfile: any
  updateUserProfile: (profile: any) => Promise<void>
  workoutPlan: any[]
  updateWorkoutPlan: (plan: any[]) => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState({})
  const [workoutPlan, setWorkoutPlan] = useState([])

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user)
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          setUserProfile(userDoc.data())
        }
      } else {
        setUserProfile({})
      }
    })

    return () => unsubscribe()
  }, [])

  const updateUserProfile = async (profile: any) => {
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), profile, { merge: true })
        setUserProfile(profile)
        console.log("Profile updated successfully")
      } catch (error) {
        console.error("Error updating profile:", error)
        throw error // Re-throw the error so it can be caught in the component
      }
    } else {
      console.error("No user logged in")
      throw new Error("No user logged in")
    }
  }

  const updateWorkoutPlan = async (plan: any[]) => {
    if (user) {
      await setDoc(doc(db, 'workoutPlans', user.uid), { plan }, { merge: true })
      setWorkoutPlan(plan)
    }
  }

  return (
    <AppContext.Provider value={{ user, userProfile, updateUserProfile, workoutPlan, updateWorkoutPlan }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}
