import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// You should create an assistant once and reuse its ID
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID

export async function generateWorkoutPlan(planRequest: any) {
  try {
    const thread = await openai.beta.threads.create()

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: `Create a personalized workout plan based on the following information:

      Health and Safety Considerations:
      - Medical Conditions: ${planRequest.medicalConditions?.join(', ') || 'None'}
      - Injuries or Limitations: ${planRequest.injuries || 'None'}
      - Recent Changes: ${planRequest.recentChanges || 'None'}

      Current Fitness Level: ${planRequest.fitnessLevel || 'Not specified'}

      Exercise Preferences:
      - Likes: ${planRequest.exercisePreferences?.join(', ') || 'None specified'}
      - Dislikes: ${planRequest.exerciseDislikes || 'None specified'}

      Fitness Goals:
      - Short-term: ${planRequest.shortTermGoal || 'Not specified'}
      - Long-term: ${planRequest.longTermGoal || 'Not specified'}

      Additional Information:
      - Workout Duration: ${planRequest.duration} minutes
      - Include Warm-up: ${planRequest.includeWarmup ? 'Yes' : 'No'}
      - Include Cool-down: ${planRequest.includeCooldown ? 'Yes' : 'No'}
      - Focus Area: ${planRequest.focusArea || 'Not specified'}
      - Specific Requirements: ${planRequest.specificRequirements || 'None'}

      Please provide a personalized workout plan following the ACSM guidelines. The response should be in valid JSON format with the following structure:
      {
        "weeklyWorkoutSchedule": {
          "Monday": ["Exercise 1", "Exercise 2", ...],
          "Tuesday": ["Exercise 1", "Exercise 2", ...],
          ...
        },
        "exerciseDescriptions": {
          "Exercise 1": "Description",
          "Exercise 2": "Description",
          ...
        },
        "safetyAdvice": ["Advice 1", "Advice 2", ...],
        "progressTrackingSuggestions": ["Suggestion 1", "Suggestion 2", ...]
      }`
    })

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID!,
    })

    // Poll for the run to complete
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id)
    while (runStatus.status !== "completed") {
      await new Promise(resolve => setTimeout(resolve, 1000))
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id)
    }

    // Retrieve the messages
    const messages = await openai.beta.threads.messages.list(thread.id)

    // Assume the last message is the assistant's response
    const assistantMessage = messages.data
      .filter(message => message.role === "assistant")
      .pop()

    if (!assistantMessage || !assistantMessage.content[0]) {
      throw new Error('No response from assistant')
    }

    // Assume the content is text
    const responseContent = assistantMessage.content[0]
    if (responseContent.type !== 'text') {
      throw new Error('Unexpected response type from assistant')
    }

    console.log('Raw response from assistant:', responseContent);

    // Extract the JSON string from the response
    const jsonMatch = responseContent.text.value.match(/```json\n([\s\S]*?)\n```/)
    if (!jsonMatch) {
      throw new Error('No JSON found in the assistant response')
    }

    const jsonString = jsonMatch[1]

    // Parse the response
    let parsedContent;
    try {
      parsedContent = JSON.parse(jsonString)
    } catch (error) {
      console.error('Error parsing JSON:', error);
      throw new Error(`Invalid JSON response from assistant: ${jsonString}`);
    }

    // Validate the structure of the parsed content
    if (!parsedContent.weeklyWorkoutSchedule || !parsedContent.exerciseDescriptions || !parsedContent.safetyAdvice || !parsedContent.progressTrackingSuggestions) {
      throw new Error('Invalid workout plan structure returned from assistant')
    }

    return parsedContent
  } catch (error) {
    console.error('Error in generateWorkoutPlan:', error)
    throw error
  }
}
