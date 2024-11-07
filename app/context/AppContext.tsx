"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, orderBy, query, Timestamp, where } from 'firebase/firestore'

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
    [key: string]: boolean
  }
  baselineAssessment: {
    bloodPressure: string
    bloodSugar: string
    weight: string
    sleepQuality: string
    energyLevel: string
  }
  dailyCalorieGoal?: number
  macroTargets?: {
    protein: number
    carbs: number
    fat: number
  }
}

type FoodEntry = {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  servingSize: string
  timestamp: Date
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  date: string // YYYY-MM-DD format for easier querying
}

type Meal = {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  servingSize: string
  timeOfDay: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  isCompleted: boolean
}

type MealPlan = {
  id: string
  date: string
  meals: Meal[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  notes?: string
  workoutId?: string
}

type AppContextType = {
  user: User | null
  userProfile: UserProfile | null
  updateUserProfile: (profile: UserProfile) => Promise<void>
  workoutPlan: WorkoutPlan | null
  updateWorkoutPlan: (plan: Partial<WorkoutPlan>) => Promise<void>
  deleteWorkoutPlan: () => Promise<void>
  saveWorkoutPlan: (plan: WorkoutPlan) => Promise<void>
  foodEntries: FoodEntry[]
  addFoodEntry: (entry: Omit<FoodEntry, 'id' | 'timestamp'>) => Promise<void>
  updateFoodEntry: (id: string, entry: Partial<FoodEntry>) => Promise<void>
  deleteFoodEntry: (id: string) => Promise<void>
  getFoodEntriesByDate: (date: string) => Promise<FoodEntry[]>
  getWorkoutAndMealPlan: (date: string) => Promise<{
    workout: WorkoutPlan | null,
    mealPlan: MealPlan | null
  }>
  createMealPlan: (plan: Omit<MealPlan, 'id'>) => Promise<void>
  addMealToPlan: (date: string, meal: Omit<Meal, 'id'>) => Promise<void>
  getMealPlan: (date: string) => Promise<MealPlan | null>
  updateMealPlan: (date: string, updates: Partial<MealPlan>) => Promise<void>
  getMealPlanWithWorkout: (date: string) => Promise<{
    mealPlan: MealPlan | null,
    workout: WorkoutPlan | null
  }>
  updateMealCompletion: (date: string, mealId: string, isCompleted: boolean) => Promise<void>
  calculateNutritionTargets: (workoutPlan: WorkoutPlan | null) => {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  getSavedFoods: () => Promise<FoodEntry[]>
  getWorkoutPlan: (date: string) => Promise<WorkoutPlan | null>
  deleteMealFromPlan: (date: string, mealId: string) => Promise<void>
  editMealInPlan: (date: string, mealId: string, updatedMeal: Partial<Meal>) => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null)
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([])

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user)
      if (user) {
        await fetchUserProfile(user.uid)
        await fetchWorkoutPlan(user.uid)
        await fetchFoodEntries(user.uid)
      } else {
        setUserProfile(null)
        setWorkoutPlan(null)
        setFoodEntries([])
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

  const fetchFoodEntries = async (userId: string) => {
    try {
      const entriesRef = collection(db, 'users', userId, 'foodEntries')
      const q = query(entriesRef, orderBy('timestamp', 'desc'))
      const querySnapshot = await getDocs(q)
      
      const entries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      })) as FoodEntry[]
      
      setFoodEntries(entries)
    } catch (error) {
      console.error('Error fetching food entries:', error)
    }
  }

  const addFoodEntry = async (entry: Omit<FoodEntry, 'id' | 'timestamp'>) => {
    if (!user) throw new Error('No user logged in')
    
    try {
      const entriesRef = collection(db, 'users', user.uid, 'foodEntries')
      const newEntry = {
        ...entry,
        timestamp: new Date()
      }
      
      const docRef = await addDoc(entriesRef, {
        ...newEntry,
        timestamp: Timestamp.fromDate(newEntry.timestamp)
      })
      
      const entryWithId = {
        ...newEntry,
        id: docRef.id
      }
      
      setFoodEntries(prev => [entryWithId, ...prev])
    } catch (error) {
      console.error('Error adding food entry:', error)
      throw error
    }
  }

  const updateFoodEntry = async (id: string, updates: Partial<FoodEntry>) => {
    if (!user) throw new Error('No user logged in')
    
    try {
      const entryRef = doc(db, 'users', user.uid, 'foodEntries', id)
      await updateDoc(entryRef, updates)
      
      setFoodEntries(prev => prev.map(entry => 
        entry.id === id ? { ...entry, ...updates } : entry
      ))
    } catch (error) {
      console.error('Error updating food entry:', error)
      throw error
    }
  }

  const deleteFoodEntry = async (id: string) => {
    if (!user) throw new Error('No user logged in')
    
    try {
      const entryRef = doc(db, 'users', user.uid, 'foodEntries', id)
      await deleteDoc(entryRef)
      
      setFoodEntries(prev => prev.filter(entry => entry.id !== id))
    } catch (error) {
      console.error('Error deleting food entry:', error)
      throw error
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

  const getFoodEntriesByDate = async (date: string) => {
    if (!user) throw new Error('No user logged in')
    
    try {
      const entriesRef = collection(db, 'users', user.uid, 'foodEntries')
      const q = query(
        entriesRef,
        where('date', '==', date),
        orderBy('timestamp', 'asc')
      )
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      })) as FoodEntry[]
    } catch (error) {
      console.error('Error fetching food entries:', error)
      throw error
    }
  }

  const getWorkoutAndMealPlan = async (date: string) => {
    if (!user) throw new Error('No user logged in')
    
    try {
      // Get workout plan for the date
      const workoutRef = doc(db, 'workoutPlans', user.uid)
      const workoutDoc = await getDoc(workoutRef)
      const workoutPlan = workoutDoc.data()?.plan || null

      // Get meal plan for the date (we'll need to create this collection)
      const mealPlanRef = doc(db, 'users', user.uid, 'mealPlans', date)
      const mealPlanDoc = await getDoc(mealPlanRef)
      const mealPlan = mealPlanDoc.data() || null

      return { workoutPlan, mealPlan }
    } catch (error) {
      console.error('Error fetching workout and meal plan:', error)
      throw error
    }
  }

  const createMealPlan = async (plan: Omit<MealPlan, 'id'>) => {
    if (!user) throw new Error('No user logged in')
    
    try {
      const mealPlanRef = doc(db, 'users', user.uid, 'mealPlans', plan.date)
      await setDoc(mealPlanRef, {
        ...plan,
        id: plan.date,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error creating meal plan:', error)
      throw error
    }
  }

  const addMealToPlan = async (date: string, meal: Omit<Meal, 'id'>) => {
    if (!user) throw new Error('No user logged in')
    
    try {
      const mealPlanRef = doc(db, 'users', user.uid, 'mealPlans', date)
      const mealPlanDoc = await getDoc(mealPlanRef)
      const mealPlan = mealPlanDoc.data() as MealPlan | undefined

      const newMeal = {
        ...meal,
        id: crypto.randomUUID(),
        isCompleted: false
      }

      if (!mealPlan) {
        // Create new meal plan if it doesn't exist
        await createMealPlan({
          date,
          meals: [newMeal],
          totalCalories: meal.calories || 0,
          totalProtein: meal.protein || 0,
          totalCarbs: meal.carbs || 0,
          totalFat: meal.fat || 0
        })
      } else {
        // Update existing meal plan
        const updatedMeals = [...mealPlan.meals, newMeal]
        await updateMealPlan(date, {
          meals: updatedMeals,
          totalCalories: updatedMeals.reduce((sum, m) => sum + (m.calories || 0), 0),
          totalProtein: updatedMeals.reduce((sum, m) => sum + (m.protein || 0), 0),
          totalCarbs: updatedMeals.reduce((sum, m) => sum + (m.carbs || 0), 0),
          totalFat: updatedMeals.reduce((sum, m) => sum + (m.fat || 0), 0),
          updatedAt: new Date()
        })
      }
    } catch (error) {
      console.error('Error adding meal to plan:', error)
      throw error
    }
  }

  const getMealPlan = async (date: string) => {
    if (!user) throw new Error('No user logged in')
    
    try {
      const mealPlanRef = doc(db, 'users', user.uid, 'mealPlans', date)
      const mealPlanDoc = await getDoc(mealPlanRef)
      return mealPlanDoc.exists() ? mealPlanDoc.data() as MealPlan : null
    } catch (error) {
      console.error('Error fetching meal plan:', error)
      throw error
    }
  }

  const updateMealPlan = async (date: string, updates: Partial<MealPlan>) => {
    if (!user) throw new Error('No user logged in')
    
    try {
      const mealPlanRef = doc(db, 'users', user.uid, 'mealPlans', date)
      await updateDoc(mealPlanRef, updates)
    } catch (error) {
      console.error('Error updating meal plan:', error)
      throw error
    }
  }

  const calculateNutritionTargets = (workoutPlan: WorkoutPlan | null) => {
    if (!userProfile) return { calories: 2000, protein: 150, carbs: 250, fat: 70 }

    const baseCalories = userProfile.dailyCalorieGoal || 2000
    const workoutIntensity = workoutPlan ? 1.2 : 1 // 20% increase on workout days

    return {
      calories: Math.round(baseCalories * workoutIntensity),
      protein: Math.round((baseCalories * 0.3) / 4), // 30% from protein
      carbs: Math.round((baseCalories * 0.45) / 4), // 45% from carbs
      fat: Math.round((baseCalories * 0.25) / 9) // 25% from fat
    }
  }

  const getWorkoutPlan = async (date: string) => {
    if (!user) throw new Error('No user logged in')
    
    try {
      const workoutRef = doc(db, 'users', user.uid, 'workoutPlans', date)
      const workoutDoc = await getDoc(workoutRef)
      return workoutDoc.exists() ? workoutDoc.data() as WorkoutPlan : null
    } catch (error) {
      console.error('Error fetching workout plan:', error)
      throw error
    }
  }

  const getMealPlanWithWorkout = async (date: string) => {
    if (!user) throw new Error('No user logged in')
    
    try {
      const [mealPlan, workout] = await Promise.all([
        getMealPlan(date),
        getWorkoutPlan(date)
      ])

      if (!mealPlan && workout) {
        // Create a new meal plan with targets based on workout
        const targets = calculateNutritionTargets(workout)
        const newMealPlan: MealPlan = {
          id: date,
          date,
          meals: [],
          workoutId: workout.id,
          ...targets,
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0
        }
        await createMealPlan(newMealPlan)
        return { mealPlan: newMealPlan, workout }
      }

      return { mealPlan, workout }
    } catch (error) {
      console.error('Error fetching meal plan with workout:', error)
      throw error
    }
  }

  const updateMealCompletion = async (date: string, mealId: string, isCompleted: boolean) => {
    if (!user) throw new Error('No user logged in')
    
    try {
      const mealPlan = await getMealPlan(date)
      if (!mealPlan) throw new Error('Meal plan not found')

      const updatedMeals = mealPlan.meals.map(meal => 
        meal.id === mealId ? { ...meal, isCompleted } : meal
      )

      await updateMealPlan(date, { meals: updatedMeals })
    } catch (error) {
      console.error('Error updating meal completion:', error)
      throw error
    }
  }

  const getSavedFoods = async () => {
    if (!user) throw new Error('No user logged in')
    
    try {
      const foodsRef = collection(db, 'users', user.uid, 'foodEntries')
      const q = query(foodsRef, orderBy('timestamp', 'desc'))
      const querySnapshot = await getDocs(q)
      
      // Create a Map to store unique foods by name
      const uniqueFoods = new Map()
      
      querySnapshot.docs.forEach(doc => {
        const food = doc.data()
        // Only add if we haven't seen this food name before
        if (!uniqueFoods.has(food.name)) {
          uniqueFoods.set(food.name, {
            id: doc.id,
            ...food,
            timestamp: food.timestamp.toDate()
          })
        }
      })
      
      return Array.from(uniqueFoods.values()) as FoodEntry[]
    } catch (error) {
      console.error('Error fetching saved foods:', error)
      throw error
    }
  }

  const deleteMealFromPlan = async (date: string, mealId: string) => {
    if (!user) throw new Error('No user logged in')
    
    try {
      const mealPlan = await getMealPlan(date)
      if (!mealPlan) throw new Error('No meal plan found')

      const updatedMeals = mealPlan.meals.filter(meal => meal.id !== mealId)
      
      // Recalculate totals
      const totals = updatedMeals.reduce((acc, meal) => ({
        totalCalories: acc.totalCalories + (meal.calories || 0),
        totalProtein: acc.totalProtein + (meal.protein || 0),
        totalCarbs: acc.totalCarbs + (meal.carbs || 0),
        totalFat: acc.totalFat + (meal.fat || 0)
      }), {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0
      })

      await updateMealPlan(date, {
        meals: updatedMeals,
        ...totals
      })
    } catch (error) {
      console.error('Error deleting meal:', error)
      throw error
    }
  }

  const editMealInPlan = async (date: string, mealId: string, updatedMeal: Partial<Meal>) => {
    if (!user) throw new Error('No user logged in')
    
    try {
      const mealPlan = await getMealPlan(date)
      if (!mealPlan) throw new Error('No meal plan found')

      const updatedMeals = mealPlan.meals.map(meal => 
        meal.id === mealId ? { ...meal, ...updatedMeal } : meal
      )
      
      // Recalculate totals
      await updateMealPlan(date, {
        meals: updatedMeals,
        totalCalories: updatedMeals.reduce((sum, m) => sum + (m.calories || 0), 0),
        totalProtein: updatedMeals.reduce((sum, m) => sum + (m.protein || 0), 0),
        totalCarbs: updatedMeals.reduce((sum, m) => sum + (m.carbs || 0), 0),
        totalFat: updatedMeals.reduce((sum, m) => sum + (m.fat || 0), 0),
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error editing meal:', error)
      throw error
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
      saveWorkoutPlan,
      foodEntries,
      addFoodEntry,
      updateFoodEntry,
      deleteFoodEntry,
      getFoodEntriesByDate,
      getWorkoutAndMealPlan,
      createMealPlan,
      addMealToPlan,
      getMealPlan,
      updateMealPlan,
      getMealPlanWithWorkout,
      updateMealCompletion,
      calculateNutritionTargets,
      getSavedFoods,
      getWorkoutPlan,
      deleteMealFromPlan,
      editMealInPlan,
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
