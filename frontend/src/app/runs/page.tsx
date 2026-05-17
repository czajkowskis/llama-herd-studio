import Link from "next/link";
import { ArrowRight, History } from "lucide-react";

import { listRuns } from "@/lib/api";

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusClassName(status: string) {
  if (status === "success") {
    return "border-[var(--ctp-green)]/40 bg-[var(--ctp-green)]/10 text-[var(--ctp-green)]";
  }

  if (status === "failed") {
    return "border-[var(--ctp-red)]/40 bg-[var(--ctp-red)]/10 text-[var(--ctp-red)]";
  }

  if (status === "running") {
    return "border-[var(--ctp-blue)]/40 bg-[var(--ctp-blue)]/10 text-[var(--ctp-blue)]";
  }

  return "border-[var(--ctp-surface1)] bg-[var(--ctp-surface0)] text-[var(--ctp-subtext1)]";
}

export default async function RunsPage() {
  const runs = await listRuns();

  return (
    <>
      <section className="mb-6 flex items-end justify-between">
        <div>
          <p className="mb-1 text-sm text-[var(--ctp-mauve)]">Run History</p>
          <h1 className="text-3xl font-semibold tracking-normal">Runs</h1>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)]">
        <div className="grid grid-cols-[1fr_140px_220px_220px_48px] gap-4 border-b border-[var(--ctp-surface0)] px-4 py-3 text-sm text-[var(--ctp-subtext0)]">
          <span>Workflow</span>
          <span>Status</span>
          <span>Started</span>
          <span>Finished</span>
          <span />
        </div>

        <div className="grid">
          {runs.map((run) => (
            <div
              className="grid grid-cols-[1fr_140px_220px_220px_48px] items-center gap-4 border-t border-[var(--ctp-surface0)] px-4 py-3 first:border-t-0"
              key={run.id}
            >
              <div className="grid gap-1">
                <strong className="font-medium">
                  Workflow {run.workflow_id.slice(0, 8)}
                </strong>
                <span className="text-sm text-[var(--ctp-subtext0)]">
                  Run {run.id.slice(0, 8)}
                </span>
              </div>

              <span
                className={`w-fit rounded-full border px-2 py-1 text-sm capitalize ${statusClassName(
                  run.status,
                )}`}
              >
                {run.status}
              </span>

              <span className="text-sm text-[var(--ctp-subtext1)]">
                {formatDate(run.started_at)}
              </span>

              <span className="text-sm text-[var(--ctp-subtext1)]">
                {formatDate(run.finished_at)}
              </span>

              <Link
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--ctp-surface1)] text-[var(--ctp-mauve)] transition hover:bg-[var(--ctp-surface0)]"
                href={`/runs/${run.id}/replay`}
                aria-label={`Open replay for run ${run.id}`}
              >
                <ArrowRight size={18} />
              </Link>
            </div>
          ))}

          {runs.length === 0 && (
            <div className="flex items-center gap-3 px-4 py-8 text-[var(--ctp-subtext0)]">
              <History size={18} />
              <span>No runs yet.</span>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
