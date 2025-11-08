import { Node, Edge } from '@/app/types'

/**
 * Convert n8n workflow JSON to React Flow format (frontend version)
 * This is a simplified version for when we need to convert workflow JSON
 * that doesn't already have reactFlowData
 */
export function convertWorkflowToReactFlow(workflowJson: any): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []

  const n8nNodes = workflowJson?.nodes || []
  const nodeIdMap: { [key: string]: string } = {}

  // Create nodes
  n8nNodes.forEach((n8nNode: any, index: number) => {
    const rfNodeId = `node-${index}-${Date.now()}`
    nodeIdMap[n8nNode.id || index] = rfNodeId

    const position = n8nNode.position || [0, 0]
    const x = Array.isArray(position) ? position[0] : position.x || 0
    const y = Array.isArray(position) ? position[1] : position.y || 0

    let nodeName = n8nNode.name || n8nNode.type || 'Node'
    if (nodeName.includes('n8n-nodes-base.')) {
      nodeName = nodeName.replace('n8n-nodes-base.', '').replace(/-/g, ' ').split(' ').map((word: string) => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    }

    nodes.push({
      id: rfNodeId,
      type: 'default',
      position: { x: Number(x), y: Number(y) },
      data: { label: nodeName },
      style: {
        background: '#1e1b4b',
        color: '#fff',
        border: '2px solid #8b5cf6',
        borderRadius: '8px',
        padding: '10px',
        minWidth: '120px',
      },
    })
  })

  // Create edges from connections
  const connections = workflowJson?.connections || {}
  Object.entries(connections).forEach(([sourceNodeName, connectionData]: [string, any]) => {
    const sourceNode = n8nNodes.find((n: any) => n.name === sourceNodeName)
    if (!sourceNode) return

    const sourceRfId = nodeIdMap[sourceNode.id]
    if (!sourceRfId) return

    const mainConnections = connectionData?.main || []
    mainConnections.forEach((connectionArray: any[]) => {
      connectionArray.forEach((connection: any) => {
        const targetNodeName = connection?.node
        if (!targetNodeName) return

        const targetNode = n8nNodes.find((n: any) => n.name === targetNodeName)
        if (!targetNode) return

        const targetRfId = nodeIdMap[targetNode.id]
        if (!targetRfId) return

        edges.push({
          id: `e-${sourceRfId}-${targetRfId}-${Date.now()}`,
          source: sourceRfId,
          target: targetRfId,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#8b5cf6', strokeWidth: 2 },
        })
      })
    })
  })

  return { nodes, edges }
}

