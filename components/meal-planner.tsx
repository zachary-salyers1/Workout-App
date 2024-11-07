"use client"

import { useState, useEffect } from "react"
import { Plus, Calendar, Trash2, Pencil } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useAppContext } from "@/app/context/AppContext"
import { Progress } from "@/components/ui/progress"

// Create a reusable MealForm component
function MealForm({ 
  meal, 
  onSubmit, 
  onCancel,
  title,
  savedFoods,
  onSelectSavedFood,
}: {
  meal: Partial<Meal>
  onSubmit: (meal: Partial<Meal>) => void
  onCancel: () => void
  title: string
  savedFoods: FoodEntry[]
  onSelectSavedFood: (food: FoodEntry) => void
}) {
  const [formData, setFormData] = useState(meal)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredFoods = savedFoods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSavedFoodSelect = (food: FoodEntry) => {
    setFormData({
      ...formData,
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      servingSize: food.servingSize
    })
    onSelectSavedFood(food)
  }

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      
      {/* Saved Foods Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Search Saved Foods</Label>
          <Input
            placeholder="Search foods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="max-h-40 overflow-y-auto border rounded-lg p-2">
          {filteredFoods.length > 0 ? (
            filteredFoods.map((food) => (
              <div
                key={food.id}
                className="flex items-center justify-between p-2 hover:bg-accent rounded-lg cursor-pointer"
                onClick={() => handleSavedFoodSelect(food)}
              >
                <div>
                  <p className="font-medium">{food.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {food.calories} kcal | P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-4">
              {searchTerm ? "No matching foods found" : "Your saved foods will appear here"}
            </div>
          )}
        </div>
      </div>

      {/* Manual Input Section */}
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Name</Label>
          <Input
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Meal name"
          />
        </div>
        <div className="grid gap-2">
          <Label>Time of Day</Label>
          <Select
            value={formData.timeOfDay}
            onValueChange={(value) => setFormData({ ...formData, timeOfDay: value as MealTimeOfDay })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="breakfast">Breakfast</SelectItem>
              <SelectItem value="lunch">Lunch</SelectItem>
              <SelectItem value="dinner">Dinner</SelectItem>
              <SelectItem value="snack">Snack</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Calories</Label>
            <Input
              type="number"
              value={formData.calories || ''}
              onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Protein (g)</Label>
            <Input
              type="number"
              value={formData.protein || ''}
              onChange={(e) => setFormData({ ...formData, protein: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Carbs (g)</Label>
            <Input
              type="number"
              value={formData.carbs || ''}
              onChange={(e) => setFormData({ ...formData, carbs: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Fat (g)</Label>
            <Input
              type="number"
              value={formData.fat || ''}
              onChange={(e) => setFormData({ ...formData, fat: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSubmit(formData)}>
          Save
        </Button>
      </div>
    </div>
  )
}

export function MealPlanner({ selectedDate }: { selectedDate: string }) {
  const { getMealPlanWithWorkout, updateMealCompletion, calculateNutritionTargets, addMealToPlan, getSavedFoods, deleteMealFromPlan, editMealInPlan } = useAppContext()
  const [mealPlanData, setMealPlanData] = useState<{
    mealPlan: MealPlan | null,
    workout: WorkoutPlan | null
  }>({ mealPlan: null, workout: null })
  const [isAddMealOpen, setIsAddMealOpen] = useState(false)
  const [savedFoods, setSavedFoods] = useState<FoodEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [newMeal, setNewMeal] = useState<Partial<Meal>>({
    timeOfDay: 'breakfast',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  })
  const [isEditMealOpen, setIsEditMealOpen] = useState(false)
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null)
        const data = await getMealPlanWithWorkout(selectedDate)
        setMealPlanData(data)
      } catch (error) {
        console.error('Error fetching meal plan data:', error)
        setError('Failed to load meal plan data')
      }
    }
    fetchData()
  }, [selectedDate])

  useEffect(() => {
    if (isAddMealOpen) {
      const fetchSavedFoods = async () => {
        try {
          const foods = await getSavedFoods()
          setSavedFoods(foods)
        } catch (error) {
          console.error('Error fetching saved foods:', error)
        }
      }
      fetchSavedFoods()
    }
  }, [isAddMealOpen])

  const handleSelectSavedFood = (food: FoodEntry) => {
    setNewMeal({
      ...newMeal,
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      servingSize: food.servingSize
    })
  }

  const handleMealCompletion = async (mealId: string, isCompleted: boolean) => {
    try {
      await updateMealCompletion(selectedDate, mealId, isCompleted)
      const updatedData = await getMealPlanWithWorkout(selectedDate)
      setMealPlanData(updatedData)
    } catch (error) {
      console.error('Error updating meal completion:', error)
    }
  }

  const renderNutritionProgress = () => {
    const { mealPlan } = mealPlanData
    if (!mealPlan) return null

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <NutritionCard
            title="Calories"
            current={mealPlan.totalCalories}
            target={mealPlan.targetCalories}
            unit="kcal"
          />
          <NutritionCard
            title="Protein"
            current={mealPlan.totalProtein}
            target={mealPlan.targetProtein}
            unit="g"
          />
          <NutritionCard
            title="Carbs"
            current={mealPlan.totalCarbs}
            target={mealPlan.targetCarbs}
            unit="g"
          />
          <NutritionCard
            title="Fat"
            current={mealPlan.totalFat}
            target={mealPlan.targetFat}
            unit="g"
          />
        </div>
      </div>
    )
  }

  const handleSaveMeal = async (mealData: Partial<Meal>) => {
    try {
      setError(null)
      if (!mealData.name || !mealData.timeOfDay) {
        setError('Please fill in all required fields')
        return
      }

      if (editingMeal) {
        await editMealInPlan(selectedDate, editingMeal.id, mealData)
      } else {
        await addMealToPlan(selectedDate, mealData as Omit<Meal, 'id'>)
      }

      const updatedData = await getMealPlanWithWorkout(selectedDate)
      setMealPlanData(updatedData)
      setIsAddMealOpen(false)
      setIsEditMealOpen(false)
      setEditingMeal(null)
      setNewMeal({
        timeOfDay: 'breakfast',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      })
    } catch (error) {
      console.error('Error saving meal:', error)
      setError('Failed to save meal')
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Meal Plan</CardTitle>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Dialog open={isAddMealOpen} onOpenChange={setIsAddMealOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Meal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <MealForm
              meal={newMeal}
              onSubmit={handleSaveMeal}
              onCancel={() => setIsAddMealOpen(false)}
              title="Add New Meal"
              savedFoods={savedFoods}
              onSelectSavedFood={(food) => {
                setNewMeal({
                  ...newMeal,
                  name: food.name,
                  calories: food.calories,
                  protein: food.protein,
                  carbs: food.carbs,
                  fat: food.fat,
                  servingSize: food.servingSize
                })
              }}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {mealPlanData.workout && (
          <div className="mb-4 text-sm text-muted-foreground">
            Workout scheduled for today: {mealPlanData.workout.name || 'Unnamed workout'}
          </div>
        )}
        {mealPlanData.mealPlan?.meals.map((meal) => (
          <div key={meal.id} className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold capitalize">{meal.timeOfDay}</h3>
              <div className="text-sm text-muted-foreground">
                {meal.name} - {meal.calories} kcal
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor={`meal-${meal.id}`} className="text-sm">
                  Completed
                </Label>
                <Checkbox
                  id={`meal-${meal.id}`}
                  checked={meal.isCompleted}
                  onCheckedChange={(isCompleted) => 
                    handleMealCompletion(meal.id, isCompleted === true)
                  }
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setEditingMeal(meal)
                  setIsEditMealOpen(true)
                }}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit meal</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive/90"
                onClick={() => handleDeleteMeal(meal.id)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete meal</span>
              </Button>
            </div>
          </div>
        ))}

        {/* Edit Meal Dialog */}
        <Dialog open={isEditMealOpen} onOpenChange={setIsEditMealOpen}>
          <DialogContent>
            <MealForm
              meal={editingMeal || {}}
              onSubmit={handleSaveMeal}
              onCancel={() => {
                setIsEditMealOpen(false)
                setEditingMeal(null)
              }}
              title="Edit Meal"
              savedFoods={savedFoods}
              onSelectSavedFood={(food) => {
                setEditingMeal(editingMeal ? {
                  ...editingMeal,
                  name: food.name,
                  calories: food.calories,
                  protein: food.protein,
                  carbs: food.carbs,
                  fat: food.fat,
                  servingSize: food.servingSize
                } : null)
              }}
            />
          </DialogContent>
        </Dialog>

        {renderNutritionProgress()}
      </CardContent>
    </Card>
  )
}

function NutritionCard({ title, current, target, unit }: {
  title: string
  current: number
  target: number
  unit: string
}) {
  const percentage = Math.min(Math.round((current / target) * 100), 100)
  
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-2">
        <Progress value={percentage} />
      </div>
      <p className="mt-2 text-sm">
        {current}/{target}{unit}
      </p>
    </div>
  )
} 