"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { FormEvent, useState } from "react";

import { createWorkflow } from "@/lib/api";
import type { WorkflowGraph } from "@/lib/api";

const defaultGraph: WorkflowGraph = {
  nodes: [
    {
      id: "input-1",
      type: "input",
      data: { label: "Input" },
      position: { x: 0, y: 0 },
    },
    {
      id: "output-1",
      type: "output",
      data: { label: "Output" },
      position: { x: 320, y: 0 },
    },
  ],
  edges: [
    {
      id: "edge-1",
      source: "input-1",
      target: "output-1",
      data: {},
    },
  ],
};

export default function NewWorkflowPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      await createWorkflow({
        name,
        description: description || null,
        graph: defaultGraph,
      });

      router.push("/workflows");
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to create workflow.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <section className="mb-6">
        <Link
          className="mb-3 inline-flex items-center gap-2 text-sm text-[var(--ctp-subtext1)] transition hover:text-[var(--ctp-mauve)]"
          href="/workflows"
        >
          <ArrowLeft size={16} />
          Workflows
        </Link>

        <p className="mb-1 text-sm text-[var(--ctp-mauve)]">Workflow Library</p>
        <h1 className="text-3xl font-semibold tracking-normal">New Workflow</h1>
      </section>

      <form
        className="grid max-w-3xl gap-5 rounded-lg border border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)] p-5"
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
              Create a workflow with a default input-to-output graph.
            </p>
          </div>

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
        </section>

        <section className="grid gap-4 border-t border-[var(--ctp-surface0)] pt-5">
          <div>
            <h2 className="text-base font-semibold">Starting Graph</h2>
            <p className="mt-1 text-sm text-[var(--ctp-subtext0)]">
              This creates a minimal valid workflow you can run immediately.
            </p>
          </div>

          <div className="rounded-md border border-[var(--ctp-surface0)] bg-[var(--ctp-crust)] p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="rounded-md border border-[var(--ctp-surface1)] bg-[var(--ctp-surface0)] px-3 py-2 text-sm">
                Input
              </div>
              <div className="h-px flex-1 bg-[var(--ctp-surface1)]" />
              <div className="rounded-md border border-[var(--ctp-surface1)] bg-[var(--ctp-surface0)] px-3 py-2 text-sm">
                Output
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-2 border-t border-[var(--ctp-surface0)] pt-4">
          <Link
            className="rounded-md border border-[var(--ctp-surface1)] px-3 py-2 text-sm text-[var(--ctp-subtext1)] transition hover:bg-[var(--ctp-surface0)]"
            href="/workflows"
          >
            Cancel
          </Link>
          <button
            className="inline-flex items-center gap-2 rounded-md border border-[var(--ctp-mauve)] bg-[var(--ctp-mauve)] px-3 py-2 text-sm font-medium text-[var(--ctp-crust)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            <Save size={16} />
            {isSubmitting ? "Creating..." : "Create Workflow"}
          </button>
        </div>
      </form>
    </>
  );
}
