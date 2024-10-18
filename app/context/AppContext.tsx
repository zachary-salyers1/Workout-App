"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

type WorkoutPlan = {
  informationSummary: string
  weeklyWorkoutSchedule: {
    [key: string]: string[]
  }
  exerciseDescriptions: {
    [key: string]: string
  }
  safetyAdvice: string[]
  progressTrackingSuggestions: string[]
  userWeight: number
  detailedWorkoutPlan?: {
    [day: string]: {
      exercises: Array<{
        name: string
        sets: number
        reps: number
        rest: number // in seconds
        weight?: number // This is now in pounds
      }>
    }
  }
}

type AppContextType = {
  user: User | null
  userProfile: any
  updateUserProfile: (profile: any) => Promise<void>
  workoutPlan: WorkoutPlan | null
  updateWorkoutPlan: (plan: WorkoutPlan) => Promise<void>
  saveWorkoutPlan: (plan: WorkoutPlan) => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState({})
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null)

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

  const updateWorkoutPlan = async (plan: WorkoutPlan) => {
    if (user) {
      await setDoc(doc(db, 'workoutPlans', user.uid), { plan }, { merge: true })
      setWorkoutPlan(plan)
    }
  }

  const saveWorkoutPlan = async (plan: WorkoutPlan) => {
    if (user) {
      try {
        await setDoc(doc(db, 'workoutPlans', user.uid), { plan, createdAt: new Date() }, { merge: true })
        setWorkoutPlan(plan)
      } catch (error) {
        console.error("Error saving workout plan:", error)
        throw error
      }
    } else {
      throw new Error("No user logged in")
    }
  }

  return (
    <AppContext.Provider value={{ user, userProfile, updateUserProfile, workoutPlan, updateWorkoutPlan, saveWorkoutPlan }}>
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
