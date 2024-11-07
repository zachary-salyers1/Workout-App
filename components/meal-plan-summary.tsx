"use client"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

type MealPlanSummaryProps = {
  mealPlan: {
    meals: Array<{
      id: string
      name: string
      timeOfDay: string
      calories: number
      protein: number
      carbs: number
      fat: number
    }>
    targetCalories: number
    totalCalories: number
    totalProtein: number
    totalCarbs: number
    totalFat: number
  }
  onViewFullPlan: () => void
}

export function MealPlanSummaryCard({ mealPlan, onViewFullPlan }: MealPlanSummaryProps) {
  const calorieProgress = Math.min(Math.round((mealPlan.totalCalories / mealPlan.targetCalories) * 100), 100)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Meals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Calorie Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Daily Calories</span>
            <span>{mealPlan.totalCalories} / {mealPlan.targetCalories} kcal</span>
          </div>
          <Progress value={calorieProgress} />
        </div>

        {/* Meal List */}
        <div className="space-y-3">
          {mealPlan.meals.map((meal) => (
            <div key={meal.id} className="flex items-center justify-between py-1">
              <div>
                <div className="font-medium capitalize">{meal.timeOfDay}</div>
                <div className="text-sm text-muted-foreground">{meal.name}</div>
              </div>
              <div className="text-sm space-y-1">
                <div>{meal.calories} kcal</div>
                <div className="text-xs text-muted-foreground">
                  P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                </div>
              </div>
            </div>
          ))}
          {mealPlan.meals.length === 0 && (
            <p className="text-muted-foreground">No meals planned for today</p>
          )}
        </div>

        {/* Macro Summary */}
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <div className="font-medium">Protein</div>
            <div className="text-muted-foreground">{mealPlan.totalProtein}g</div>
          </div>
          <div>
            <div className="font-medium">Carbs</div>
            <div className="text-muted-foreground">{mealPlan.totalCarbs}g</div>
          </div>
          <div>
            <div className="font-medium">Fat</div>
            <div className="text-muted-foreground">{mealPlan.totalFat}g</div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={onViewFullPlan}>
          View Full Meal Plan
        </Button>
      </CardFooter>
    </Card>
  )
} 