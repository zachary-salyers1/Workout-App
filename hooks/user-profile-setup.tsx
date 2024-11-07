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
import HealthGoalsSetup from "@/app/components/health-goals-setup"

const fitnessGoals = ["Weight Loss", "Muscle Gain", "Improve Endurance", "General Fitness"]
const fitnessLevels = ["Beginner", "Intermediate", "Advanced"]
const equipmentOptions = ["None", "Dumbbells", "Resistance Bands", "Pull-up Bar", "Bench", "Barbell Set"]
const medicalConditions = ["None", "Heart Disease", "Diabetes", "Asthma", "Arthritis", "Other"]
const exercisePreferences = ["Running", "Swimming", "Weightlifting", "Yoga", "Cycling", "Other"]
const healthConditions = [
  "Hypertension",
  "Type 2 Diabetes",
  "High Cholesterol",
  "Anxiety/Depression",
  "Sleep Disorders",
  "Obesity",
  "Other"
]
const medications = [
  "Blood Pressure Medication",
  "Diabetes Medication",
  "Cholesterol Medication",
  "Anti-anxiety/Depression Medication",
  "Sleep Medication",
  "Other"
]
const sleepPatterns = [
  "Less than 6 hours",
  "6-7 hours",
  "7-8 hours",
  "More than 8 hours"
]
const stressLevels = [
  "Low",
  "Moderate",
  "High",
  "Severe"
]

// Add this type for medication details
type MedicationDetail = {
  medicationType: string
  name: string
  dosage: string
  frequency: string
}

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
    medicalConditions: [] as string[],
    injuries: "",
    exercisePreferences: [],
    exerciseDislikes: "",
    shortTermGoal: "",
    longTermGoal: "",
    healthConditions: [] as string[],
    currentMedications: [] as string[],
    medicationDetails: [] as MedicationDetail[],
    sleepPattern: "",
    stressLevel: "",
    dietaryHabits: {
      mealsPerDay: 3,
      snacking: false,
      waterIntake: 0,
      regularMealtimes: false,
    },
    baselineAssessment: {
      bloodPressure: "",
      bloodSugar: "",
      weight: "",
      sleepQuality: "",
      energyLevel: "",
    }
  })
  const [isEditing, setIsEditing] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [isEditingHealthGoals, setIsEditingHealthGoals] = useState(false)

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
                    updateProfile("equipment", [...profile.equipment, item])
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

  // Add this function to handle medication details
  const updateMedicationDetail = (medicationType: string, field: keyof MedicationDetail, value: string) => {
    setProfile(prev => {
      const existingDetails = prev.medicationDetails || []
      const medicationIndex = existingDetails.findIndex(detail => detail.medicationType === medicationType)
      
      if (medicationIndex === -1) {
        // Create new medication detail
        return {
          ...prev,
          medicationDetails: [
            ...existingDetails,
            { medicationType, name: '', dosage: '', frequency: '', [field]: value }
          ]
        }
      } else {
        // Update existing medication detail
        const updatedDetails = [...existingDetails]
        updatedDetails[medicationIndex] = {
          ...updatedDetails[medicationIndex],
          [field]: value
        }
        return {
          ...prev,
          medicationDetails: updatedDetails
        }
      }
    })
  }

  const renderHealthConditions = () => (
    <>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Current Health Conditions</Label>
          {healthConditions.map((condition) => (
            <div key={condition} className="flex items-center space-x-2">
              <Checkbox
                id={condition}
                checked={profile.healthConditions?.includes(condition) || false}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateProfile("healthConditions", [...(profile.healthConditions || []), condition])
                  } else {
                    updateProfile(
                      "healthConditions",
                      (profile.healthConditions || []).filter((c) => c !== condition)
                    )
                  }
                }}
              />
              <Label htmlFor={condition}>{condition}</Label>
            </div>
          ))}
        </div>

        <div className="grid gap-2">
          <Label>Current Medications</Label>
          {medications.map((medicationType) => (
            <div key={medicationType} className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={medicationType}
                  checked={profile.currentMedications?.includes(medicationType) || false}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateProfile("currentMedications", [...(profile.currentMedications || []), medicationType])
                      // Initialize medication details when checked
                      updateMedicationDetail(medicationType, 'medicationType', medicationType)
                    } else {
                      updateProfile(
                        "currentMedications",
                        (profile.currentMedications || []).filter((m) => m !== medicationType)
                      )
                      // Remove medication details when unchecked
                      setProfile(prev => ({
                        ...prev,
                        medicationDetails: (prev.medicationDetails || []).filter(detail => 
                          detail.medicationType !== medicationType
                        )
                      }))
                    }
                  }}
                />
                <Label htmlFor={medicationType}>{medicationType}</Label>
              </div>
              
              {profile.currentMedications?.includes(medicationType) && (
                <div className="ml-6 space-y-2 p-2 border rounded-md bg-muted/50">
                  <div className="grid gap-2">
                    <Label htmlFor={`${medicationType}-name`}>Medication Name</Label>
                    <Input
                      id={`${medicationType}-name`}
                      placeholder="Enter medication name"
                      value={(profile.medicationDetails || [])
                        .find(d => d.medicationType === medicationType)?.name || ''}
                      onChange={(e) => updateMedicationDetail(medicationType, 'name', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`${medicationType}-dosage`}>Dosage</Label>
                    <Input
                      id={`${medicationType}-dosage`}
                      placeholder="e.g., 50mg"
                      value={(profile.medicationDetails || [])
                        .find(d => d.medicationType === medicationType)?.dosage || ''}
                      onChange={(e) => updateMedicationDetail(medicationType, 'dosage', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`${medicationType}-frequency`}>Frequency</Label>
                    <Select 
                      onValueChange={(value) => updateMedicationDetail(medicationType, 'frequency', value)}
                      value={(profile.medicationDetails || [])
                        .find(d => d.medicationType === medicationType)?.frequency || ''}
                    >
                      <SelectTrigger id={`${medicationType}-frequency`}>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once">Once daily</SelectItem>
                        <SelectItem value="twice">Twice daily</SelectItem>
                        <SelectItem value="three">Three times daily</SelectItem>
                        <SelectItem value="four">Four times daily</SelectItem>
                        <SelectItem value="asNeeded">As needed</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )

  const renderLifestyleAssessment = () => (
    <>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Sleep Pattern</Label>
          <RadioGroup onValueChange={(value) => updateProfile("sleepPattern", value)}>
            {sleepPatterns.map((pattern) => (
              <div key={pattern} className="flex items-center space-x-2">
                <RadioGroupItem value={pattern} id={pattern} />
                <Label htmlFor={pattern}>{pattern}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="grid gap-2">
          <Label>Stress Level</Label>
          <RadioGroup onValueChange={(value) => updateProfile("stressLevel", value)}>
            {stressLevels.map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <RadioGroupItem value={level} id={level} />
                <Label htmlFor={level}>{level}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="grid gap-2">
          <Label>Dietary Habits</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Meals per day</span>
              <Input
                type="number"
                min={1}
                max={6}
                value={profile.dietaryHabits.mealsPerDay}
                onChange={(e) => updateProfile("dietaryHabits", {
                  ...profile.dietaryHabits,
                  mealsPerDay: parseInt(e.target.value)
                })}
                className="w-20"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="snacking"
                checked={profile.dietaryHabits.snacking}
                onCheckedChange={(checked) => updateProfile("dietaryHabits", {
                  ...profile.dietaryHabits,
                  snacking: checked
                })}
              />
              <Label htmlFor="snacking">Regular Snacking</Label>
            </div>
          </div>
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
        <div>
          <strong>Health Conditions:</strong> 
          {profile.healthConditions?.join(", ") ?? "None"}
        </div>
        <div>
          <strong>Current Medications:</strong>
          {profile.medicationDetails.length > 0 ? (
            <ul>
              {profile.medicationDetails.map((detail) => (
                <li key={detail.medicationType}>
                  <strong>{detail.medicationType}</strong>
                  <div>Name: {detail.name}</div>
                  <div>Dosage: {detail.dosage} mg</div>
                  <div>Frequency: {detail.frequency}</div>
                </li>
              ))}
            </ul>
          ) : (
            "None"
          )}
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
            {step === 4 && renderHealthConditions()}
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
