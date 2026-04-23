import type { Timestamp, FieldValue } from "firebase/firestore";

function isTimestamp(v: unknown): v is Timestamp {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as { toDate?: unknown }).toDate === "function"
  );
}

export function toDate(value: Timestamp | FieldValue | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (isTimestamp(value)) return value.toDate();
  return null;
}

export function formatContactDate(
  value: Timestamp | FieldValue | Date | null | undefined,
): string {
  const d = toDate(value);
  if (!d) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatRelativeTime(
  value: Timestamp | FieldValue | Date | null | undefined,
): string {
  const d = toDate(value);
  if (!d) return "just now";
  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);

  if (diffSec < 30) return "just now";
  if (diffMin < 1) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function daysSince(
  value: Timestamp | FieldValue | Date | null | undefined,
): number {
  const d = toDate(value);
  if (!d) return 0;
  const diffMs = Date.now() - d.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function formatCurrency(value: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value || 0);
  } catch {
    return `${currency} ${value.toLocaleString()}`;
  }
}
