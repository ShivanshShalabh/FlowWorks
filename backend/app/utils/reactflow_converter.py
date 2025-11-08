from typing import Dict, Any, List
import uuid


def convert_n8n_to_reactflow(workflow_json: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert n8n workflow format to React Flow format.
    
    Args:
        workflow_json: n8n workflow JSON object
        
    Returns:
        Dictionary with 'nodes' and 'edges' arrays formatted for React Flow
    """
    nodes = []
    edges = []
    
    # Extract nodes from n8n workflow
    n8n_nodes = workflow_json.get('nodes', [])
    
    # Create a mapping from n8n node IDs to React Flow node IDs
    node_id_map = {}
    
    for n8n_node in n8n_nodes:
        # Generate a unique React Flow node ID
        rf_node_id = f"node-{uuid.uuid4().hex[:8]}"
        node_id_map[n8n_node.get('id', '')] = rf_node_id
        
        # Extract position - n8n uses [x, y] array
        position = n8n_node.get('position', [0, 0])
        if isinstance(position, list) and len(position) >= 2:
            x, y = position[0], position[1]
        else:
            x, y = 0, 0
        
        # Get node name/type for label
        node_name = n8n_node.get('name', n8n_node.get('type', 'Node'))
        # Clean up node type name (remove 'n8n-nodes-base.' prefix if present)
        if 'n8n-nodes-base.' in node_name:
            node_name = node_name.replace('n8n-nodes-base.', '').title()
        
        # Create React Flow node
        rf_node = {
            'id': rf_node_id,
            'type': 'default',
            'position': {'x': float(x), 'y': float(y)},
            'data': {'label': node_name},
            'style': {
                'background': '#1e1b4b',
                'color': '#fff',
                'border': '2px solid #8b5cf6',
                'borderRadius': '8px',
                'padding': '10px',
                'minWidth': '120px',
            }
        }
        
        nodes.append(rf_node)
    
    # Extract connections from n8n workflow
    connections = workflow_json.get('connections', {})
    
    # n8n connections structure: { "NodeName": { "main": [[{ node: "TargetNode", type: "main", index: 0 }]] } }
    for source_node_name, connection_data in connections.items():
        # Find the source node ID
        source_n8n_node = next(
            (n for n in n8n_nodes if n.get('name') == source_node_name),
            None
        )
        
        if not source_n8n_node:
            continue
        
        source_rf_id = node_id_map.get(source_n8n_node.get('id', ''))
        if not source_rf_id:
            continue
        
        # Process main connections
        main_connections = connection_data.get('main', [])
        for connection_array in main_connections:
            for connection in connection_array:
                target_node_name = connection.get('node', '')
                
                # Find the target node
                target_n8n_node = next(
                    (n for n in n8n_nodes if n.get('name') == target_node_name),
                    None
                )
                
                if not target_n8n_node:
                    continue
                
                target_rf_id = node_id_map.get(target_n8n_node.get('id', ''))
                if not target_rf_id:
                    continue
                
                # Create React Flow edge
                edge = {
                    'id': f"e-{uuid.uuid4().hex[:8]}",
                    'source': source_rf_id,
                    'target': target_rf_id,
                    'type': 'smoothstep',
                    'animated': True,
                    'style': {'stroke': '#8b5cf6', 'strokeWidth': 2}
                }
                
                edges.append(edge)
    
    return {
        'nodes': nodes,
        'edges': edges
    }

