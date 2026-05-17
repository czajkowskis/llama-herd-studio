export type RunsByStatus = {
  pending: number;
  running: number;
  success: number;
  failed: number;
};

export type RecentRun = {
  id: string;
  workflow_id: string;
  workflow_name: string;
  status: string;
  started_at: string;
  finished_at: string | null;
};

export type DashboardSummary = {
  total_agents: number;
  total_workflows: number;
  total_runs: number;
  runs_by_status: RunsByStatus;
  recent_runs: RecentRun[];
};

export type Run = {
  id: string;
  workflow_id: string;
  status: string;
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  error: string | null;
  started_at: string;
  finished_at: string | null;
};

export type WorkflowGraph = {
  nodes: Array<{
    id: string;
    type: string;
    data: Record<string, unknown>;
    position: Record<string, number>;
  }>;
  edges: Array<{
    id: string | null;
    source: string;
    target: string;
    data: Record<string, unknown>;
  }>;
};

export type Workflow = {
  id: string;
  name: string;
  description: string | null;
  graph: WorkflowGraph;
  created_at: string;
  updated_at: string;
};

export type RunEvent = {
  id: string;
  run_id: string;
  sequence: number;
  event_type: string;
  node_id: string | null;
  agent_id: string | null;
  payload: Record<string, unknown>;
  timestamp: string;
};

export type RunReplay = {
  run: Run;
  workflow: Workflow;
  events: RunEvent[];
};
