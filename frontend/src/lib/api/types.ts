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
