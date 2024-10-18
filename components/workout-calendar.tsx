import React, { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from 'date-fns'
import { useAppContext } from '@/app/context/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type WorkoutCalendarProps = {
  onDateSelect: (date: Date) => void
}

export function WorkoutCalendar({ onDateSelect }: WorkoutCalendarProps) {
  const { workoutPlan } = useAppContext()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const goToPreviousMonth = () => setCurrentDate(prevDate => subMonths(prevDate, 1))
  const goToNextMonth = () => setCurrentDate(prevDate => addMonths(prevDate, 1))

  const handleDateClick = (day: Date) => {
    onDateSelect(day)
    const dateString = format(day, 'yyyy-MM-dd')
    const workout = workoutPlan?.detailedWorkoutPlan?.[dateString]
    setSelectedWorkout(workout)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {format(currentDate, 'MMMM yyyy')}
        </CardTitle>
        <div>
          <Button variant="outline" size="icon" onClick={goToPreviousMonth} className="mr-2">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-bold">{day}</div>
          ))}
          {monthDays.map(day => {
            const dateString = format(day, 'yyyy-MM-dd')
            const workout = workoutPlan?.detailedWorkoutPlan?.[dateString]
            return (
              <div
                key={day.toString()}
                className={`p-2 border ${!isSameMonth(day, monthStart) ? 'text-gray-300' : ''} ${isToday(day) ? 'bg-blue-100' : ''} cursor-pointer`}
                onClick={() => handleDateClick(day)}
              >
                <div>{format(day, 'd')}</div>
                {workout && (
                  <div className="text-xs text-blue-600">
                    {workout.exercises.length} exercises
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {selectedWorkout && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mt-4">View Workout Details</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Workout for {format(currentDate, 'MMMM d, yyyy')}</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                {selectedWorkout.exercises.map((exercise: any, index: number) => (
                  <div key={index} className="mb-4">
                    <h3 className="font-semibold">{exercise.name}</h3>
                    <p className="text-sm text-gray-600">{exercise.description}</p>
                    <p>Sets: {exercise.sets}, Reps: {exercise.reps}, Rest: {exercise.rest}s</p>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  )
}
