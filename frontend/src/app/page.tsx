import {
  Activity,
  Bot,
  CheckCircle2,
  GitBranch,
  History,
  XCircle,
} from "lucide-react";
import type { ReactNode } from "react";

import { getDashboardSummary } from "@/lib/api";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function Home() {
  const summary = await getDashboardSummary();

  return (
    <main className="min-h-screen bg-[var(--ctp-base)] px-5 py-6 text-[var(--ctp-text)] md:px-8">
      <section className="mb-6 flex items-end justify-between">
        <div>
          <p className="mb-1 text-sm text-[var(--ctp-mauve)]">
            Llama Herd Studio
          </p>
          <h1 className="text-3xl font-semibold tracking-normal">
            Workflow Dashboard
          </h1>
        </div>
      </section>

      <section className="mb-4 grid gap-3 md:grid-cols-3">
        <MetricCard
          icon={<Bot size={20} />}
          label="Agents"
          value={summary.total_agents}
        />
        <MetricCard
          icon={<GitBranch size={20} />}
          label="Workflows"
          value={summary.total_workflows}
        />
        <MetricCard
          icon={<Activity size={20} />}
          label="Runs"
          value={summary.total_runs}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <section className="rounded-lg border border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)] p-4">
          <h2 className="mb-3 text-base font-semibold">Runs By Status</h2>
          <div className="grid">
            <StatusRow
              icon={<CheckCircle2 size={18} className="text-[var(--ctp-green)]" />}
              label="Success"
              value={summary.runs_by_status.success}
            />
            <StatusRow
              icon={<XCircle size={18} className="text-[var(--ctp-red)]" />}
              label="Failed"
              value={summary.runs_by_status.failed}
            />
            <StatusRow
              icon={<Activity size={18} className="text-[var(--ctp-blue)]" />}
              label="Running"
              value={summary.runs_by_status.running}
            />
            <StatusRow
              icon={<History size={18} className="text-[var(--ctp-yellow)]" />}
              label="Pending"
              value={summary.runs_by_status.pending}
            />
          </div>
        </section>

        <section className="rounded-lg border border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)] p-4">
          <h2 className="mb-3 text-base font-semibold">Recent Runs</h2>
          <div className="grid">
            {summary.recent_runs.map((run) => (
              <div
                className="flex items-center justify-between gap-3 border-t border-[var(--ctp-surface0)] py-3 first:border-t-0"
                key={run.id}
              >
                <div className="grid gap-1">
                  <strong className="font-medium">{run.workflow_name}</strong>
                  <span className="text-sm text-[var(--ctp-subtext0)]">
                    {formatDate(run.started_at)}
                  </span>
                </div>
                <span className="rounded-full border border-[var(--ctp-surface1)] bg-[var(--ctp-surface0)] px-2 py-1 text-sm capitalize text-[var(--ctp-subtext1)]">
                  {run.status}
                </span>
              </div>
            ))}

            {summary.recent_runs.length === 0 && (
              <p className="py-4 text-sm text-[var(--ctp-subtext0)]">
                No runs yet.
              </p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="grid gap-2 rounded-lg border border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)] p-4">
      <div className="text-[var(--ctp-mauve)]">{icon}</div>
      <span className="text-sm text-[var(--ctp-subtext0)]">{label}</span>
      <strong className="text-3xl font-semibold text-[var(--ctp-text)]">
        {value}
      </strong>
    </div>
  );
}

function StatusRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-[var(--ctp-surface0)] py-3 first:border-t-0">
      <div className="flex items-center gap-2 text-[var(--ctp-subtext1)]">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <strong className="text-[var(--ctp-text)]">{value}</strong>
    </div>
  );
}
