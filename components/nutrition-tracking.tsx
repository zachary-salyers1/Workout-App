"use client"

import { useState } from "react"
import { Search, Plus, Calendar, TrendingUp, Scale, Camera } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppContext } from "@/app/context/AppContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { FoodLabelScanner } from "./food-label-scanner"

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
  const { userProfile } = useAppContext()
  const [searchTerm, setSearchTerm] = useState("")
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([])
  const [measurements, setMeasurements] = useState<MeasurementEntry[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isAddMeasurementOpen, setIsAddMeasurementOpen] = useState(false)
  const [newMeasurement, setNewMeasurement] = useState<Partial<MeasurementEntry>>({})
  const [isScannerOpen, setIsScannerOpen] = useState(false)

  const dailyCalorieGoal = userProfile?.dailyCalorieGoal || 2000
  const totalCalories = foodEntries.reduce((sum, entry) => sum + entry.calories, 0)

  const searchFoods = async (query: string) => {
    // Implement API call to food database
    // This is where you'd integrate with a food database API
    try {
      const response = await fetch(`/api/search-foods?q=${query}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error searching foods:', error)
      return []
    }
  }

  const addFoodEntry = (food: FoodEntry) => {
    setFoodEntries([...foodEntries, { ...food, timestamp: new Date() }])
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

  const handleScanComplete = (nutritionData: ScannedNutrition) => {
    if (nutritionData.calories) {
      const newEntry: FoodEntry = {
        id: crypto.randomUUID(),
        name: nutritionData.name || "Scanned Food Item",
        calories: nutritionData.calories,
        protein: nutritionData.protein || 0,
        carbs: nutritionData.carbs || 0,
        fat: nutritionData.fat || 0,
        servingSize: nutritionData.servingSize || "1 serving",
        timestamp: new Date()
      }
      
      addFoodEntry(newEntry)
      setIsScannerOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="diary">
        <TabsList>
          <TabsTrigger value="diary">Food Diary</TabsTrigger>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="diary" className="space-y-4">
          {renderNutritionSummary()}
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Food Log</CardTitle>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search foods..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-[200px]"
                  />
                  <Button size="icon" onClick={() => setIsScannerOpen(true)}>
                    <Camera className="h-4 w-4" />
                  </Button>
                  <Button size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {foodEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{entry.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {entry.servingSize}
                      </div>
                    </div>
                    <div className="text-right">
                      <div>{entry.calories} kcal</div>
                      <div className="text-sm text-muted-foreground">
                        P: {entry.protein}g | C: {entry.carbs}g | F: {entry.fat}g
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
        <DialogContent>
          <FoodLabelScanner
            onScanComplete={handleScanComplete}
            onClose={() => setIsScannerOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
} 