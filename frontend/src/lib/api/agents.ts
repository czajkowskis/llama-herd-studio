import { apiRequest } from "./client";
import type { Agent } from "./types";

export type CreateAgentInput = {
  name: string;
  description?: string | null;
  system_prompt: string;
  model_provider: string;
  model_name: string;
  config: {
    temperature: number;
    max_tokens: number | null;
    tools: string[];
  };
};

export function listAgents() {
  return apiRequest<Agent[]>("/api/agents");
}

export function createAgent(input: CreateAgentInput) {
  return apiRequest<Agent>("/api/agents", {
    method: "POST",
    body: input,
  });
}
