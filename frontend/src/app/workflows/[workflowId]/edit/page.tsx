"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { getWorkflow, updateWorkflow } from "@/lib/api";
import type { Workflow } from "@/lib/api";

export default function EditWorkflowPage() {
  const router = useRouter();
  const params = useParams<{ workflowId: string }>();
  const workflowId = params.workflowId;

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadWorkflow() {
      setError(null);
      setIsLoading(true);

      try {
        const loadedWorkflow = await getWorkflow(workflowId);
        setWorkflow(loadedWorkflow);
        setName(loadedWorkflow.name);
        setDescription(loadedWorkflow.description ?? "");
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

    setError(null);
    setIsSubmitting(true);

    try {
      await updateWorkflow(workflowId, {
        name,
        description: description || null,
      });

      router.push(`/workflows/${workflowId}`);
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to update workflow.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <p className="text-[var(--ctp-subtext0)]">Loading workflow...</p>;
  }

  if (!workflow) {
    return (
      <p className="text-[var(--ctp-red)]">
        {error ?? "Workflow could not be loaded."}
      </p>
    );
  }

  return (
    <>
      <section className="mb-6">
        <Link
          className="mb-3 inline-flex items-center gap-2 text-sm text-[var(--ctp-subtext1)] transition hover:text-[var(--ctp-mauve)]"
          href={`/workflows/${workflowId}`}
        >
          <ArrowLeft size={16} />
          Workflow Detail
        </Link>

        <p className="mb-1 text-sm text-[var(--ctp-mauve)]">
          Workflow Library
        </p>
        <h1 className="text-3xl font-semibold tracking-normal">
          Edit Workflow
        </h1>
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
              Update workflow metadata. Graph editing will come later.
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
            <h2 className="text-base font-semibold">Graph</h2>
            <p className="mt-1 text-sm text-[var(--ctp-subtext0)]">
              This edit form keeps the existing graph unchanged.
            </p>
          </div>

          <div className="rounded-md border border-[var(--ctp-surface0)] bg-[var(--ctp-crust)] p-4 text-sm text-[var(--ctp-subtext1)]">
            {workflow.graph.nodes.length} nodes, {workflow.graph.edges.length} edges
          </div>
        </section>

        <div className="flex justify-end gap-2 border-t border-[var(--ctp-surface0)] pt-4">
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
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </>
  );
}
