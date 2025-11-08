// TypeScript types for API responses

export interface Node {
  id: string
  type: string
  position: { x: number; y: number }
  data: { label: string }
  style?: {
    background?: string
    color?: string
    border?: string
    borderRadius?: string
    padding?: string
    minWidth?: string
  }
}

export interface Edge {
  id: string
  source: string
  target: string
  type: string
  animated?: boolean
  style?: {
    stroke?: string
    strokeWidth?: number
  }
}

export interface ReactFlowData {
  nodes: Node[]
  edges: Edge[]
}

export interface ApiResponse {
  workflowJson: object
  reactFlowData: ReactFlowData
}

