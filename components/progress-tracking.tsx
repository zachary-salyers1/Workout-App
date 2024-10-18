"use client"

import { useState, useEffect } from "react"
import { useAppContext } from "@/app/context/AppContext"
import { Calendar, CheckCircle2, Medal, TrendingUp, Trophy, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock data for progress chart
const progressData = [
  { date: "Week 1", weight: 80, strength: 100 },
  { date: "Week 2", weight: 79, strength: 105 },
  { date: "Week 3", weight: 78, strength: 110 },
  { date: "Week 4", weight: 77.5, strength: 115 },
  { date: "Week 5", weight: 76.5, strength: 120 },
  { date: "Week 6", weight: 76, strength: 125 },
]

// Mock data for daily workouts
const dailyWorkouts = [
  { id: 1, name: "Morning Cardio", completed: true },
  { id: 2, name: "Upper Body Strength", completed: false },
  { id: 3, name: "Evening Yoga", completed: false },
]

// Mock data for achievements
const achievements = [
  { id: 1, name: "First Workout", description: "Completed your first workout", icon: Medal },
  { id: 2, name: "Week Streak", description: "Completed all workouts for a week", icon: Calendar },
  { id: 3, name: "Personal Best", description: "Set a new personal record", icon: Trophy },
]

export function ProgressTrackingComponent() {
  const { workoutPlan } = useAppContext()
  const [activeTab, setActiveTab] = useState("weight")
  const [completedWorkouts, setCompletedWorkouts] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    // Initialize completed workouts when the workout plan changes
    if (workoutPlan && workoutPlan.detailedWorkoutPlan) {
      const initialCompletedWorkouts: { [key: string]: boolean } = {}
      Object.keys(workoutPlan.detailedWorkoutPlan).forEach(day => {
        workoutPlan.detailedWorkoutPlan[day]?.exercises?.forEach(exercise => {
          initialCompletedWorkouts[`${day}-${exercise.name}`] = false
        })
      })
      setCompletedWorkouts(initialCompletedWorkouts)
    }
  }, [workoutPlan])

  const toggleWorkoutCompletion = (day: string, exerciseName: string) => {
    const key = `${day}-${exerciseName}`
    setCompletedWorkouts(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const renderWorkoutChecklist = () => {
    if (!workoutPlan || !workoutPlan.detailedWorkoutPlan) return null

    return (
      <Card>
        <CardHeader>
          <CardTitle>Workout Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={Object.keys(workoutPlan.detailedWorkoutPlan)[0]}>
            <TabsList>
              {Object.keys(workoutPlan.detailedWorkoutPlan).map(day => (
                <TabsTrigger key={day} value={day}>{day}</TabsTrigger>
              ))}
            </TabsList>
            {Object.entries(workoutPlan.detailedWorkoutPlan).map(([day, plan]) => (
              <TabsContent key={day} value={day}>
                <ul className="space-y-2">
                  {plan.exercises.map(exercise => (
                    <li key={exercise.name} className="flex items-center justify-between">
                      <span>{exercise.name}</span>
                      <Button
                        variant={completedWorkouts[`${day}-${exercise.name}`] ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleWorkoutCompletion(day, exercise.name)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        {completedWorkouts[`${day}-${exercise.name}`] ? "Completed" : "Mark as Complete"}
                      </Button>
                    </li>
                  ))}
                </ul>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Progress Tracking</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">76 kg</div>
            <p className="text-xs text-muted-foreground">-4 kg from start</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Strength Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">125</div>
            <p className="text-xs text-muted-foreground">+25% from start</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workouts Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goal Progress</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <Progress value={68} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progress Over Time</CardTitle>
          <CardDescription>Track your weight and strength progress</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="weight">Weight</TabsTrigger>
              <TabsTrigger value="strength">Strength</TabsTrigger>
            </TabsList>
            <TabsContent value="weight">
              <ChartContainer
                config={{
                  weight: {
                    label: "Weight (kg)",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="weight" stroke="var(--color-weight)" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </TabsContent>
            <TabsContent value="strength">
              <ChartContainer
                config={{
                  strength: {
                    label: "Strength",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="strength" stroke="var(--color-strength)" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Workouts</CardTitle>
            <CardDescription>Your daily workout checklist</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {dailyWorkouts.map((workout) => (
                <li key={workout.id} className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Button
                      variant={workout.completed ? "default" : "outline"}
                      size="icon"
                      className="mr-2"
                      onClick={() => toggleWorkoutCompletion(workout.id)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="sr-only">Mark as {workout.completed ? 'incomplete' : 'complete'}</span>
                    </Button>
                    {workout.name}
                  </span>
                  {workout.completed && <span className="text-sm text-muted-foreground">Completed</span>}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
            <CardDescription>Milestones you've reached</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {achievements.map((achievement) => (
                <li key={achievement.id} className="flex items-center space-x-3">
                  <achievement.icon className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium">{achievement.name}</p>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {renderWorkoutChecklist()}
      </div>
    </div>
  )
}
