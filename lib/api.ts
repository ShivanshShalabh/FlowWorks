import { ApiResponse } from '@/app/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function generateWorkflow(prompt: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }

    const data: ApiResponse = await response.json()
    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to connect to the API')
  }
}

export async function debugWorkflow(
  originalPrompt: string,
  generatedJson: object,
  bugMessage: string
): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_URL}/api/debug`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        original_prompt: originalPrompt,
        generated_json: generatedJson,
        bug_message: bugMessage,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }

    const data: ApiResponse = await response.json()
    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to connect to the API')
  }
}

