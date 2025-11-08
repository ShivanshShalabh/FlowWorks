"use client";

import { useEffect } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
} from "reactflow";
import { motion } from "framer-motion";
import "reactflow/dist/style.css";

interface WorkflowVisualizerProps {
  nodes?: Node[];
  edges?: Edge[];
}

export default function WorkflowVisualizer({
  nodes = [],
  edges = [],
}: WorkflowVisualizerProps) {
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState([]);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState([]);

  // Animate nodes and edges when they change
  useEffect(() => {
    if (nodes.length > 0) {
      // Add animation properties to nodes
      const animatedNodes = nodes.map((node) => ({
        ...node,
        style: {
          ...node.style,
          opacity: 0,
        },
      }));
      setFlowNodes(animatedNodes);

      // Animate nodes in with stagger
      setTimeout(() => {
        const finalNodes = nodes.map((node) => ({
          ...node,
          style: {
            ...node.style,
            opacity: 1,
            transition: "opacity 0.5s ease-in-out, transform 0.5s ease-in-out",
            transform: "scale(1)",
          },
        }));
        setFlowNodes(finalNodes);
      }, 100);
    } else {
      setFlowNodes([]);
    }
  }, [nodes, setFlowNodes]);

  useEffect(() => {
    if (edges.length > 0) {
      // Animate edges after nodes
      setTimeout(() => {
        setFlowEdges(edges);
      }, 300);
    } else {
      setFlowEdges([]);
    }
  }, [edges, setFlowEdges]);

  const nodeTypes = {
    default: ({ data }: { data: { label: string } }) => (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="px-4 py-2 bg-sorcery-darker border-2 border-sorcery-purple rounded-lg shadow-lg hover:border-sorcery-glow transition-colors"
      >
        <div className="text-white font-medium">{data.label}</div>
      </motion.div>
    ),
  };

  return (
    <div className="w-full h-full bg-sorcery-darker rounded-lg border border-sorcery-purple/30 overflow-hidden">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        className="bg-sorcery-darker"
        style={{ background: "#050508" }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#8b5cf6"
          style={{ opacity: 0.2 }}
        />
        <Controls
          style={{
            button: {
              backgroundColor: "#1e1b4b",
              color: "#fff",
              border: "1px solid #8b5cf6",
            },
          }}
        />
        <MiniMap
          nodeColor="#8b5cf6"
          style={{
            backgroundColor: "#1e1b4b",
            border: "1px solid #8b5cf6",
          }}
        />
      </ReactFlow>
    </div>
  );
}
