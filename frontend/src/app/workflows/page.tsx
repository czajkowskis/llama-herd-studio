import { GitBranch, Network, Plus } from "lucide-react";
import Link from "next/link";

import { listWorkflows } from "@/lib/api";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function WorkflowsPage() {
  const workflows = await listWorkflows();

  return (
    <>
      <section className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-sm text-[var(--ctp-mauve)]">
            Workflow Library
          </p>
          <h1 className="text-3xl font-semibold tracking-normal">Workflows</h1>
        </div>

        <Link
          className="inline-flex items-center gap-2 rounded-md border border-[var(--ctp-mauve)] bg-[var(--ctp-mauve)] px-3 py-2 text-sm font-medium text-[var(--ctp-crust)] transition hover:opacity-90"
          href="/workflows/new"
        >
          <Plus size={16} />
          New Workflow
        </Link>
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        {workflows.map((workflow) => (
          <article
            className="rounded-lg border border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)] p-4"
            key={workflow.id}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2 text-[var(--ctp-mauve)]">
                  <GitBranch size={18} />
                  <span className="text-sm font-medium">Workflow</span>
                </div>
                <h2 className="text-lg font-semibold">{workflow.name}</h2>
                {workflow.description && (
                  <p className="mt-1 text-sm text-[var(--ctp-subtext0)]">
                    {workflow.description}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-md border border-[var(--ctp-surface0)] bg-[var(--ctp-crust)] p-3">
                <div className="mb-2 text-[var(--ctp-blue)]">
                  <Network size={17} />
                </div>
                <p className="text-xs text-[var(--ctp-subtext0)]">Nodes</p>
                <strong className="mt-1 block text-sm font-medium">
                  {workflow.graph.nodes.length}
                </strong>
              </div>

              <div className="rounded-md border border-[var(--ctp-surface0)] bg-[var(--ctp-crust)] p-3">
                <div className="mb-2 text-[var(--ctp-green)]">
                  <GitBranch size={17} />
                </div>
                <p className="text-xs text-[var(--ctp-subtext0)]">Edges</p>
                <strong className="mt-1 block text-sm font-medium">
                  {workflow.graph.edges.length}
                </strong>
              </div>
            </div>

            <div className="mt-4 border-t border-[var(--ctp-surface0)] pt-3 text-sm text-[var(--ctp-subtext0)]">
              Updated {formatDate(workflow.updated_at)}
            </div>
          </article>
        ))}

        {workflows.length === 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)] p-6 text-[var(--ctp-subtext0)]">
            <GitBranch size={18} />
            <span>No workflows yet.</span>
          </div>
        )}
      </section>
    </>
  );
}
