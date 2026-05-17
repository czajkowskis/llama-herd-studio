import { apiRequest } from "./client";
import type { Workflow, WorkflowGraph, WorkflowValidation } from "./types";

export type CreateWorkflowInput = {
  name: string;
  description?: string | null;
  graph: WorkflowGraph;
};

export type UpdateWorkflowInput = {
  name?: string;
  description?: string | null;
  graph?: WorkflowGraph;
};

export function listWorkflows() {
  return apiRequest<Workflow[]>("/api/workflows");
}

export function getWorkflow(workflowId: string) {
  return apiRequest<Workflow>(`/api/workflows/${workflowId}`);
}

export function validateWorkflow(workflowId: string) {
  return apiRequest<WorkflowValidation>(
    `/api/workflows/${workflowId}/validate`,
  );
}

export function createWorkflow(input: CreateWorkflowInput) {
  return apiRequest<Workflow>("/api/workflows", {
    method: "POST",
    body: input,
  });
}

export function updateWorkflow(workflowId: string, input: UpdateWorkflowInput) {
  return apiRequest<Workflow>(`/api/workflows/${workflowId}`, {
    method: "PATCH",
    body: input,
  });
}

export function deleteWorkflow(workflowId: string) {
  return apiRequest<void>(`/api/workflows/${workflowId}`, {
    method: "DELETE",
  });
}
