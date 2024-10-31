"use client"

import { useState } from "react"
import { useAppContext } from "@/app/context/AppContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Plus, X } from "lucide-react"

interface HealthGoalsSetupProps {
  onClose?: () => void;
  onSave?: (goals: any) => Promise<void>;
}

export default function HealthGoalsSetup({ onClose, onSave }: HealthGoalsSetupProps) {
  const { userProfile, updateUserProfile } = useAppContext()
  const [healthGoals, setHealthGoals] = useState({
    medicationReduction: userProfile?.healthGoals?.medicationReduction || false,
    weightManagement: userProfile?.healthGoals?.weightManagement || false,
    sleepImprovement: userProfile?.healthGoals?.sleepImprovement || false,
    stressReduction: userProfile?.healthGoals?.stressReduction || false,
    bloodPressureControl: userProfile?.healthGoals?.bloodPressureControl || false,
    bloodSugarControl: userProfile?.healthGoals?.bloodSugarControl || false,
    ...userProfile?.healthGoals?.customGoals || {}
  })
  const [newGoal, setNewGoal] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const updateGoal = (key: string, value: boolean) => {
    setHealthGoals(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const addCustomGoal = () => {
    if (!newGoal.trim()) return
    
    const goalKey = `custom_${newGoal.toLowerCase().replace(/\s+/g, '_')}`
    setHealthGoals(prev => ({
      ...prev,
      [goalKey]: true
    }))
    setNewGoal("")
  }

  const removeCustomGoal = (goalKey: string) => {
    setHealthGoals(prev => {
      const { [goalKey]: _, ...rest } = prev
      return rest
    })
  }

  const isCustomGoal = (goalKey: string) => goalKey.startsWith('custom_')
  const formatGoalLabel = (goalKey: string) => {
    if (isCustomGoal(goalKey)) {
      return goalKey
        .replace('custom_', '')
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }
    return goalKey.replace(/([A-Z])/g, ' $1').trim()
  }

  const handleSave = async () => {
    if (!userProfile) {
      setSuccessMessage("Please complete your profile first")
      return
    }

    try {
      if (onSave) {
        await onSave(healthGoals)
      } else {
        await updateUserProfile({
          ...userProfile,
          healthGoals
        })
      }
      setSuccessMessage("Health goals successfully updated!")
      if (onClose) {
        onClose()
      }
    } catch (error) {
      console.error("Error updating health goals:", error)
      setSuccessMessage("Failed to update health goals. Please try again.")
    }
  }

  // Recommend goals based on user's profile
  const getRecommendedGoals = () => {
    const recommendations = []
    
    if (userProfile?.currentMedications?.length > 0) {
      recommendations.push("medicationReduction")
    }
    if (userProfile?.healthConditions?.includes("Obesity")) {
      recommendations.push("weightManagement")
    }
    if (userProfile?.healthConditions?.includes("Sleep Disorders")) {
      recommendations.push("sleepImprovement")
    }
    if (userProfile?.healthConditions?.includes("Anxiety/Depression")) {
      recommendations.push("stressReduction")
    }
    if (userProfile?.healthConditions?.includes("Hypertension")) {
      recommendations.push("bloodPressureControl")
    }
    if (userProfile?.healthConditions?.includes("Type 2 Diabetes")) {
      recommendations.push("bloodSugarControl")
    }

    return recommendations
  }

  const recommendedGoals = getRecommendedGoals()

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Set Your Health Goals</CardTitle>
            <CardDescription>
              Based on your profile, we recommend focusing on the highlighted goals
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {/* Add Custom Goal Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Add a custom goal..."
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addCustomGoal()
                }
              }}
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={addCustomGoal}
              disabled={!newGoal.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-2">
            <Label>Select Your Health Goals</Label>
            <div className="space-y-2">
              {/* Render all goals */}
              {Object.entries(healthGoals).map(([goalKey, isSelected]) => (
                <div key={goalKey} className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={goalKey}
                      checked={isSelected}
                      onCheckedChange={(checked) => updateGoal(goalKey, checked as boolean)}
                    />
                    <Label 
                      htmlFor={goalKey}
                      className={recommendedGoals.includes(goalKey) ? "font-bold text-primary" : ""}
                    >
                      {formatGoalLabel(goalKey)}
                    </Label>
                  </div>
                  {isCustomGoal(goalKey) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCustomGoal(goalKey)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} className="w-full">
          Save Health Goals
        </Button>
      </CardFooter>
      {successMessage && (
        <div className="p-4 text-sm text-center">
          {successMessage}
        </div>
      )}
    </Card>
  )
} 