"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { getAgent, updateAgent } from "@/lib/api";
import type { Agent } from "@/lib/api";

const modelProviders = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "google", label: "Google" },
  { value: "ollama", label: "Ollama" },
];

const modelNamesByProvider: Record<string, { value: string; label: string }[]> = {
  openai: [
    { value: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
    { value: "gpt-4.1", label: "GPT-4.1" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  ],
  anthropic: [
    { value: "claude-3-5-sonnet-latest", label: "Claude 3.5 Sonnet" },
    { value: "claude-3-5-haiku-latest", label: "Claude 3.5 Haiku" },
  ],
  google: [
    { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
    { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
  ],
  ollama: [
    { value: "llama3.1", label: "Llama 3.1" },
    { value: "mistral", label: "Mistral" },
  ],
};

const toolOptions = [
  { value: "search", label: "Search" },
  { value: "calculator", label: "Calculator" },
  { value: "code_interpreter", label: "Code Interpreter" },
  { value: "web_browser", label: "Web Browser" },
];

export default function EditAgentPage() {
  const router = useRouter();
  const params = useParams<{ agentId: string }>();
  const agentId = params.agentId;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [modelProvider, setModelProvider] = useState("openai");
  const [modelName, setModelName] = useState("gpt-4.1-mini");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState("");
  const [tools, setTools] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const availableModels = modelNamesByProvider[modelProvider] ?? [];

  useEffect(() => {
    async function loadAgent() {
      setError(null);
      setIsLoading(true);

      try {
        const loadedAgent = await getAgent(agentId);
        setAgent(loadedAgent);
        setName(loadedAgent.name);
        setDescription(loadedAgent.description ?? "");
        setSystemPrompt(loadedAgent.system_prompt);
        setModelProvider(loadedAgent.model_provider);
        setModelName(loadedAgent.model_name);
        setTemperature(loadedAgent.config.temperature);
        setMaxTokens(
          loadedAgent.config.max_tokens === null
            ? ""
            : String(loadedAgent.config.max_tokens),
        );
        setTools(loadedAgent.config.tools);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Failed to load agent.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadAgent();
  }, [agentId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      await updateAgent(agentId, {
        name,
        description: description || null,
        system_prompt: systemPrompt,
        model_provider: modelProvider,
        model_name: modelName,
        config: {
          temperature,
          max_tokens: maxTokens ? Number(maxTokens) : null,
          tools,
        },
      });

      router.push(`/agents/${agentId}`);
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to update agent.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <p className="text-[var(--ctp-subtext0)]">Loading agent...</p>;
  }

  if (!agent) {
    return (
      <p className="text-[var(--ctp-red)]">
        {error ?? "Agent could not be loaded."}
      </p>
    );
  }

  return (
    <>
      <section className="mb-6">
        <Link
          className="mb-3 inline-flex items-center gap-2 text-sm text-[var(--ctp-subtext1)] transition hover:text-[var(--ctp-mauve)]"
          href={`/agents/${agentId}`}
        >
          <ArrowLeft size={16} />
          Agent Detail
        </Link>

        <p className="mb-1 text-sm text-[var(--ctp-mauve)]">Agent Registry</p>
        <h1 className="text-3xl font-semibold tracking-normal">Edit Agent</h1>
      </section>

      <form
        className="grid max-w-4xl gap-5 rounded-lg border border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)] p-5"
        onSubmit={handleSubmit}
      >
        {error && (
          <div className="rounded-md border border-[var(--ctp-red)]/40 bg-[var(--ctp-red)]/10 px-3 py-2 text-sm text-[var(--ctp-red)]">
            {error}
          </div>
        )}

        <section className="grid gap-4">
          <div>
            <h2 className="text-base font-semibold">Basics</h2>
            <p className="mt-1 text-sm text-[var(--ctp-subtext0)]">
              Update how this agent appears in workflows.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm text-[var(--ctp-subtext1)]">Name</span>
              <input
                className="rounded-md border border-[var(--ctp-surface1)] bg-[var(--ctp-crust)] px-3 py-2 text-sm outline-none transition focus:border-[var(--ctp-mauve)]"
                minLength={1}
                maxLength={255}
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-[var(--ctp-subtext1)]">
                Description
              </span>
              <input
                className="rounded-md border border-[var(--ctp-surface1)] bg-[var(--ctp-crust)] px-3 py-2 text-sm outline-none transition focus:border-[var(--ctp-mauve)]"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm text-[var(--ctp-subtext1)]">
              System Prompt
            </span>
            <textarea
              className="min-h-36 resize-y rounded-md border border-[var(--ctp-surface1)] bg-[var(--ctp-crust)] px-3 py-2 text-sm outline-none transition focus:border-[var(--ctp-mauve)]"
              value={systemPrompt}
              onChange={(event) => setSystemPrompt(event.target.value)}
            />
          </label>
        </section>

        <section className="grid gap-4 border-t border-[var(--ctp-surface0)] pt-5">
          <div>
            <h2 className="text-base font-semibold">Model</h2>
            <p className="mt-1 text-sm text-[var(--ctp-subtext0)]">
              Choose the provider and runtime defaults.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm text-[var(--ctp-subtext1)]">
                Model Provider
              </span>
              <select
                className="rounded-md border border-[var(--ctp-surface1)] bg-[var(--ctp-crust)] px-3 py-2 text-sm outline-none transition focus:border-[var(--ctp-mauve)]"
                value={modelProvider}
                onChange={(event) => {
                  const nextProvider = event.target.value;
                  setModelProvider(nextProvider);
                  setModelName(
                    modelNamesByProvider[nextProvider]?.[0]?.value ?? "",
                  );
                }}
              >
                {modelProviders.map((provider) => (
                  <option key={provider.value} value={provider.value}>
                    {provider.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-[var(--ctp-subtext1)]">
                Model Name
              </span>
              <select
                className="rounded-md border border-[var(--ctp-surface1)] bg-[var(--ctp-crust)] px-3 py-2 text-sm outline-none transition focus:border-[var(--ctp-mauve)]"
                value={modelName}
                onChange={(event) => setModelName(event.target.value)}
              >
                {availableModels.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm text-[var(--ctp-subtext1)]">
                Temperature
              </span>
              <input
                className="rounded-md border border-[var(--ctp-surface1)] bg-[var(--ctp-crust)] px-3 py-2 text-sm outline-none transition focus:border-[var(--ctp-mauve)]"
                min={0}
                max={2}
                step={0.1}
                type="number"
                value={temperature}
                onChange={(event) => setTemperature(Number(event.target.value))}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-[var(--ctp-subtext1)]">
                Max Tokens
              </span>
              <input
                className="rounded-md border border-[var(--ctp-surface1)] bg-[var(--ctp-crust)] px-3 py-2 text-sm outline-none transition focus:border-[var(--ctp-mauve)]"
                min={1}
                type="number"
                value={maxTokens}
                onChange={(event) => setMaxTokens(event.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="grid gap-4 border-t border-[var(--ctp-surface0)] pt-5">
          <div>
            <h2 className="text-base font-semibold">Tools</h2>
            <p className="mt-1 text-sm text-[var(--ctp-subtext0)]">
              Select capabilities this agent may use.
            </p>
          </div>

          <div className="grid max-h-28 gap-2 overflow-y-auto rounded-md border border-[var(--ctp-surface1)] bg-[var(--ctp-crust)] p-3">
            {toolOptions.map((tool) => (
              <label
                className="flex items-center gap-2 text-sm text-[var(--ctp-subtext1)]"
                key={tool.value}
              >
                <input
                  checked={tools.includes(tool.value)}
                  className="h-4 w-4 accent-[var(--ctp-mauve)]"
                  type="checkbox"
                  value={tool.value}
                  onChange={(event) => {
                    if (event.target.checked) {
                      setTools([...tools, tool.value]);
                      return;
                    }

                    setTools(
                      tools.filter((selectedTool) => selectedTool !== tool.value),
                    );
                  }}
                />
                {tool.label}
              </label>
            ))}
          </div>
        </section>

        <div className="flex justify-end gap-2 border-t border-[var(--ctp-surface0)] pt-4">
          <Link
            className="rounded-md border border-[var(--ctp-surface1)] px-3 py-2 text-sm text-[var(--ctp-subtext1)] transition hover:bg-[var(--ctp-surface0)]"
            href={`/agents/${agentId}`}
          >
            Cancel
          </Link>
          <button
            className="inline-flex items-center gap-2 rounded-md border border-[var(--ctp-mauve)] bg-[var(--ctp-mauve)] px-3 py-2 text-sm font-medium text-[var(--ctp-crust)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            <Save size={16} />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </>
  );
}
