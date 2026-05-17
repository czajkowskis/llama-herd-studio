import { apiRequest } from "./client";
import type { Workflow } from "./types";

export function listWorkflows() {
  return apiRequest<Workflow[]>("/api/workflows");
}
