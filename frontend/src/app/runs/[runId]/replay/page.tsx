import Link from "next/link";
import { ArrowLeft, CircleDot, GitBranch, Timer } from "lucide-react";

import { getRunReplay } from "@/lib/api";

type ReplayPageProps = {
  params: Promise<{
    runId: string;
  }>;
};

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

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export default async function RunReplayPage({ params }: ReplayPageProps) {
  const { runId } = await params;
  const replay = await getRunReplay(runId);

  return (
    <>
      <section className="mb-6 flex items-end justify-between">
        <div>
          <Link
            className="mb-3 inline-flex items-center gap-2 text-sm text-[var(--ctp-subtext1)] transition hover:text-[var(--ctp-mauve)]"
            href="/runs"
          >
            <ArrowLeft size={16} />
            Runs
          </Link>
          <p className="mb-1 text-sm text-[var(--ctp-mauve)]">Run Replay</p>
          <h1 className="text-3xl font-semibold tracking-normal">
            {replay.workflow.name}
          </h1>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-sm capitalize ${statusClassName(
            replay.run.status,
          )}`}
        >
          {replay.run.status}
        </span>
      </section>

      <section className="mb-4 grid gap-3 lg:grid-cols-3">
        <div className="rounded-lg border border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)] p-4">
          <div className="mb-2 text-[var(--ctp-mauve)]">
            <GitBranch size={20} />
          </div>
          <p className="text-sm text-[var(--ctp-subtext0)]">Workflow</p>
          <strong className="mt-1 block font-medium">
            {replay.workflow.id.slice(0, 8)}
          </strong>
        </div>

        <div className="rounded-lg border border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)] p-4">
          <div className="mb-2 text-[var(--ctp-mauve)]">
            <Timer size={20} />
          </div>
          <p className="text-sm text-[var(--ctp-subtext0)]">Started</p>
          <strong className="mt-1 block font-medium">
            {formatDate(replay.run.started_at)}
          </strong>
        </div>

        <div className="rounded-lg border border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)] p-4">
          <div className="mb-2 text-[var(--ctp-mauve)]">
            <Timer size={20} />
          </div>
          <p className="text-sm text-[var(--ctp-subtext0)]">Finished</p>
          <strong className="mt-1 block font-medium">
            {formatDate(replay.run.finished_at)}
          </strong>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <div className="rounded-lg border border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)] p-4">
          <h2 className="mb-3 text-base font-semibold">Timeline</h2>
          <div className="grid">
            {replay.events.map((event) => (
              <div
                className="grid grid-cols-[28px_1fr] gap-3 border-t border-[var(--ctp-surface0)] py-3 first:border-t-0"
                key={event.id}
              >
                <div className="pt-1 text-[var(--ctp-mauve)]">
                  <CircleDot size={16} />
                </div>
                <div className="grid gap-1">
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-sm font-medium">
                      {event.event_type}
                    </strong>
                    <span className="text-xs text-[var(--ctp-subtext0)]">
                      #{event.sequence}
                    </span>
                  </div>
                  <span className="text-sm text-[var(--ctp-subtext0)]">
                    {formatDate(event.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <section className="rounded-lg border border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)] p-4">
            <h2 className="mb-3 text-base font-semibold">Run Input</h2>
            <pre className="overflow-auto rounded-md border border-[var(--ctp-surface0)] bg-[var(--ctp-crust)] p-3 text-sm text-[var(--ctp-subtext1)]">
              {formatJson(replay.run.input)}
            </pre>
          </section>

          <section className="rounded-lg border border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)] p-4">
            <h2 className="mb-3 text-base font-semibold">Run Output</h2>
            <pre className="overflow-auto rounded-md border border-[var(--ctp-surface0)] bg-[var(--ctp-crust)] p-3 text-sm text-[var(--ctp-subtext1)]">
              {formatJson(replay.run.output ?? replay.run.error)}
            </pre>
          </section>

          <section className="rounded-lg border border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)] p-4">
            <h2 className="mb-3 text-base font-semibold">Events</h2>
            <div className="grid gap-3">
              {replay.events.map((event) => (
                <details
                  className="rounded-md border border-[var(--ctp-surface0)] bg-[var(--ctp-crust)] p-3"
                  key={event.id}
                >
                  <summary className="cursor-pointer text-sm font-medium text-[var(--ctp-mauve)]">
                    {event.sequence}. {event.event_type}
                  </summary>
                  <pre className="mt-3 overflow-auto text-sm text-[var(--ctp-subtext1)]">
                    {formatJson(event.payload)}
                  </pre>
                </details>
              ))}
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
