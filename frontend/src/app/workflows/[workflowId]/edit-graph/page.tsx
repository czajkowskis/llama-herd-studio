"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { WorkflowGraphEditor } from "@/components/workflow-graph-editor";
import { getWorkflow, listAgents, updateWorkflow } from "@/lib/api";
import type { Agent, Workflow, WorkflowGraph } from "@/lib/api";

export default function EditWorkflowGraphPage() {
  const router = useRouter();
  const params = useParams<{ workflowId: string }>();
  const workflowId = params.workflowId;

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [graph, setGraph] = useState<WorkflowGraph | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadWorkflow() {
      setError(null);
      setIsLoading(true);

      try {
        const [loadedWorkflow, loadedAgents] = await Promise.all([
          getWorkflow(workflowId),
          listAgents(),
        ]);
        setWorkflow(loadedWorkflow);
        setGraph(loadedWorkflow.graph);
        setAgents(loadedAgents);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Failed to load workflow.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadWorkflow();
  }, [workflowId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!graph) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await updateWorkflow(workflowId, { graph });
      router.push(`/workflows/${workflowId}`);
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to update workflow graph.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <p className="text-[var(--ctp-subtext0)]">Loading workflow...</p>;
  }

  if (!workflow || !graph) {
    return (
      <p className="text-[var(--ctp-red)]">
        {error ?? "Workflow could not be loaded."}
      </p>
    );
  }

  return (
    <>
      <section className="mb-6 flex items-end justify-between gap-4">
        <div>
          <Link
            className="mb-3 inline-flex items-center gap-2 text-sm text-[var(--ctp-subtext1)] transition hover:text-[var(--ctp-mauve)]"
            href={`/workflows/${workflowId}`}
          >
            <ArrowLeft size={16} />
            Workflow Detail
          </Link>

          <p className="mb-1 text-sm text-[var(--ctp-mauve)]">Graph Editor</p>
          <h1 className="text-3xl font-semibold tracking-normal">
            {workflow.name}
          </h1>
        </div>
      </section>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-md border border-[var(--ctp-red)]/40 bg-[var(--ctp-red)]/10 px-3 py-2 text-sm text-[var(--ctp-red)]">
            {error}
          </div>
        )}

        <section className="rounded-lg border border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)] p-4">
          <div className="mb-3">
            <h2 className="text-base font-semibold">Graph Layout</h2>
            <p className="mt-1 text-sm text-[var(--ctp-subtext0)]">
            Add nodes, connect them, drag to reposition them, then save the graph.
            </p>
          </div>

          <WorkflowGraphEditor
            agents={agents}
            graph={graph}
            onChange={setGraph}
          />
        </section>

        <div className="flex justify-end gap-2">
          <Link
            className="rounded-md border border-[var(--ctp-surface1)] px-3 py-2 text-sm text-[var(--ctp-subtext1)] transition hover:bg-[var(--ctp-surface0)]"
            href={`/workflows/${workflowId}`}
          >
            Cancel
          </Link>
          <button
            className="inline-flex items-center gap-2 rounded-md border border-[var(--ctp-mauve)] bg-[var(--ctp-mauve)] px-3 py-2 text-sm font-medium text-[var(--ctp-crust)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            <Save size={16} />
            {isSubmitting ? "Saving..." : "Save Graph"}
          </button>
        </div>
      </form>
    </>
  );
}
