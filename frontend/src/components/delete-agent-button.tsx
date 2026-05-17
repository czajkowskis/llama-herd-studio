"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteAgent } from "@/lib/api";

export function DeleteAgentButton({ agentId }: { agentId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Delete this agent? Historical run events will keep their stored data, but this agent will no longer be available.",
    );

    if (!confirmed) {
      return;
    }

    setError(null);
    setIsDeleting(true);

    try {
      await deleteAgent(agentId);
      router.push("/agents");
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to delete agent.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="grid gap-2">
      {error && <p className="text-sm text-[var(--ctp-red)]">{error}</p>}

      <button
        className="inline-flex items-center gap-2 rounded-md border border-[var(--ctp-red)]/50 px-3 py-2 text-sm text-[var(--ctp-red)] transition hover:bg-[var(--ctp-red)]/10 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isDeleting}
        type="button"
        onClick={handleDelete}
      >
        <Trash2 size={16} />
        {isDeleting ? "Deleting..." : "Delete Agent"}
      </button>
    </div>
  );
}
