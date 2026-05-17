import Link from "next/link";
import { ArrowLeft, Bot, Cpu, Thermometer, Wrench } from "lucide-react";

import { getAgent } from "@/lib/api";
import { DeleteAgentButton } from "@/components/delete-agent-button";

type AgentDetailPageProps = {
  params: Promise<{
    agentId: string;
  }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AgentDetailPage({
  params,
}: AgentDetailPageProps) {
  const { agentId } = await params;
  const agent = await getAgent(agentId);

  return (
    <>
      <section className="mb-6 flex items-end justify-between gap-4">
        <div>
          <Link
            className="mb-3 inline-flex items-center gap-2 text-sm text-[var(--ctp-subtext1)] transition hover:text-[var(--ctp-mauve)]"
            href="/agents"
          >
            <ArrowLeft size={16} />
            Agents
          </Link>

          <p className="mb-1 text-sm text-[var(--ctp-mauve)]">Agent Detail</p>
          <h1 className="text-3xl font-semibold tracking-normal">
            {agent.name}
          </h1>

          {agent.description && (
            <p className="mt-2 text-sm text-[var(--ctp-subtext0)]">
              {agent.description}
            </p>
          )}
        </div>

        <DeleteAgentButton agentId={agent.id} />
      </section>

      <section className="mb-4 grid gap-3 md:grid-cols-4">
        <Metric
          icon={<Bot size={20} />}
          label="Provider"
          value={agent.model_provider}
        />
        <Metric
          icon={<Cpu size={20} />}
          label="Model"
          value={agent.model_name}
        />
        <Metric
          icon={<Thermometer size={20} />}
          label="Temperature"
          value={String(agent.config.temperature)}
        />
        <Metric
          icon={<Wrench size={20} />}
          label="Tools"
          value={String(agent.config.tools.length)}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <section className="rounded-lg border border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)] p-4">
          <h2 className="mb-3 text-base font-semibold">System Prompt</h2>
          <pre className="min-h-60 whitespace-pre-wrap rounded-md border border-[var(--ctp-surface0)] bg-[var(--ctp-crust)] p-3 text-sm text-[var(--ctp-subtext1)]">
            {agent.system_prompt || "No system prompt configured."}
          </pre>
        </section>

        <aside className="grid gap-4">
          <section className="rounded-lg border border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)] p-4">
            <h2 className="mb-3 text-base font-semibold">Tools</h2>
            {agent.config.tools.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {agent.config.tools.map((tool) => (
                  <span
                    className="rounded-full border border-[var(--ctp-surface1)] bg-[var(--ctp-surface0)] px-2 py-1 text-sm text-[var(--ctp-subtext1)]"
                    key={tool}
                  >
                    {tool}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--ctp-subtext0)]">
                No tools enabled.
              </p>
            )}
          </section>

          <section className="rounded-lg border border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)] p-4">
            <h2 className="mb-3 text-base font-semibold">Metadata</h2>
            <dl className="grid gap-3 text-sm">
              <div>
                <dt className="text-[var(--ctp-subtext0)]">Created</dt>
                <dd>{formatDate(agent.created_at)}</dd>
              </div>
              <div>
                <dt className="text-[var(--ctp-subtext0)]">Updated</dt>
                <dd>{formatDate(agent.updated_at)}</dd>
              </div>
              <div>
                <dt className="text-[var(--ctp-subtext0)]">Max Tokens</dt>
                <dd>{agent.config.max_tokens ?? "Not set"}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </section>
    </>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)] p-4">
      <div className="mb-2 text-[var(--ctp-mauve)]">{icon}</div>
      <p className="text-sm text-[var(--ctp-subtext0)]">{label}</p>
      <strong className="mt-1 block text-sm font-medium">{value}</strong>
    </div>
  );
}
