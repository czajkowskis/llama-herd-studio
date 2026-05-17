type StatusBadgeProps = {
  status: string;
};

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

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`w-fit rounded-full border px-2 py-1 text-sm capitalize ${statusClassName(
        status,
      )}`}
    >
      {status}
    </span>
  );
}
