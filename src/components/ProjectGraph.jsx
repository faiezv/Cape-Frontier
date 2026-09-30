import { useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
} from "@xyflow/react";

import ELK from "elkjs/lib/elk.bundled.js";

import "@xyflow/react/dist/style.css";

import graph from "../projectGraph.json";

const elk = new ELK();

const nodeWidth = 180;
const nodeHeight = 60;

async function layoutGraph(nodes, edges) {
  const elkGraph = {
    id: "root",

    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "DOWN",
      "elk.spacing.nodeNode": "80",
      "elk.layered.spacing.nodeNodeBetweenLayers": "120",
    },

    children: nodes.map((node) => ({
      id: node.id,
      width: nodeWidth,
      height: nodeHeight,
    })),

    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  const layout = await elk.layout(elkGraph);

  const positionedNodes = nodes.map((node) => {
    const layoutNode = layout.children.find(
      (child) => child.id === node.id
    );

    return {
      ...node,

      position: {
        x: layoutNode?.x ?? 0,
        y: layoutNode?.y ?? 0,
      },

      style: {
        width: nodeWidth,
        height: nodeHeight,
      },
    };
  });

  return positionedNodes;
}

export default function ProjectGraph() {
  const [nodes, setNodes] = useState([]);
  const [edges] = useState(graph.edges);

  useEffect(() => {
    layoutGraph(graph.nodes, graph.edges)
      .then(setNodes)
      .catch(console.error);
  }, []);

  if (!nodes.length) {
    return <div>Building project graph...</div>;
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        minZoom={0.05}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
