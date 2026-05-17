import { apiRequest } from "./client";
import type { Run } from "./types";

export function listRuns() {
  return apiRequest<Run[]>("/api/runs");
}
