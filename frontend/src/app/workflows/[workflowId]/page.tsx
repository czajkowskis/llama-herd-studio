"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  GitBranch,
  Play,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  createWorkflowRun,
  getWorkflow,
  validateWorkflow,
  type RunDetail,
  type Workflow,
  type WorkflowValidation,
} from "@/lib/api";
import { StatusBadge } from "@/components/status-badge";

const defaultRunInput = '{\n  "topic": "debugging workflows"\n}';

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getJsonParseError(value: string) {
  try {
    JSON.parse(value);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "Invalid JSON.";
  }
}

export default function WorkflowDetailPage() {
  const router = useRouter();
  const params = useParams<{ workflowId: string }>();
  const workflowId = params.workflowId;

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [validation, setValidation] = useState<WorkflowValidation | null>(null);
  const [lastRun, setLastRun] = useState<RunDetail | null>(null);
  const [inputJson, setInputJson] = useState(defaultRunInput);
  const [inputError, setInputError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const liveInputError = useMemo(() => getJsonParseError(inputJson), [inputJson]);

  useEffect(() => {
    async function loadWorkflow() {
      setError(null);
      setIsLoading(true);

      try {
        if (!workflowId) {
          throw new Error("Missing workflow id.");
        }

        const loadedWorkflow = await getWorkflow(workflowId);
        setWorkflow(loadedWorkflow);
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

  async function handleValidate() {
    setError(null);
    setIsValidating(true);

    try {
      const result = await validateWorkflow(workflowId);
      setValidation(result);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to validate workflow.",
      );
    } finally {
      setIsValidating(false);
    }
  }

  async function handleRun() {
    setError(null);
    setInputError(null);
    setIsRunning(true);

    try {
      const parsedInput = JSON.parse(inputJson) as Record<string, unknown>;
      const run = await createWorkflowRun(workflowId, { input: parsedInput });
      setLastRun(run);
      router.refresh();
    } catch (caughtError) {
      if (caughtError instanceof SyntaxError) {
        setInputError(caughtError.message);
        return;
      }

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to run workflow.",
      );
    } finally {
      setIsRunning(false);
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
      <section className="mb-6 flex items-end justify-between gap-4">
        <div>
          <Link
            className="mb-3 inline-flex items-center gap-2 text-sm text-[var(--ctp-subtext1)] transition hover:text-[var(--ctp-mauve)]"
            href="/workflows"
          >
            <ArrowLeft size={16} />
            Workflows
          </Link>

          <p className="mb-1 text-sm text-[var(--ctp-mauve)]">
            Workflow Detail
          </p>
          <h1 className="text-3xl font-semibold tracking-normal">
            {workflow.name}
          </h1>
        </div>

        <div className="flex gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-md border border-[var(--ctp-surface1)] px-3 py-2 text-sm text-[var(--ctp-subtext1)] transition hover:bg-[var(--ctp-surface0)]"
            disabled={isValidating}
            type="button"
            onClick={handleValidate}
          >
            <CheckCircle2 size={16} />
            {isValidating ? "Validating..." : "Validate"}
          </button>

          <button
            className="inline-flex items-center gap-2 rounded-md border border-[var(--ctp-mauve)] bg-[var(--ctp-mauve)] px-3 py-2 text-sm font-medium text-[var(--ctp-crust)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isRunning || liveInputError !== null}
            type="button"
            onClick={handleRun}
          >
            <Play size={16} />
            {isRunning ? "Running..." : "Run"}
          </button>
        </div>
      </section>

      {error && (
        <div className="mb-4 rounded-md border border-[var(--ctp-red)]/40 bg-[var(--ctp-red)]/10 px-3 py-2 text-sm text-[var(--ctp-red)]">
          {error}
        </div>
      )}

      <section className="mb-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)] p-4">
          <GitBranch className="mb-2 text-[var(--ctp-mauve)]" size={20} />
          <p className="text-sm text-[var(--ctp-subtext0)]">Nodes</p>
          <strong className="mt-1 block text-2xl">
            {workflow.graph.nodes.length}
          </strong>
        </div>

        <div className="rounded-lg border border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)] p-4">
          <GitBranch className="mb-2 text-[var(--ctp-green)]" size={20} />
          <p className="text-sm text-[var(--ctp-subtext0)]">Edges</p>
          <strong className="mt-1 block text-2xl">
            {workflow.graph.edges.length}
          </strong>
        </div>

        <div className="rounded-lg border border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)] p-4">
          <GitBranch className="mb-2 text-[var(--ctp-blue)]" size={20} />
          <p className="text-sm text-[var(--ctp-subtext0)]">Updated</p>
          <strong className="mt-1 block text-sm">
            {formatDate(workflow.updated_at)}
          </strong>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <div className="grid gap-4">
          <section className="rounded-lg border border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)] p-4">
            <h2 className="mb-3 text-base font-semibold">Run Input</h2>
            <textarea
              className="min-h-40 w-full resize-y rounded-md border border-[var(--ctp-surface1)] bg-[var(--ctp-crust)] p-3 font-mono text-sm text-[var(--ctp-subtext1)] outline-none transition focus:border-[var(--ctp-mauve)]"
              value={inputJson}
              onChange={(event) => {
                setInputJson(event.target.value);
                setInputError(null);
              }}
            />
            {(inputError || liveInputError) && (
              <p className="mt-2 text-sm text-[var(--ctp-red)]">
                Invalid JSON: {inputError ?? liveInputError}
              </p>
            )}
            <button
              className="mt-3 inline-flex items-center gap-2 rounded-md border border-[var(--ctp-surface1)] px-3 py-2 text-sm text-[var(--ctp-subtext1)] transition hover:bg-[var(--ctp-surface0)]"
              type="button"
              onClick={() => {
                setInputJson(defaultRunInput);
                setInputError(null);
              }}
            >
              <RotateCcw size={16} />
              Reset Input
            </button>
          </section>

          {validation && (
            <section className="rounded-lg border border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)] p-4">
              <div className="mb-3 flex items-center gap-2">
                {validation.valid ? (
                  <CheckCircle2 size={18} className="text-[var(--ctp-green)]" />
                ) : (
                  <XCircle size={18} className="text-[var(--ctp-red)]" />
                )}
                <h2 className="text-base font-semibold">
                  {validation.valid ? "Valid Workflow" : "Validation Errors"}
                </h2>
              </div>

              {validation.valid ? (
                <p className="text-sm text-[var(--ctp-subtext0)]">
                  This workflow is ready to run.
                </p>
              ) : (
                <ul className="grid gap-2 text-sm text-[var(--ctp-red)]">
                  {validation.errors.map((validationError) => (
                    <li key={validationError}>{validationError}</li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>

        <div className="grid gap-4">
          {lastRun && (
            <section className="rounded-lg border border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)] p-4">
              <h2 className="mb-3 text-base font-semibold">Last Run</h2>
              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-[var(--ctp-subtext0)]">
                    Status
                  </span>
                  <StatusBadge status={lastRun.status} />
                </div>

                <pre className="overflow-auto rounded-md border border-[var(--ctp-surface0)] bg-[var(--ctp-crust)] p-3 text-sm text-[var(--ctp-subtext1)]">
                  {JSON.stringify(lastRun.output ?? lastRun.error, null, 2)}
                </pre>

                <Link
                  className="inline-flex w-fit items-center gap-2 rounded-md border border-[var(--ctp-mauve)] px-3 py-2 text-sm text-[var(--ctp-mauve)] transition hover:bg-[var(--ctp-surface0)]"
                  href={`/runs/${lastRun.id}/replay`}
                >
                  Open Replay
                </Link>
              </div>
            </section>
          )}

          <section className="rounded-lg border border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)] p-4">
            <h2 className="mb-3 text-base font-semibold">Graph JSON</h2>
            <pre className="max-h-[520px] overflow-auto rounded-md border border-[var(--ctp-surface0)] bg-[var(--ctp-crust)] p-3 text-sm text-[var(--ctp-subtext1)]">
              {JSON.stringify(workflow.graph, null, 2)}
            </pre>
          </section>
        </div>
      </section>
    </>
  );
}
