import { Bot, Cpu, Plus, Wrench } from "lucide-react";
import Link from "next/link";

import { listAgents } from "@/lib/api";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AgentsPage() {
  const agents = await listAgents();

  return (
    <>
      <section className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-sm text-[var(--ctp-mauve)]">Agent Registry</p>
          <h1 className="text-3xl font-semibold tracking-normal">Agents</h1>
        </div>

        <Link
          className="inline-flex items-center gap-2 rounded-md border border-[var(--ctp-mauve)] bg-[var(--ctp-mauve)] px-3 py-2 text-sm font-medium text-[var(--ctp-crust)] transition hover:opacity-90"
          href="/agents/new"
        >
          <Plus size={16} />
          New Agent
        </Link>
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        {agents.map((agent) => (
          <Link
            className="block rounded-lg border border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)] p-4 transition hover:border-[var(--ctp-mauve)] hover:bg-[var(--ctp-surface0)]"
            href={`/agents/${agent.id}`}
            key={agent.id}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2 text-[var(--ctp-mauve)]">
                  <Bot size={18} />
                  <span className="text-sm font-medium">Agent</span>
                </div>
                <h2 className="text-lg font-semibold">{agent.name}</h2>
                {agent.description && (
                  <p className="mt-1 text-sm text-[var(--ctp-subtext0)]">
                    {agent.description}
                  </p>
                )}
              </div>

              <span className="rounded-full border border-[var(--ctp-surface1)] bg-[var(--ctp-surface0)] px-2 py-1 text-sm text-[var(--ctp-subtext1)]">
                {agent.model_provider}
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-md border border-[var(--ctp-surface0)] bg-[var(--ctp-crust)] p-3">
                <div className="mb-2 text-[var(--ctp-blue)]">
                  <Cpu size={17} />
                </div>
                <p className="text-xs text-[var(--ctp-subtext0)]">Model</p>
                <strong className="mt-1 block text-sm font-medium">
                  {agent.model_name}
                </strong>
              </div>

              <div className="rounded-md border border-[var(--ctp-surface0)] bg-[var(--ctp-crust)] p-3">
                <div className="mb-2 text-[var(--ctp-yellow)]">
                  <Cpu size={17} />
                </div>
                <p className="text-xs text-[var(--ctp-subtext0)]">
                  Temperature
                </p>
                <strong className="mt-1 block text-sm font-medium">
                  {agent.config.temperature}
                </strong>
              </div>

              <div className="rounded-md border border-[var(--ctp-surface0)] bg-[var(--ctp-crust)] p-3">
                <div className="mb-2 text-[var(--ctp-green)]">
                  <Wrench size={17} />
                </div>
                <p className="text-xs text-[var(--ctp-subtext0)]">Tools</p>
                <strong className="mt-1 block text-sm font-medium">
                  {agent.config.tools.length}
                </strong>
              </div>
            </div>

            <div className="mt-4 border-t border-[var(--ctp-surface0)] pt-3 text-sm text-[var(--ctp-subtext0)]">
              Created {formatDate(agent.created_at)}
            </div>
          </Link>
        ))}

        {agents.length === 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)] p-6 text-[var(--ctp-subtext0)]">
            <Bot size={18} />
            <span>No agents yet.</span>
          </div>
        )}
      </section>
    </>
  );
}
