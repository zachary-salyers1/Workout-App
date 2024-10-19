import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

type EditWorkoutPlanComponentProps = {
  workoutPlan: WorkoutPlan
  onSave: (updatedPlan: WorkoutPlan) => void
  onCancel: () => void
}

export function EditWorkoutPlanComponent({ workoutPlan, onSave, onCancel }: EditWorkoutPlanComponentProps) {
  const [editedPlan, setEditedPlan] = useState(workoutPlan)

  const handleExerciseChange = (day: string, index: number, field: string, value: string | number) => {
    setEditedPlan(prev => ({
      ...prev,
      detailedWorkoutPlan: {
        ...prev.detailedWorkoutPlan,
        [day]: {
          ...prev.detailedWorkoutPlan[day],
          exercises: prev.detailedWorkoutPlan[day].exercises.map((exercise, i) =>
            i === index ? { ...exercise, [field]: value } : exercise
          )
        }
      }
    }))
  }

  const addExercise = (day: string) => {
    setEditedPlan(prev => ({
      ...prev,
      detailedWorkoutPlan: {
        ...prev.detailedWorkoutPlan,
        [day]: {
          ...prev.detailedWorkoutPlan[day],
          exercises: [
            ...prev.detailedWorkoutPlan[day].exercises,
            { name: "", sets: 3, reps: 10, rest: 60 }
          ]
        }
      }
    }))
  }

  const removeExercise = (day: string, index: number) => {
    setEditedPlan(prev => ({
      ...prev,
      detailedWorkoutPlan: {
        ...prev.detailedWorkoutPlan,
        [day]: {
          ...prev.detailedWorkoutPlan[day],
          exercises: prev.detailedWorkoutPlan[day].exercises.filter((_, i) => i !== index)
        }
      }
    }))
  }

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[60vh] pr-4">
        <Accordion type="single" collapsible className="w-full">
          {Object.entries(editedPlan.detailedWorkoutPlan).map(([day, workout]) => (
            <AccordionItem key={day} value={day}>
              <AccordionTrigger>{day}</AccordionTrigger>
              <AccordionContent>
                {workout.exercises.map((exercise, index) => (
                  <div key={index} className="grid grid-cols-6 gap-2 mb-2 items-center">
                    <Input
                      value={exercise.name}
                      onChange={(e) => handleExerciseChange(day, index, 'name', e.target.value)}
                      placeholder="Exercise"
                      className="col-span-2"
                    />
                    <Input
                      type="number"
                      value={exercise.sets}
                      onChange={(e) => handleExerciseChange(day, index, 'sets', parseInt(e.target.value))}
                      placeholder="Sets"
                    />
                    <Input
                      type="number"
                      value={exercise.reps}
                      onChange={(e) => handleExerciseChange(day, index, 'reps', parseInt(e.target.value))}
                      placeholder="Reps"
                    />
                    <Input
                      type="number"
                      value={exercise.rest}
                      onChange={(e) => handleExerciseChange(day, index, 'rest', parseInt(e.target.value))}
                      placeholder="Rest (s)"
                    />
                    <Button 
                      onClick={() => removeExercise(day, index)}
                      variant="destructive"
                      size="sm"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button 
                  onClick={() => addExercise(day)}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Add Exercise
                </Button>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
      <div className="flex justify-end space-x-2 pt-4">
        <Button onClick={onCancel} variant="outline">Cancel</Button>
        <Button onClick={() => onSave(editedPlan)}>Save Changes</Button>
      </div>
    </div>
  )
}
