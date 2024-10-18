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

export function ProgressTrackingComponent() {
  const { workoutPlan, updateWorkoutPlan } = useAppContext()
  const [activeTab, setActiveTab] = useState("weight")
  const [completedWorkouts, setCompletedWorkouts] = useState<{ [key: string]: boolean }>({})
  const [weights, setWeights] = useState<{ [key: string]: number }>({})
  const [progressData, setProgressData] = useState<Array<{ date: string, weight: number, strength: number }>>([])

  useEffect(() => {
    // Initialize completed workouts, weights, and progress data when the workout plan changes
    if (workoutPlan && workoutPlan.detailedWorkoutPlan) {
      const initialCompletedWorkouts: { [key: string]: boolean } = {}
      const initialWeights: { [key: string]: number } = {}
      Object.entries(workoutPlan.detailedWorkoutPlan).forEach(([day, plan]) => {
        plan.exercises.forEach(exercise => {
          const key = `${day}-${exercise.name}`
          initialCompletedWorkouts[key] = false
          initialWeights[key] = exercise.weight || 0
        })
      })
      setCompletedWorkouts(initialCompletedWorkouts)
      setWeights(initialWeights)

      // Initialize progress data with the first week's data
      const initialProgressData = [{
        date: "Week 1",
        weight: workoutPlan.userWeight || 0,
        strength: calculateTotalWeight(initialWeights)
      }]
      setProgressData(initialProgressData)
    }
  }, [workoutPlan])

  const toggleWorkoutCompletion = (day: string, exerciseName: string) => {
    const key = `${day}-${exerciseName}`
    setCompletedWorkouts(prev => {
      const newCompletedWorkouts = { ...prev, [key]: !prev[key] }
      updateProgressData(newCompletedWorkouts)
      return newCompletedWorkouts
    })
  }

  const handleWeightChange = (day: string, exerciseName: string, value: string) => {
    const key = `${day}-${exerciseName}`
    const newWeight = parseFloat(value) || 0
    setWeights(prev => {
      const newWeights = { ...prev, [key]: newWeight }
      updateProgressData(completedWorkouts, newWeights)
      return newWeights
    })

    // Update the workout plan with the new weight
    if (workoutPlan && workoutPlan.detailedWorkoutPlan) {
      const updatedPlan = { ...workoutPlan }
      const exercise = updatedPlan.detailedWorkoutPlan[day].exercises.find(e => e.name === exerciseName)
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
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Exercise</th>
                      <th className="text-center">Sets</th>
                      <th className="text-center">Reps</th>
                      <th className="text-center">Rest</th>
                      <th className="text-center">Weight (lbs)</th>
                      <th className="text-center">Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.exercises.map((exercise, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="py-2">{exercise.name}</td>
                        <td className="text-center">{exercise.sets}</td>
                        <td className="text-center">{exercise.reps}</td>
                        <td className="text-center">{exercise.rest}s</td>
                        <td className="text-center">
                          <Input
                            type="number"
                            value={weights[`${day}-${exercise.name}`] || ''}
                            onChange={(e) => handleWeightChange(day, exercise.name, e.target.value)}
                            className="w-20 mx-auto"
                          />
                        </td>
                        <td className="text-center">
                          <Button
                            variant={completedWorkouts[`${day}-${exercise.name}`] ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleWorkoutCompletion(day, exercise.name)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            {completedWorkouts[`${day}-${exercise.name}`] ? "Done" : "Mark"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

      {/* ... (existing code for stats cards) ... */}

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
                    label: "Weight (lbs)",
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
                    label: "Total Weight Lifted (lbs)",
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
        {renderWorkoutChecklist()}
      </div>
    </div>
  )
}
