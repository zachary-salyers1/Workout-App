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
    [date: string]: {
      exercises: Array<{
        name: string
        sets: number
        reps: number
        rest: number // in seconds
        weight?: number // in pounds
      }>
    }
  }
  startDate: string // Add this field
}

type MedicationDetail = {
  name: string
  dosage: string
  frequency: string
}

type UserProfile = {
  name: string
  email: string
  healthConditions: string[]
  currentMedications: string[]
  medicationDetails: MedicationDetail[]
  sleepPattern: string
  stressLevel: string
  dietaryHabits: {
    mealsPerDay: number
    snacking: boolean
    waterIntake: number
    regularMealtimes: boolean
  }
  healthGoals: {
    medicationReduction: boolean
    weightManagement: boolean
    sleepImprovement: boolean
    stressReduction: boolean
    bloodPressureControl: boolean
    bloodSugarControl: boolean
  }
  baselineAssessment: {
    bloodPressure: string
    bloodSugar: string
    weight: string
    sleepQuality: string
    energyLevel: string
  }
}

type AppContextType = {
  user: User | null
  userProfile: UserProfile | null
  updateUserProfile: (profile: UserProfile) => Promise<void>
  workoutPlan: WorkoutPlan | null
  updateWorkoutPlan: (plan: Partial<WorkoutPlan>) => Promise<void>
  deleteWorkoutPlan: () => Promise<void>
  saveWorkoutPlan: (plan: WorkoutPlan) => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user)
      if (user) {
        await fetchUserProfile(user.uid)
        await fetchWorkoutPlan(user.uid)
      } else {
        setUserProfile(null)
        setWorkoutPlan(null)
      }
    })

    return () => unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    const userDocRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userDocRef)
    if (userDoc.exists()) {
      setUserProfile(userDoc.data() as UserProfile)
    }
  }

  const fetchWorkoutPlan = async (userId: string) => {
    const planDocRef = doc(db, 'workoutPlans', userId)
    const planDoc = await getDoc(planDocRef)
    if (planDoc.exists()) {
      setWorkoutPlan(planDoc.data().plan as WorkoutPlan)
    }
  }

  const updateUserProfile = async (profile: UserProfile) => {
    if (user) {
      await setDoc(doc(db, 'users', user.uid), profile)
      setUserProfile(profile)
    }
  }

  const deleteWorkoutPlan = async () => {
    if (user) {
      try {
        await setDoc(doc(db, 'workoutPlans', user.uid), { plan: null, deletedAt: new Date() })
        setWorkoutPlan(null)
      } catch (error) {
        console.error("Error deleting workout plan:", error)
        throw error
      }
    } else {
      throw new Error("No user logged in")
    }
  }

  const updateWorkoutPlan = async (planUpdates: Partial<WorkoutPlan>) => {
    if (user && workoutPlan) {
      const updatedPlan = { ...workoutPlan, ...planUpdates }
      await saveWorkoutPlan(updatedPlan)
      setWorkoutPlan(updatedPlan)
    } else {
      throw new Error("No user logged in or no existing workout plan")
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
    <AppContext.Provider value={{ 
      user, 
      userProfile, 
      updateUserProfile, 
      workoutPlan, 
      updateWorkoutPlan, 
      deleteWorkoutPlan,
      saveWorkoutPlan
    }}>
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
