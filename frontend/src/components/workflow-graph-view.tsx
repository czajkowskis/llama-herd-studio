"use client";

import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type { WorkflowGraph } from "@/lib/api";

type WorkflowGraphViewProps = {
  graph: WorkflowGraph;
};

function getNodeLabel(node: WorkflowGraph["nodes"][number]) {
  const label = node.data.label;

  if (typeof label === "string" && label.length > 0) {
    return label;
  }

  return node.type;
}

function getNodeColor(type: string) {
  if (type === "input") {
    return "var(--ctp-blue)";
  }

  if (type === "output") {
    return "var(--ctp-green)";
  }

  if (type === "agent") {
    return "var(--ctp-mauve)";
  }

  return "var(--ctp-subtext1)";
}

export function WorkflowGraphView({ graph }: WorkflowGraphViewProps) {
  const nodes: Node[] = graph.nodes.map((node, index) => ({
    id: node.id,
    type: "default",
    position: {
      x: node.position.x ?? index * 280,
      y: node.position.y ?? 0,
    },
    data: {
      label: (
        <div className="grid gap-1">
          <span className="text-sm font-medium text-[var(--ctp-text)]">
            {getNodeLabel(node)}
          </span>
          <span className="text-xs uppercase text-[var(--ctp-subtext0)]">
            {node.type}
          </span>
        </div>
      ),
    },
    style: {
      width: 180,
      background: "var(--ctp-crust)",
      border: `1px solid ${getNodeColor(node.type)}`,
      borderRadius: 8,
      color: "var(--ctp-text)",
      padding: 12,
    },
  }));

  const edges: Edge[] = graph.edges.map((edge, index) => ({
    id: edge.id ?? `${edge.source}-${edge.target}-${index}`,
    source: edge.source,
    target: edge.target,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "var(--ctp-mauve)",
    },
    style: {
      stroke: "var(--ctp-mauve)",
      strokeWidth: 2,
    },
  }));

  return (
    <div className="h-[420px] overflow-hidden rounded-md border border-[var(--ctp-surface0)] bg-[var(--ctp-crust)]">
      <ReactFlow
        colorMode="dark"
        edges={edges}
        fitView
        maxZoom={1.5}
        minZoom={0.2}
        nodes={nodes}
        nodesDraggable={false}
        nodesConnectable={false}
        panOnScroll
        proOptions={{ hideAttribution: true }}
      >
        <Background color="var(--ctp-surface1)" gap={18} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
