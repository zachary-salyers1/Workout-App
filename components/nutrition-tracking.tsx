"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Calendar, TrendingUp, Scale, Camera, Pencil, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppContext } from "@/app/context/AppContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { FoodLabelScanner } from "./food-label-scanner"
import { MealPlanner } from "./meal-planner"

type FoodEntry = {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  servingSize: string
  timestamp: Date
}

type MeasurementEntry = {
  weight?: number
  chest?: number
  waist?: number
  hips?: number
  date: Date
}

export function NutritionTrackingComponent() {
  const { userProfile, foodEntries, addFoodEntry, updateFoodEntry, deleteFoodEntry, getFoodEntriesByDate, getWorkoutAndMealPlan } = useAppContext()
  const [searchTerm, setSearchTerm] = useState("")
  const [measurements, setMeasurements] = useState<MeasurementEntry[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [isAddMeasurementOpen, setIsAddMeasurementOpen] = useState(false)
  const [newMeasurement, setNewMeasurement] = useState<Partial<MeasurementEntry>>({})
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [dailyEntries, setDailyEntries] = useState<FoodEntry[]>([])
  const [dailyPlan, setDailyPlan] = useState<{
    workout: WorkoutPlan | null,
    mealPlan: MealPlan | null
  }>({ workout: null, mealPlan: null })
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false)
  const [newFood, setNewFood] = useState<Partial<FoodEntry>>({
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    servingSize: '1 serving'
  })

  const dailyCalorieGoal = userProfile?.dailyCalorieGoal || 2000
  const totalCalories = foodEntries.reduce((sum, entry) => sum + entry.calories, 0)

  // Fetch entries when date changes
  useEffect(() => {
    const fetchDailyData = async () => {
      try {
        const [entries, plan] = await Promise.all([
          getFoodEntriesByDate(selectedDate),
          getWorkoutAndMealPlan(selectedDate)
        ])
        setDailyEntries(entries)
        setDailyPlan(plan)
      } catch (error) {
        console.error('Error fetching daily data:', error)
      }
    }
    fetchDailyData()
  }, [selectedDate])

  const handleScanComplete = async (nutritionData: ScannedNutrition) => {
    try {
      await addFoodEntry({
        ...nutritionData,
        date: selectedDate,
        mealType: 'snack', // Default value, could add UI to select meal type
        timestamp: new Date()
      })
      // Refresh daily entries
      const updatedEntries = await getFoodEntriesByDate(selectedDate)
      setDailyEntries(updatedEntries)
      setIsScannerOpen(false)
    } catch (error) {
      console.error('Error adding food entry:', error)
    }
  }

  const handleEditEntry = async (entry: FoodEntry) => {
    try {
      await updateFoodEntry(entry.id, entry)
      setEditingEntry(null)
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error('Error updating food entry:', error)
    }
  }

  const handleDeleteEntry = async (id: string) => {
    try {
      await deleteFoodEntry(id)
    } catch (error) {
      console.error('Error deleting food entry:', error)
    }
  }

  const addMeasurement = () => {
    if (newMeasurement) {
      setMeasurements([...measurements, { ...newMeasurement, date: new Date() } as MeasurementEntry])
      setNewMeasurement({})
      setIsAddMeasurementOpen(false)
    }
  }

  const renderNutritionSummary = () => (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Calories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCalories} / {dailyCalorieGoal}</div>
          <div className="text-sm text-muted-foreground">kcal remaining</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Protein</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {foodEntries.reduce((sum, entry) => sum + entry.protein, 0)}g
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Carbs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {foodEntries.reduce((sum, entry) => sum + entry.carbs, 0)}g
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Fat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {foodEntries.reduce((sum, entry) => sum + entry.fat, 0)}g
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Update the renderDailyPlan function
  const renderDailyPlan = () => (
    <Card>
      <CardHeader>
        <CardTitle>Daily Plan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {dailyPlan.workout && (
          <div className="space-y-2">
            <h3 className="font-semibold">Workout Plan</h3>
            <div className="text-sm text-muted-foreground">
              {dailyPlan.workout.name || 'Workout scheduled for today'}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-semibold">Meals</h3>
          
          {/* Breakfast Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Breakfast</h4>
              <div className="text-sm text-muted-foreground">
                Target: {dailyPlan.mealPlan?.targetCalories ? Math.round(dailyPlan.mealPlan.targetCalories * 0.3) : 0} kcal
              </div>
            </div>
            {dailyPlan.mealPlan?.meals
              .filter(meal => meal.timeOfDay === 'breakfast')
              .map(meal => (
                <div key={meal.id} className="flex items-center justify-between pl-4 py-1">
                  <div>
                    <div className="text-sm">{meal.name}</div>
                    <div className="text-xs text-muted-foreground">
                      P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                    </div>
                  </div>
                  <div className="text-sm">{meal.calories} kcal</div>
                </div>
              ))}
          </div>

          {/* Lunch Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Lunch</h4>
              <div className="text-sm text-muted-foreground">
                Target: {dailyPlan.mealPlan?.targetCalories ? Math.round(dailyPlan.mealPlan.targetCalories * 0.35) : 0} kcal
              </div>
            </div>
            {dailyPlan.mealPlan?.meals
              .filter(meal => meal.timeOfDay === 'lunch')
              .map(meal => (
                <div key={meal.id} className="flex items-center justify-between pl-4 py-1">
                  <div>
                    <div className="text-sm">{meal.name}</div>
                    <div className="text-xs text-muted-foreground">
                      P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                    </div>
                  </div>
                  <div className="text-sm">{meal.calories} kcal</div>
                </div>
              ))}
          </div>

          {/* Dinner Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Dinner</h4>
              <div className="text-sm text-muted-foreground">
                Target: {dailyPlan.mealPlan?.targetCalories ? Math.round(dailyPlan.mealPlan.targetCalories * 0.35) : 0} kcal
              </div>
            </div>
            {dailyPlan.mealPlan?.meals
              .filter(meal => meal.timeOfDay === 'dinner')
              .map(meal => (
                <div key={meal.id} className="flex items-center justify-between pl-4 py-1">
                  <div>
                    <div className="text-sm">{meal.name}</div>
                    <div className="text-xs text-muted-foreground">
                      P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                    </div>
                  </div>
                  <div className="text-sm">{meal.calories} kcal</div>
                </div>
              ))}
          </div>

          {/* Snacks Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Snacks</h4>
              <div className="text-sm text-muted-foreground">
                Target: {dailyPlan.mealPlan?.targetCalories ? Math.round(dailyPlan.mealPlan.targetCalories * 0.1) : 0} kcal
              </div>
            </div>
            {dailyPlan.mealPlan?.meals
              .filter(meal => meal.timeOfDay === 'snack')
              .map(meal => (
                <div key={meal.id} className="flex items-center justify-between pl-4 py-1">
                  <div>
                    <div className="text-sm">{meal.name}</div>
                    <div className="text-xs text-muted-foreground">
                      P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                    </div>
                  </div>
                  <div className="text-sm">{meal.calories} kcal</div>
                </div>
              ))}
          </div>

          {/* Daily Totals */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between font-medium">
              <span>Daily Totals</span>
              <span>{dailyPlan.mealPlan?.totalCalories || 0} / {dailyPlan.mealPlan?.targetCalories || 0} kcal</span>
            </div>
            <div className="text-sm text-muted-foreground text-right">
              P: {dailyPlan.mealPlan?.totalProtein || 0}g | 
              C: {dailyPlan.mealPlan?.totalCarbs || 0}g | 
              F: {dailyPlan.mealPlan?.totalFat || 0}g
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const handleAddFood = async () => {
    try {
      if (!newFood.name) {
        setError('Please enter a food name')
        return
      }

      await addFoodEntry({
        ...newFood,
        timestamp: new Date(),
      } as FoodEntry)

      // Refresh the daily entries
      const updatedEntries = await getFoodEntriesByDate(selectedDate)
      setDailyEntries(updatedEntries)
      
      // Reset form and close dialog
      setNewFood({
        name: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        servingSize: '1 serving'
      })
      setIsAddFoodOpen(false)
    } catch (error) {
      console.error('Error adding food entry:', error)
      setError('Failed to add food entry')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {renderDailyPlan()}
        <MealPlanner selectedDate={selectedDate} />
      </div>

      <Tabs defaultValue="diary">
        <TabsList>
          <TabsTrigger value="diary">Food Diary</TabsTrigger>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="diary" className="space-y-4">
          {renderNutritionSummary()}
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Food Log</CardTitle>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Search foods..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-[200px]"
                />
                <Button variant="outline" size="icon" onClick={() => setIsScannerOpen(true)}>
                  <Camera className="h-4 w-4" />
                </Button>
                <Dialog open={isAddFoodOpen} onOpenChange={setIsAddFoodOpen}>
                  <DialogTrigger asChild>
                    <Button size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Food Entry</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Food Name</Label>
                        <Input
                          id="name"
                          value={newFood.name}
                          onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="servingSize">Serving Size</Label>
                        <Input
                          id="servingSize"
                          value={newFood.servingSize}
                          onChange={(e) => setNewFood({ ...newFood, servingSize: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="calories">Calories</Label>
                          <Input
                            id="calories"
                            type="number"
                            value={newFood.calories}
                            onChange={(e) => setNewFood({ ...newFood, calories: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="protein">Protein (g)</Label>
                          <Input
                            id="protein"
                            type="number"
                            value={newFood.protein}
                            onChange={(e) => setNewFood({ ...newFood, protein: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="carbs">Carbs (g)</Label>
                          <Input
                            id="carbs"
                            type="number"
                            value={newFood.carbs}
                            onChange={(e) => setNewFood({ ...newFood, carbs: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="fat">Fat (g)</Label>
                          <Input
                            id="fat"
                            type="number"
                            value={newFood.fat}
                            onChange={(e) => setNewFood({ ...newFood, fat: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                      <Button onClick={handleAddFood}>Add Food</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {foodEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg">
                    <div>
                      <div className="font-medium">{entry.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {entry.servingSize}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div>{entry.calories} kcal</div>
                        <div className="text-sm text-muted-foreground">
                          P: {entry.protein}g | C: {entry.carbs}g | F: {entry.fat}g
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingEntry(entry)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteEntry(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="measurements">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Body Measurements</CardTitle>
                <Dialog open={isAddMeasurementOpen} onOpenChange={setIsAddMeasurementOpen}>
                  <DialogTrigger asChild>
                    <Button>Add Measurement</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Measurement</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          value={newMeasurement.weight || ''}
                          onChange={(e) => setNewMeasurement({ ...newMeasurement, weight: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="chest">Chest (cm)</Label>
                        <Input
                          id="chest"
                          type="number"
                          value={newMeasurement.chest || ''}
                          onChange={(e) => setNewMeasurement({ ...newMeasurement, chest: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="waist">Waist (cm)</Label>
                        <Input
                          id="waist"
                          type="number"
                          value={newMeasurement.waist || ''}
                          onChange={(e) => setNewMeasurement({ ...newMeasurement, waist: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="hips">Hips (cm)</Label>
                        <Input
                          id="hips"
                          type="number"
                          value={newMeasurement.hips || ''}
                          onChange={(e) => setNewMeasurement({ ...newMeasurement, hips: parseFloat(e.target.value) })}
                        />
                      </div>
                    </div>
                    <Button onClick={addMeasurement}>Save Measurement</Button>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {measurements.map((measurement, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>{measurement.date.toLocaleDateString()}</div>
                    <div className="flex gap-4">
                      {measurement.weight && <div>Weight: {measurement.weight}kg</div>}
                      {measurement.chest && <div>Chest: {measurement.chest}cm</div>}
                      {measurement.waist && <div>Waist: {measurement.waist}cm</div>}
                      {measurement.hips && <div>Hips: {measurement.hips}cm</div>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Progress Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add charts/graphs here using your preferred charting library */}
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Trends visualization coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Scan Food Label</DialogTitle>
            <DialogDescription>
              Take a photo or upload an image of a nutrition label to automatically extract information
            </DialogDescription>
          </DialogHeader>
          <FoodLabelScanner
            onScanComplete={handleScanComplete}
            onClose={() => setIsScannerOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Food Entry</DialogTitle>
            <DialogDescription>
              Modify the details of your food entry
            </DialogDescription>
          </DialogHeader>
          {editingEntry && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Food Name</Label>
                <Input
                  id="name"
                  value={editingEntry.name}
                  onChange={(e) => setEditingEntry({
                    ...editingEntry,
                    name: e.target.value
                  })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="servingSize">Serving Size</Label>
                <Input
                  id="servingSize"
                  value={editingEntry.servingSize}
                  onChange={(e) => setEditingEntry({
                    ...editingEntry,
                    servingSize: e.target.value
                  })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={editingEntry.calories}
                    onChange={(e) => setEditingEntry({
                      ...editingEntry,
                      calories: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    value={editingEntry.protein}
                    onChange={(e) => setEditingEntry({
                      ...editingEntry,
                      protein: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    value={editingEntry.carbs}
                    onChange={(e) => setEditingEntry({
                      ...editingEntry,
                      carbs: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fat">Fat (g)</Label>
                  <Input
                    id="fat"
                    type="number"
                    value={editingEntry.fat}
                    onChange={(e) => setEditingEntry({
                      ...editingEntry,
                      fat: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
              </div>
              <Button 
                onClick={() => handleEditEntry(editingEntry)}
                className="mt-4"
              >
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 