"use client"

import { useState, useEffect } from "react"
import { Bell, Calendar, ChevronRight, Dumbbell, Trophy, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppContext } from "@/app/context/AppContext"
import { CommunityLeaderboardsComponent } from "./community-leaderboards"
import { ProgressTrackingComponent } from "./progress-tracking"
import { WorkoutPlanGeneratorComponent } from "./workout-plan-generator"
import UserProfileSetup from "@/hooks/user-profile-setup"
import { Auth } from "./auth"
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { WorkoutCalendar } from './workout-calendar'
import { ThemeToggle } from "./theme-toggle"
import { NutritionTrackingComponent } from "./nutrition-tracking"
import { MealPlanSummaryCard } from "./meal-plan-summary"

export function DashboardComponent() {
  const { user, userProfile, workoutPlan, getWorkoutAndMealPlan } = useAppContext()
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [dailyPlanData, setDailyPlanData] = useState<{
    workout: WorkoutPlan | null,
    mealPlan: MealPlan | null
  }>({ workout: null, mealPlan: null })

  useEffect(() => {
    const fetchDailyPlan = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]
        const plan = await getWorkoutAndMealPlan(today)
        console.log('Fetched meal plan:', plan)
        setDailyPlanData({
          workout: plan.workout,
          mealPlan: {
            ...plan.mealPlan,
            meals: plan.mealPlan?.meals || [],
            targetCalories: plan.mealPlan?.targetCalories || 2000,
            totalCalories: plan.mealPlan?.totalCalories || 0,
            totalProtein: plan.mealPlan?.totalProtein || 0,
            totalCarbs: plan.mealPlan?.totalCarbs || 0,
            totalFat: plan.mealPlan?.totalFat || 0
          }
        })
      } catch (error) {
        console.error('Error fetching daily plan:', error)
      }
    }
    fetchDailyPlan()
  }, [getWorkoutAndMealPlan])

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Welcome to Workout App</h1>
        <Auth />
      </div>
    )
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      // Clear the workout plan from local state
      workoutPlan(null)
      // Redirect to home page or login page
      router.push('/')
    } catch (error) {
      console.error('Failed to sign out', error)
    }
  }

  const renderProfileSummary = () => (
    <Card>
      <CardHeader>
        <CardTitle>Profile Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div><strong>Name:</strong> {userProfile?.name || "Not set"}</div>
          <div><strong>Fitness Goal:</strong> {userProfile?.fitnessGoal || "Not set"}</div>
          <div><strong>Fitness Level:</strong> {userProfile?.fitnessLevel || "Not set"}</div>
          <div><strong>Workouts per Week:</strong> {userProfile?.workoutsPerWeek || "Not set"}</div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={() => setActiveTab("profile")}>View Full Profile</Button>
      </CardFooter>
    </Card>
  )

  const renderTodaysWorkout = () => {
    if (!workoutPlan || !workoutPlan.detailedWorkoutPlan) return null;

    const today = new Date().toLocaleString('en-us', {weekday: 'long'});
    const todaysWorkout = workoutPlan.detailedWorkoutPlan[today];

    if (!todaysWorkout) return <p>No workout scheduled for today.</p>;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Today's Workout</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {todaysWorkout.exercises.map((exercise, index) => (
              <li key={index} className="flex items-center justify-between">
                <span>{exercise.name}</span>
                <span>{exercise.sets} sets x {exercise.reps} reps</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    // You might want to add additional logic here, such as fetching workout details for the selected date
  }

  const renderMealPlanSummary = () => {
    if (!dailyPlanData.mealPlan) return null

    return (
      <MealPlanSummaryCard 
        mealPlan={dailyPlanData.mealPlan}
        onViewFullPlan={() => setActiveTab("nutrition")}
      />
    )
  }

  const renderOverview = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {renderProfileSummary()}
      {renderTodaysWorkout()}
      {dailyPlanData.mealPlan && (
        <MealPlanSummaryCard 
          mealPlan={dailyPlanData.mealPlan}
          onViewFullPlan={() => setActiveTab("nutrition")}
        />
      )}
      <WorkoutCalendar onDateSelect={handleDateSelect} />
    </div>
  )

  return (
    <div className="container mx-auto p-4 space-y-4">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {userProfile?.name || "User"}!</h1>
          {userProfile?.fitnessGoal && (
            <p className="text-muted-foreground">Goal: {userProfile.fitnessGoal}</p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
          <TabsTrigger value="workoutPlan">Workout Plan</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">{renderOverview()}</TabsContent>
        <TabsContent value="progress">
          <ProgressTrackingComponent selectedDate={selectedDate} onDateSelect={handleDateSelect} />
        </TabsContent>
        <TabsContent value="workoutPlan"><WorkoutPlanGeneratorComponent /></TabsContent>
        <TabsContent value="nutrition"><NutritionTrackingComponent /></TabsContent>
        <TabsContent value="community"><CommunityLeaderboardsComponent /></TabsContent>
        <TabsContent value="profile"><UserProfileSetup /></TabsContent>
      </Tabs>
    </div>
  )
}
