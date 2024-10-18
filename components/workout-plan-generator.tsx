"use client"

import { useState } from "react"
import { Clock, Dumbbell } from "lucide-react"
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
  const { userProfile, workoutPlan, updateWorkoutPlan } = useAppContext()
  const [selectedDay, setSelectedDay] = useState("1")
  const [duration, setDuration] = useState([45])
  const [includeWarmup, setIncludeWarmup] = useState(true)
  const [includeCooldown, setIncludeCooldown] = useState(true)
  const [focusArea, setFocusArea] = useState("")
  const [additionalInfo, setAdditionalInfo] = useState({
    recentChanges: "",
    specificRequirements: "",
  })
  const [error, setError] = useState<string | null>(null);

  const handleAdditionalInfoChange = (field: string, value: string) => {
    setAdditionalInfo((prev) => ({ ...prev, [field]: value }))
  }

  const generateWorkoutPlan = async () => {
    setError(null); // Clear any previous errors
    // Combine user profile, preferences, and additional info
    const planRequest = {
      ...userProfile,
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
        await updateWorkoutPlan(newPlan)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Failed to generate workout plan')
      }
    } catch (error) {
      console.error('Error generating workout plan:', error);
      setError(error.message || 'An unexpected error occurred');
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Workout Plan Generator</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Customize Your Plan</CardTitle>
            <CardDescription>Adjust settings to fit your needs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={generateWorkoutPlan}>Generate New Plan</Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Your Personalized Workout Plan</CardTitle>
            <CardDescription>{workoutPlan?.informationSummary}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="schedule">
              <TabsList>
                <TabsTrigger value="schedule">Weekly Schedule</TabsTrigger>
                <TabsTrigger value="exercises">Exercise Descriptions</TabsTrigger>
                <TabsTrigger value="safety">Safety Advice</TabsTrigger>
                <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
              </TabsList>
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
        </Card>
      </div>
    </div>
  )
}
