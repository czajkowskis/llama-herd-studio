import { apiRequest } from "./client";
import type { CreateRunInput, Run, RunDetail } from "./types";

export function listRuns() {
  return apiRequest<Run[]>("/api/runs");
}
export function createWorkflowRun(workflowId: string, input: CreateRunInput) {
  return apiRequest<RunDetail>(`/api/workflows/${workflowId}/runs`, {
    method: "POST",
    body: input,
  });
}
