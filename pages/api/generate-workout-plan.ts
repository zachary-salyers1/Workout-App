import type { NextApiRequest, NextApiResponse } from 'next'
import { generateWorkoutPlan } from '@/lib/workout-generator'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const planRequest = req.body
      console.log('Received plan request:', planRequest);
      const workoutPlan = await generateWorkoutPlan(planRequest)
      res.status(200).json(workoutPlan)
    } catch (error) {
      console.error('Error in generate-workout-plan API:', error);
      
      res.status(500).json({ 
        error: 'Failed to generate workout plan', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
