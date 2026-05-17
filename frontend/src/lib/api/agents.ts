import { apiRequest } from "./client";
import type { Agent } from "./types";

export function listAgents() {
  return apiRequest<Agent[]>("/api/agents");
}
