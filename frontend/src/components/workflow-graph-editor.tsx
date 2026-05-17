"use client";

import {
  addEdge,
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type NodeChange,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect, useMemo, useState } from "react";

import type { Agent, WorkflowGraph } from "@/lib/api";

type WorkflowGraphEditorProps = {
  agents: Agent[];
  graph: WorkflowGraph;
  onChange: (graph: WorkflowGraph) => void;
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

function toReactFlowNodes(graph: WorkflowGraph): Node[] {
  return graph.nodes.map((node, index) => ({
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
      original: node,
    },
    style: {
      width: 180,
      background: "var(--ctp-crust)",
      border: `1px solid ${getNodeColor(node.type)}`,
      borderRadius: 8,
      color: "var(--ctp-text)",
      padding: 12,
    },
    selectable: true,
    deletable: true,
  }));
}

function toReactFlowEdges(graph: WorkflowGraph): Edge[] {
  return graph.edges.map((edge, index) => ({
    id: edge.id ?? `${edge.source}-${edge.target}-${index}`,
    source: edge.source,
    target: edge.target,
    data: {
      original: edge,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "var(--ctp-mauve)",
    },
    style: {
      stroke: "var(--ctp-mauve)",
      strokeWidth: 2,
    },
    selectable: true,
    deletable: true,
  }));
}

function toWorkflowGraph(nodes: Node[], edges: Edge[]): WorkflowGraph {
  return {
    nodes: nodes.map((node) => {
      const original = node.data.original as WorkflowGraph["nodes"][number];

      return {
        ...original,
        position: {
          x: node.position.x,
          y: node.position.y,
        },
      };
    }),
    edges: edges.map((edge) => {
      const original = edge.data?.original as
        | WorkflowGraph["edges"][number]
        | undefined;

      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        data: original?.data ?? {},
      };
    }),
  };
}

export function WorkflowGraphEditor({
  agents,
  graph,
  onChange,
}: WorkflowGraphEditorProps) {
  const [selectedAgentId, setSelectedAgentId] = useState(agents[0]?.id ?? "");
  const [nodes, setNodes, onNodesChange] = useNodesState(
    toReactFlowNodes(graph),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    toReactFlowEdges(graph),
  );
  const selectedAgent = useMemo(
    () => agents.find((agent) => agent.id === selectedAgentId),
    [agents, selectedAgentId],
  );

  useEffect(() => {
    onChange(toWorkflowGraph(nodes, edges));
  }, [edges, nodes, onChange]);

  function handleNodesChange(changes: NodeChange[]) {
    onNodesChange(changes);
  }

  function handleEdgesChange(changes: Parameters<typeof onEdgesChange>[0]) {
    onEdgesChange(changes);
  }

  function handleConnect(connection: Connection) {
    setEdges((currentEdges) => {
      const nextEdges = addEdge(
        {
          ...connection,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "var(--ctp-mauve)",
          },
          style: {
            stroke: "var(--ctp-mauve)",
            strokeWidth: 2,
          },
          data: {
            original: {
              id: null,
              source: connection.source ?? "",
              target: connection.target ?? "",
              data: {},
            },
          },
          selectable: true,
          deletable: true,
        },
        currentEdges,
      );

      return nextEdges;
    });
  }

  function createNode(type: "input" | "output" | "agent") {
    if (type === "agent" && !selectedAgent) {
      return;
    }

    const sameTypeCount = nodes.filter((node) => {
      const original = node.data.original as WorkflowGraph["nodes"][number];
      return original.type === type;
    }).length;
    const id = `${type}-${crypto.randomUUID()}`;
    const label =
      type === "agent" && selectedAgent
        ? selectedAgent.name
        : `${type[0].toUpperCase()}${type.slice(1)} ${sameTypeCount + 1}`;
    const position = {
      x: 120 + sameTypeCount * 240,
      y: 120 + sameTypeCount * 80,
    };
    const workflowNode: WorkflowGraph["nodes"][number] = {
      id,
      type,
      data:
        type === "agent" && selectedAgent
          ? {
              label,
              agent_id: selectedAgent.id,
            }
          : { label },
      position,
    };
    const [reactFlowNode] = toReactFlowNodes({
      nodes: [workflowNode],
      edges: [],
    });

    setNodes((currentNodes) => [...currentNodes, reactFlowNode]);
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-end gap-2 rounded-md border border-[var(--ctp-surface0)] bg-[var(--ctp-crust)] p-3">
        <button
          className="rounded-md border border-[var(--ctp-blue)]/50 px-3 py-2 text-sm text-[var(--ctp-blue)] transition hover:bg-[var(--ctp-blue)]/10"
          type="button"
          onClick={() => createNode("input")}
        >
          Add Input
        </button>
        <button
          className="rounded-md border border-[var(--ctp-green)]/50 px-3 py-2 text-sm text-[var(--ctp-green)] transition hover:bg-[var(--ctp-green)]/10"
          type="button"
          onClick={() => createNode("output")}
        >
          Add Output
        </button>
        <label className="grid gap-1">
          <span className="text-xs text-[var(--ctp-subtext0)]">Agent</span>
          <select
            className="min-w-56 rounded-md border border-[var(--ctp-surface1)] bg-[var(--ctp-mantle)] px-3 py-2 text-sm outline-none transition focus:border-[var(--ctp-mauve)]"
            value={selectedAgentId}
            onChange={(event) => setSelectedAgentId(event.target.value)}
          >
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
        </label>
        <button
          className="rounded-md border border-[var(--ctp-mauve)]/50 px-3 py-2 text-sm text-[var(--ctp-mauve)] transition hover:bg-[var(--ctp-mauve)]/10 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!selectedAgent}
          type="button"
          onClick={() => createNode("agent")}
        >
          Add Agent
        </button>
      </div>

      <div className="h-[640px] overflow-hidden rounded-md border border-[var(--ctp-surface0)] bg-[var(--ctp-crust)]">
        <ReactFlow
          colorMode="dark"
          edges={edges}
          fitView
          maxZoom={1.5}
          minZoom={0.2}
          nodes={nodes}
          onConnect={handleConnect}
          onEdgesChange={handleEdgesChange}
          onNodesChange={handleNodesChange}
          panOnScroll
          proOptions={{ hideAttribution: true }}
          deleteKeyCode={["Backspace", "Delete"]}
          nodesFocusable
          edgesFocusable
        >
          <Background color="var(--ctp-surface1)" gap={18} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
