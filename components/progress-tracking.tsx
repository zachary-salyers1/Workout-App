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
import { Input } from "@/components/ui/input"
import { format, parse, isValid, compareAsc, addDays } from "date-fns"
import { WorkoutCalendar } from './workout-calendar'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { EditWorkoutPlanComponent } from "./edit-workout-plan"

type ProgressTrackingComponentProps = {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

export function ProgressTrackingComponent({ selectedDate, onDateSelect }: ProgressTrackingComponentProps) {
  const { workoutPlan, updateWorkoutPlan, deleteWorkoutPlan } = useAppContext()
  const [weights, setWeights] = useState<{ [key: string]: number }>({})
  const [completedWorkouts, setCompletedWorkouts] = useState<{ [key: string]: boolean }>({})
  const [progressData, setProgressData] = useState<Array<{ date: string, weight: number, strength: number }>>([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const sortedWorkoutDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  const mapWorkoutsToDates = (workoutPlan: WorkoutPlan) => {
    if (!workoutPlan.startDate || !workoutPlan.weeklyWorkoutSchedule) return {}

    const startDate = parse(workoutPlan.startDate, 'yyyy-MM-dd', new Date())
    const mappedWorkouts: { [key: string]: any } = {}

    sortedWorkoutDays.forEach((day, index) => {
      const date = format(addDays(startDate, index), 'yyyy-MM-dd')
      if (workoutPlan.weeklyWorkoutSchedule[day]) {
        mappedWorkouts[date] = {
          exercises: workoutPlan.weeklyWorkoutSchedule[day].map(exercise => ({
            name: exercise,
            sets: 3, // Default values, adjust as needed
            reps: 10,
            rest: 60
          }))
        }
      }
    })

    return mappedWorkouts
  }

  useEffect(() => {
    if (workoutPlan) {
      const mappedWorkouts = mapWorkoutsToDates(workoutPlan)
      // Update your state or workoutPlan here with the mapped workouts
      // For example:
      // updateWorkoutPlan({ ...workoutPlan, detailedWorkoutPlan: mappedWorkouts })
    }
  }, [workoutPlan])

  const toggleWorkoutCompletion = (date: string, exerciseName: string) => {
    const key = `${date}-${exerciseName}`
    setCompletedWorkouts(prev => {
      const newCompletedWorkouts = { ...prev, [key]: !prev[key] }
      updateProgressData(newCompletedWorkouts)
      return newCompletedWorkouts
    })
  }

  const handleWeightChange = (date: string, exerciseName: string, value: string) => {
    const key = `${date}-${exerciseName}`
    const newWeight = parseFloat(value) || 0
    setWeights(prev => {
      const newWeights = { ...prev, [key]: newWeight }
      updateProgressData(completedWorkouts, newWeights)
      return newWeights
    })

    // Update the workout plan with the new weight
    if (workoutPlan && workoutPlan.detailedWorkoutPlan) {
      const updatedPlan = { ...workoutPlan }
      const exercise = updatedPlan.detailedWorkoutPlan[date].exercises.find(e => e.name === exerciseName)
      if (exercise) {
        exercise.weight = newWeight
        updateWorkoutPlan(updatedPlan)
      }
    }
  }

  const calculateTotalWeight = (weights: { [key: string]: number }) => {
    return Object.values(weights).reduce((sum, weight) => sum + weight, 0)
  }

  const updateProgressData = (completedWorkouts: { [key: string]: boolean }, currentWeights = weights) => {
    const totalCompletedWorkouts = Object.values(completedWorkouts).filter(Boolean).length
    const weekNumber = Math.floor(totalCompletedWorkouts / 7) + 1
    const totalWeight = calculateTotalWeight(currentWeights)

    setProgressData(prev => {
      const newData = [...prev]
      const weekIndex = newData.findIndex(data => data.date === `Week ${weekNumber}`)
      if (weekIndex !== -1) {
        newData[weekIndex] = { ...newData[weekIndex], strength: totalWeight }
      } else {
        newData.push({ date: `Week ${weekNumber}`, weight: workoutPlan?.userWeight || 0, strength: totalWeight })
      }
      return newData
    })
  }

  const formatDate = (dateString: string) => {
    try {
      const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date())
      if (isValid(parsedDate)) {
        return format(parsedDate, 'EEE, MMM d')
      }
    } catch (error) {
      console.error(`Error parsing date: ${dateString}`, error)
    }
    return dateString // Fallback to original string if parsing fails
  }

  const renderWorkoutDetails = () => {
    if (!selectedDate || !workoutPlan || !workoutPlan.detailedWorkoutPlan) return null

    const dateString = format(selectedDate, 'yyyy-MM-dd')
    const workout = workoutPlan.detailedWorkoutPlan[dateString]

    if (!workout) return <p>No workout scheduled for this day.</p>

    return (
      <Card className="h-full overflow-hidden">
        <CardHeader>
          <CardTitle>Workout for {format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[calc(100vh-200px)]">
          {workout.exercises.map((exercise, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-lg font-semibold">{exercise.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{exercise.description}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                <div>Sets: {exercise.sets}</div>
                <div>Reps: {exercise.reps}</div>
                <div>Rest: {exercise.rest}s</div>
                <div>
                  <Input
                    type="number"
                    value={weights[`${dateString}-${exercise.name}`] || ''}
                    onChange={(e) => handleWeightChange(dateString, exercise.name, e.target.value)}
                    className="w-full"
                    placeholder="Weight (lbs)"
                  />
                </div>
                <div>
                  <Button
                    variant={completedWorkouts[`${dateString}-${exercise.name}`] ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleWorkoutCompletion(dateString, exercise.name)}
                    className="w-full"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {completedWorkouts[`${dateString}-${exercise.name}`] ? "Done" : "Mark"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  const handleDeleteWorkoutPlan = async () => {
    if (confirm("Are you sure you want to delete your workout plan?")) {
      try {
        await deleteWorkoutPlan()
        // Handle successful deletion (e.g., show a success message, redirect)
      } catch (error) {
        console.error("Failed to delete workout plan:", error)
        // Handle error (e.g., show error message)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Progress Tracking</h2>
        <div>
          <Button onClick={() => setIsEditModalOpen(true)} className="mr-2">Edit Plan</Button>
          <Button variant="destructive" onClick={handleDeleteWorkoutPlan}>Delete Plan</Button>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Workout Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkoutCalendar onDateSelect={onDateSelect} />
          </CardContent>
        </Card>
        <div className="lg:col-span-1">
          {renderWorkoutDetails()}
        </div>
      </div>
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Workout Plan</DialogTitle>
          </DialogHeader>
          <EditWorkoutPlanComponent
            workoutPlan={workoutPlan}
            onSave={(updatedPlan) => {
              updateWorkoutPlan(updatedPlan)
              setIsEditModalOpen(false)
            }}
            onCancel={() => setIsEditModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
