// Mock data for Phase 1 - "Hollywood" Frontend

export const mock_nodes = [
  {
    id: 'webhook-1',
    type: 'default',
    position: { x: 100, y: 100 },
    data: { label: 'Webhook' },
    style: {
      background: '#1e1b4b',
      color: '#fff',
      border: '2px solid #8b5cf6',
      borderRadius: '8px',
      padding: '10px',
      minWidth: '120px',
    },
  },
  {
    id: 'slack-1',
    type: 'default',
    position: { x: 400, y: 100 },
    data: { label: 'Slack' },
    style: {
      background: '#1e1b4b',
      color: '#fff',
      border: '2px solid #8b5cf6',
      borderRadius: '8px',
      padding: '10px',
      minWidth: '120px',
    },
  },
]

export const mock_edges = [
  {
    id: 'e1-2',
    source: 'webhook-1',
    target: 'slack-1',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#8b5cf6', strokeWidth: 2 },
  },
]

export const mock_json = {
  name: 'Webhook to Slack',
  nodes: [
    {
      parameters: {},
      id: 'webhook-1',
      name: 'Webhook',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 1,
      position: [100, 100],
      webhookId: 'demo-webhook-id',
    },
    {
      parameters: {
        channel: '{{ $json.channel }}',
        text: '{{ $json.message }}',
      },
      id: 'slack-1',
      name: 'Slack',
      type: 'n8n-nodes-base.slack',
      typeVersion: 1,
      position: [400, 100],
    },
  ],
  connections: {
    Webhook: {
      main: [[{ node: 'Slack', type: 'main', index: 0 }]],
    },
  },
  pinData: {},
  settings: {
    executionOrder: 'v1',
  },
  staticData: null,
  tags: [],
  triggerCount: 0,
  updatedAt: '2024-01-01T00:00:00.000Z',
  versionId: '1',
}

