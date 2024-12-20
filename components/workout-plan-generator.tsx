"use client"

import { useState } from "react"
import { Clock, Dumbbell, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAppContext } from "@/app/context/AppContext"

export function WorkoutPlanGeneratorComponent() {
  const { userProfile, workoutPlan, updateWorkoutPlan, saveWorkoutPlan } = useAppContext()
  const [selectedDay, setSelectedDay] = useState("1")
  const [duration, setDuration] = useState([45])
  const [includeWarmup, setIncludeWarmup] = useState(true)
  const [includeCooldown, setIncludeCooldown] = useState(true)
  const [focusArea, setFocusArea] = useState("")
  const [additionalInfo, setAdditionalInfo] = useState({
    recentChanges: "",
    specificRequirements: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState<string | null>(null)
  const [startDay, setStartDay] = useState<string>("Monday")

  const handleAdditionalInfoChange = (field: string, value: string) => {
    setAdditionalInfo((prev) => ({ ...prev, [field]: value }))
  }

  const generateWorkoutPlan = async () => {
    setError(null)
    setNotification(null)
    // Combine user profile, preferences, and additional info
    const planRequest = {
      ...userProfile,
      startDay,
      duration: duration[0], // Assuming duration is an array with a single value
      includeWarmup,
      includeCooldown,
      focusArea,
      ...additionalInfo,
    }

    try {
      // Call API to generate workout plan
      const response = await fetch('/api/generate-workout-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planRequest),
      })

      if (response.ok) {
        const newPlan = await response.json()
        await saveWorkoutPlan(newPlan)  // Use saveWorkoutPlan here
        setNotification("Workout plan generated and saved successfully!")
      } else {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Failed to generate workout plan')
      }
    } catch (error) {
      console.error('Error generating workout plan:', error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('An unexpected error occurred')
      }
    }
  }

  const renderDetailedWorkoutPlan = () => {
    if (!workoutPlan || !workoutPlan.detailedWorkoutPlan) return null;

    return (
      <div className="space-y-4">
        {Object.entries(workoutPlan.detailedWorkoutPlan).map(([day, plan]) => (
          <Card key={day}>
            <CardHeader>
              <CardTitle>{day}'s Workout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-2">Exercise</th>
                      <th className="text-center p-2">Sets</th>
                      <th className="text-center p-2">Reps</th>
                      <th className="text-center p-2">Rest</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.exercises.map((exercise, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-muted/50' : ''}>
                        <td className="p-2">
                          <div className="font-medium">{exercise.name}</div>
                          <div className="text-sm text-muted-foreground">{exercise.description}</div>
                        </td>
                        <td className="text-center p-2">{exercise.sets}</td>
                        <td className="text-center p-2">{exercise.reps}</td>
                        <td className="text-center p-2">{exercise.rest}s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const handleSavePlan = async () => {
    if (workoutPlan) {
      try {
        await saveWorkoutPlan(workoutPlan)
        setNotification("Workout Plan Saved Successfully")
      } catch (error) {
        console.error("Error saving workout plan:", error)
        setError("Failed to save workout plan. Please try again.")
      }
    }
  }

  return (
    <div className="space-y-6">
      {notification && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{notification}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Generate Your Workout Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Workout Duration (minutes)</Label>
            <Slider
              min={15}
              max={90}
              step={5}
              value={duration}
              onValueChange={setDuration}
            />
            <div className="text-right text-sm text-muted-foreground">{duration} minutes</div>
          </div>
          <div className="space-y-2">
            <Label>Include Warm-up</Label>
            <Switch checked={includeWarmup} onCheckedChange={setIncludeWarmup} />
          </div>
          <div className="space-y-2">
            <Label>Include Cool-down</Label>
            <Switch checked={includeCooldown} onCheckedChange={setIncludeCooldown} />
          </div>
          <div className="space-y-2">
            <Label>Focus Area</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select focus area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upper">Upper Body</SelectItem>
                <SelectItem value="lower">Lower Body</SelectItem>
                <SelectItem value="full">Full Body</SelectItem>
                <SelectItem value="core">Core</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="recentChanges">Recent Changes in Health or Fitness</Label>
            <Textarea
              id="recentChanges"
              placeholder="Describe any recent changes in your health or fitness level"
              value={additionalInfo.recentChanges}
              onChange={(e) => handleAdditionalInfoChange("recentChanges", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="specificRequirements">Specific Requirements or Preferences</Label>
            <Textarea
              id="specificRequirements"
              placeholder="Any specific requirements or preferences for your workout plan"
              value={additionalInfo.specificRequirements}
              onChange={(e) => handleAdditionalInfoChange("specificRequirements", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDay">Start Day</Label>
            <Select value={startDay} onValueChange={setStartDay}>
              <SelectTrigger id="startDay">
                <SelectValue placeholder="Select start day" />
              </SelectTrigger>
              <SelectContent>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={generateWorkoutPlan}>Generate New Plan</Button>
        </CardFooter>
      </Card>

      {workoutPlan && (
        <Card>
          <CardHeader>
            <CardTitle>Your Personalized Workout Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="detailed">
              <TabsList>
                <TabsTrigger value="detailed">Detailed Plan</TabsTrigger>
                <TabsTrigger value="schedule">Weekly Schedule</TabsTrigger>
                <TabsTrigger value="exercises">Exercise Descriptions</TabsTrigger>
                <TabsTrigger value="safety">Safety Advice</TabsTrigger>
                <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
              </TabsList>
              <TabsContent value="detailed" className="mt-4">
                {renderDetailedWorkoutPlan()}
              </TabsContent>
              <TabsContent value="schedule">
                {workoutPlan && Object.entries(workoutPlan.weeklyWorkoutSchedule).map(([day, exercises]) => (
                  <div key={day}>
                    <h3 className="font-semibold">{day}</h3>
                    <ul>
                      {exercises.map((exercise, index) => (
                        <li key={index}>{exercise}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="exercises">
                {workoutPlan && Object.entries(workoutPlan.exerciseDescriptions).map(([exercise, description]) => (
                  <div key={exercise}>
                    <h3 className="font-semibold">{exercise}</h3>
                    <p>{description}</p>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="safety">
                <ul>
                  {workoutPlan?.safetyAdvice.map((advice, index) => (
                    <li key={index}>{advice}</li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="progress">
                <ul>
                  {workoutPlan?.progressTrackingSuggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSavePlan} className="w-full">
              <Save className="mr-2 h-4 w-4" /> Save Workout Plan
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
