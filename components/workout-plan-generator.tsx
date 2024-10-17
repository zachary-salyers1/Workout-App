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
import { useAppContext } from "@/app/context/AppContext"

export function WorkoutPlanGeneratorComponent() {
  const { userProfile, workoutPlan, updateWorkoutPlan } = useAppContext()
  const [selectedDay, setSelectedDay] = useState("1")
  const [duration, setDuration] = useState([45])
  const [includeWarmup, setIncludeWarmup] = useState(true)
  const [includeCooldown, setIncludeCooldown] = useState(true)

  const generateWorkoutPlan = async () => {
    // Generate a new workout plan based on user profile and preferences
    const newPlan = [/* ... */]
    await updateWorkoutPlan(newPlan)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Workout Plan Generator</h1>
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
          </CardContent>
          <CardFooter>
            <Button className="w-full">Generate New Plan</Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Your Personalized Workout Plan</CardTitle>
            <CardDescription>Based on your {userProfile.fitnessGoal} goal</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="1" className="w-full" onValueChange={setSelectedDay}>
              <TabsList className="grid w-full grid-cols-4 mb-4">
                {[1, 2, 3, 4].map((day) => (
                  <TabsTrigger key={day} value={day.toString()}>
                    Day {day}
                  </TabsTrigger>
                ))}
              </TabsList>
              {workoutPlan.map((workout, index) => (
                <TabsContent key={index} value={(index + 1).toString()}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Dumbbell className="w-5 h-5 mr-2" />
                        {workout.name}
                      </CardTitle>
                      <CardDescription className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {duration} minutes
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-4">
                        {workout.exercises.map((exercise, exIndex: number) => (
                          <li key={exIndex} className="flex justify-between items-center">
                            <span>{exercise.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {exercise.sets} sets x {exercise.reps}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
