import { apiRequest } from "./client";
import type { RunReplay } from "./types";

export function getRunReplay(runId: string) {
  return apiRequest<RunReplay>(`/api/runs/${runId}/replay`);
}
