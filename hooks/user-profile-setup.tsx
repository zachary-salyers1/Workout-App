"use client"

import { useState, useEffect } from "react"
import { useAppContext } from "@/app/context/AppContext"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"

const fitnessGoals = ["Weight Loss", "Muscle Gain", "Improve Endurance", "General Fitness"]
const fitnessLevels = ["Beginner", "Intermediate", "Advanced"]
const equipmentOptions = ["None", "Dumbbells", "Resistance Bands", "Pull-up Bar", "Bench", "Barbell Set"]
const medicalConditions = ["None", "Heart Disease", "Diabetes", "Asthma", "Arthritis", "Other"]
const exercisePreferences = ["Running", "Swimming", "Weightlifting", "Yoga", "Cycling", "Other"]

export default function UserProfileSetup() {
  const { user, userProfile, updateUserProfile } = useAppContext()
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState({
    name: "",
    age: "",
    height: "",
    weight: "",
    gender: "",
    fitnessGoal: "",
    fitnessLevel: "",
    workoutsPerWeek: 3,
    equipment: [],
    dietaryPreferences: {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      lactoseFree: false,
    },
    medicalConditions: [],
    injuries: "",
    exercisePreferences: [],
    exerciseDislikes: "",
    shortTermGoal: "",
    longTermGoal: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    if (userProfile && Object.keys(userProfile).length > 0) {
      setProfile(userProfile)
      setIsEditing(false)
    } else {
      setIsEditing(true)
    }
  }, [userProfile])

  const updateProfile = (key: string, value: any) => {
    setProfile((prev) => ({ ...prev, [key]: value }))
  }

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 4))
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1))

  const renderStep1 = () => (
    <>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Enter your name"
            value={profile.name}
            onChange={(e) => updateProfile("name", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            placeholder="Enter your age"
            value={profile.age}
            onChange={(e) => updateProfile("age", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="gender">Gender</Label>
          <Select onValueChange={(value) => updateProfile("gender", value)}>
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select your gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  )

  const renderStep2 = () => (
    <>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="height">Height (cm)</Label>
          <Input
            id="height"
            type="number"
            placeholder="Enter your height in cm"
            value={profile.height}
            onChange={(e) => updateProfile("height", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            placeholder="Enter your weight in kg"
            value={profile.weight}
            onChange={(e) => updateProfile("weight", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label>Fitness Goal</Label>
          <RadioGroup onValueChange={(value) => updateProfile("fitnessGoal", value)}>
            {fitnessGoals.map((goal) => (
              <div key={goal} className="flex items-center space-x-2">
                <RadioGroupItem value={goal} id={goal} />
                <Label htmlFor={goal}>{goal}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    </>
  )

  const renderStep3 = () => (
    <>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Fitness Level</Label>
          <RadioGroup onValueChange={(value) => updateProfile("fitnessLevel", value)}>
            {fitnessLevels.map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <RadioGroupItem value={level} id={level} />
                <Label htmlFor={level}>{level}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <div className="grid gap-2">
          <Label>Workouts per week</Label>
          <Slider
            min={1}
            max={7}
            step={1}
            value={[profile.workoutsPerWeek]}
            onValueChange={(value) => updateProfile("workoutsPerWeek", value[0])}
          />
          <div className="text-center">{profile.workoutsPerWeek} days</div>
        </div>
        <div className="grid gap-2">
          <Label>Available Equipment</Label>
          {equipmentOptions.map((item) => (
            <div key={item} className="flex items-center space-x-2">
              <Switch
                id={item}
                checked={profile.equipment.includes(item)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateProfile("equipment", [...profile.equipment, item as never])
                  } else {
                    updateProfile(
                      "equipment",
                      profile.equipment.filter((i: string) => i !== item)
                    )
                  }
                }}
              />
              <Label htmlFor={item}>{item}</Label>
            </div>
          ))}
        </div>
      </div>
    </>
  )

  const renderStep4 = () => (
    <>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Dietary Preferences</Label>
          {Object.entries(profile.dietaryPreferences).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-2">
              <Switch
                id={key}
                checked={value}
                onCheckedChange={(checked) =>
                  updateProfile("dietaryPreferences", { ...profile.dietaryPreferences, [key]: checked })
                }
              />
              <Label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
            </div>
          ))}
        </div>
      </div>
    </>
  )

  const renderStep5 = () => (
    <>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Medical Conditions</Label>
          {medicalConditions.map((condition) => (
            <div key={condition} className="flex items-center space-x-2">
              <Checkbox
                id={condition}
                checked={profile.medicalConditions.includes(condition)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateProfile("medicalConditions", [...profile.medicalConditions, condition])
                  } else {
                    updateProfile(
                      "medicalConditions",
                      profile.medicalConditions.filter((c) => c !== condition)
                    )
                  }
                }}
              />
              <Label htmlFor={condition}>{condition}</Label>
            </div>
          ))}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="injuries">Injuries or Physical Limitations</Label>
          <Textarea
            id="injuries"
            placeholder="Describe any injuries or physical limitations"
            value={profile.injuries}
            onChange={(e) => updateProfile("injuries", e.target.value)}
          />
        </div>
      </div>
    </>
  )

  const renderStep6 = () => (
    <>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Fitness Level</Label>
          <RadioGroup onValueChange={(value) => updateProfile("fitnessLevel", value)}>
            {fitnessLevels.map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <RadioGroupItem value={level} id={level} />
                <Label htmlFor={level}>{level}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <div className="grid gap-2">
          <Label>Exercise Preferences</Label>
          {exercisePreferences.map((preference) => (
            <div key={preference} className="flex items-center space-x-2">
              <Checkbox
                id={preference}
                checked={profile.exercisePreferences.includes(preference)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateProfile("exercisePreferences", [...profile.exercisePreferences, preference])
                  } else {
                    updateProfile(
                      "exercisePreferences",
                      profile.exercisePreferences.filter((p) => p !== preference)
                    )
                  }
                }}
              />
              <Label htmlFor={preference}>{preference}</Label>
            </div>
          ))}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="exerciseDislikes">Exercise Dislikes</Label>
          <Textarea
            id="exerciseDislikes"
            placeholder="Describe exercises you dislike or want to avoid"
            value={profile.exerciseDislikes}
            onChange={(e) => updateProfile("exerciseDislikes", e.target.value)}
          />
        </div>
      </div>
    </>
  )

  const renderStep7 = () => (
    <>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="shortTermGoal">Short-term Fitness Goal</Label>
          <Textarea
            id="shortTermGoal"
            placeholder="Describe your short-term fitness goal"
            value={profile.shortTermGoal}
            onChange={(e) => updateProfile("shortTermGoal", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="longTermGoal">Long-term Fitness Goal</Label>
          <Textarea
            id="longTermGoal"
            placeholder="Describe your long-term fitness goal"
            value={profile.longTermGoal}
            onChange={(e) => updateProfile("longTermGoal", e.target.value)}
          />
        </div>
      </div>
    </>
  )

  const isStepValid = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return profile.name && profile.age && profile.gender
      case 2:
        return profile.height && profile.weight && profile.fitnessGoal
      case 3:
        return profile.fitnessLevel && profile.workoutsPerWeek && profile.equipment.length > 0
      case 4:
        return true // No required fields in step 4
      case 5:
        return profile.medicalConditions.length > 0 || profile.injuries
      case 6:
        return profile.fitnessLevel && profile.exercisePreferences.length > 0
      case 7:
        return profile.shortTermGoal && profile.longTermGoal
      default:
        return false
    }
  }

  const handleFinish = async () => {
    if (!user) {
      setSuccessMessage("You must be logged in to update your profile.")
      return
    }

    try {
      await updateUserProfile(profile)
      setSuccessMessage("Profile successfully updated!")
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      setSuccessMessage("Failed to update profile. Please try again.")
    }
  }

  const renderProfileSummary = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Your Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><strong>Name:</strong> {profile.name}</div>
          <div><strong>Age:</strong> {profile.age}</div>
          <div><strong>Gender:</strong> {profile.gender}</div>
          <div><strong>Height:</strong> {profile.height} cm</div>
          <div><strong>Weight:</strong> {profile.weight} kg</div>
          <div><strong>Fitness Goal:</strong> {profile.fitnessGoal}</div>
          <div><strong>Fitness Level:</strong> {profile.fitnessLevel}</div>
          <div><strong>Workouts per Week:</strong> {profile.workoutsPerWeek}</div>
        </div>
        <div><strong>Equipment:</strong> {profile.equipment.join(", ")}</div>
        <div>
          <strong>Dietary Preferences:</strong> 
          {Object.entries(profile.dietaryPreferences)
            .filter(([_, value]) => value)
            .map(([key, _]) => key)
            .join(", ") || "None"}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
      </CardFooter>
    </Card>
  )

  return (
    <div className="container mx-auto p-4">
      {!isEditing ? (
        renderProfileSummary()
      ) : (
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Set Up Your Profile</CardTitle>
            <CardDescription>Step {step} of 4</CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
            {step === 5 && renderStep5()}
            {step === 6 && renderStep6()}
            {step === 7 && renderStep7()}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={handlePrev} disabled={step === 1} variant="outline">
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            {step < 4 ? (
              <Button onClick={handleNext} disabled={!isStepValid(step)}>
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={!isStepValid(step)}>
                Finish
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
      {successMessage && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}
    </div>
  )
}
