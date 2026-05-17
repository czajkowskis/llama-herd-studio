import { apiRequest } from "./client";
import type { Workflow, WorkflowGraph } from "./types";

export type CreateWorkflowInput = {
  name: string;
  description?: string | null;
  graph: WorkflowGraph;
};

export function listWorkflows() {
  return apiRequest<Workflow[]>("/api/workflows");
}

export function createWorkflow(input: CreateWorkflowInput) {
  return apiRequest<Workflow>("/api/workflows", {
    method: "POST",
    body: input,
  });
}
