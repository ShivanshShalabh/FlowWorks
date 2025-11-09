import { ApiResponse } from '@/app/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface StatusUpdate {
  status: 'info' | 'success' | 'warning' | 'error' | 'progress' | 'complete'
  message: string
  details?: Record<string, any>
  result?: ApiResponse
}

export type StatusCallback = (update: StatusUpdate) => void

export async function generateWorkflow(
  prompt: string,
  onStatusUpdate?: StatusCallback
): Promise<ApiResponse> {
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

    // Handle Server-Sent Events stream
    if (!response.body) {
      throw new Error('No response body')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            
            if (onStatusUpdate) {
              onStatusUpdate(data as StatusUpdate)
            }

            // If this is the final result, return it
            if (data.status === 'complete' && data.result) {
              return data.result as ApiResponse
            }

            // If there's an error, throw it
            if (data.status === 'error') {
              throw new Error(data.message || 'Unknown error occurred')
            }
          } catch (e) {
            // Ignore JSON parse errors for non-data lines
            if (e instanceof SyntaxError) {
              continue
            }
            throw e
          }
        }
      }
    }

    throw new Error('Stream ended without complete result')
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

