"use client";

import { motion } from "framer-motion";
import { CheckCircle2, MapPinned, PackageCheck, Truck, Warehouse } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatApiDate,
  normalizeOpType,
  opTypeLabels,
  parseApiDate,
  type TrackHistoryEntry,
} from "@/lib/tracking";

const opTypeIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  OUT: Truck,
  TRANSIT: Truck,
  CROSSING: MapPinned,
  IN: Warehouse,
  DELIVERY: PackageCheck,
  OTHER: MapPinned,
};

export function TrackTimeline({ entries }: { entries: TrackHistoryEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-6 text-sm text-muted-foreground">
        This shipment has been booked, but movement details haven&apos;t been recorded yet. Check back
        after dispatch for step-by-step tracking.
      </div>
    );
  }

  const orderedEntries = [...entries].sort((a, b) => {
    const dateA = parseApiDate(a.OpDate)?.getTime() ?? 0;
    const dateB = parseApiDate(b.OpDate)?.getTime() ?? 0;
    if (dateA !== dateB) return dateA - dateB;

    const order: Record<string, number> = {
      OUT: 0,
      TRANSIT: 1,
      CROSSING: 2,
      IN: 3,
      DELIVERY: 4,
      OTHER: 5,
    };

    return (order[normalizeOpType(a.OpType)] ?? 99) - (order[normalizeOpType(b.OpType)] ?? 99);
  });

  return (
    <ol className="relative">
      {orderedEntries.map((entry, i) => {
        const isLast = i === orderedEntries.length - 1;
        const key = normalizeOpType(entry.OpType);
        const Icon = opTypeIcon[key] ?? MapPinned;
        const label = opTypeLabels[key];
        const description = entry.Description || (entry.FromBranch && entry.ToBranch ? `${entry.FromBranch} → ${entry.ToBranch}` : "Status updated");
        const hasExpectedDelivery = /expected delivery/i.test(description);
        const isDelivered = key === "DELIVERY" || /delivered/i.test(description);
        const isReachedBranch = key === "IN";
        const isInTransit = key === "TRANSIT" || key === "OUT" || key === "CROSSING";

        const accent = hasExpectedDelivery
          ? {
            circle: "border-red-300 bg-red-50 text-red-600 shadow-sm shadow-red-200/50",
            label: "text-red-600",
            date: "text-red-500",
            description: "font-bold text-red-600",
            pill: "border-red-200 bg-red-50 text-red-700",
          }
          : isDelivered
            ? {
              circle: "border-emerald-300 bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-200/50",
              label: "text-emerald-700",
              date: "text-emerald-500",
              description: "text-emerald-700",
              pill: "border-emerald-200 bg-emerald-50 text-emerald-700",
            }
            : isReachedBranch
              ? {
                circle: "border-violet-300 bg-violet-50 text-violet-600 shadow-sm shadow-violet-200/50",
                label: "text-violet-700",
                date: "text-violet-500",
                description: "text-violet-700",
                pill: "border-violet-200 bg-violet-50 text-violet-700",
              }
              : isInTransit
                ? {
                  circle: "border-amber-300 bg-amber-50 text-amber-600 shadow-sm shadow-amber-200/50",
                  label: "text-amber-700",
                  date: "text-amber-500",
                  description: "text-amber-700",
                  pill: "border-amber-200 bg-amber-50 text-amber-700",
                }
                : {
                  circle: "border-sky-300 bg-sky-50 text-sky-600 shadow-sm shadow-sky-200/50",
                  label: "text-sky-700",
                  date: "text-sky-500",
                  description: "text-sky-700",
                  pill: "border-sky-200 bg-sky-50 text-sky-700",
                };

        return (
          <motion.li
            key={`${entry.OpType}-${entry.OpDate}-${i}`}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex gap-4 pb-8 last:pb-0"
          >
            {!isLast && (
              <span
                className="absolute left-[19px] top-10 bottom-0 w-px bg-gradient-to-b from-border to-border/40"
                aria-hidden
              />
            )}

            <span
              className={cn(
                "relative z-10 flex size-10 shrink-0 items-center justify-center overflow-visible rounded-full border-2",
                isLast && key === "DELIVERY"
                  ? "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/40"
                  : isLast
                    ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                    : accent.circle
              )}
            >
              {isLast && key === "DELIVERY" ? (
                <span className="absolute -inset-1.5 animate-ping rounded-full border-2 border-emerald-300/80" />
              ) : null}

              {isLast && key === "DELIVERY" ? (
                <motion.span
                  aria-hidden="true"
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  className="relative flex size-7 items-center justify-center rounded-full bg-emerald-500"
                >
                  <CheckCircle2 className="size-4" />
                </motion.span>
              ) : (
                <Icon className="size-4.5" />
              )}
            </span>

            <div className="min-w-0 flex-1 pt-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className={cn("text-sm font-semibold", isLast ? "text-brand-charcoal" : accent.label)}>
                  {label}
                </p>
                <span className={cn("text-xs font-medium", isLast ? "text-muted-foreground" : accent.date)}>
                  {formatApiDate(entry.OpDate)}
                </span>
              </div>

              <p className={cn("mt-1 text-sm leading-relaxed text-brand-charcoal", isLast ? "text-brand-charcoal" : "text-brand-charcoal")}>
                {hasExpectedDelivery ? (() => {
                  const bracketMatch = description.match(/\[(Expected Delivery on [0-9]{2}\/[0-9]{2}\/[0-9]{4})\]/i);
                  if (bracketMatch) {
                    const parts = description.split(bracketMatch[0]);
                    return (
                      <>
                        {parts[0]}
                        <br />
                        <span className="rounded-md border border-red-200 bg-red-50 px-1 py-0.5 font-bold text-red-600">
                          {bracketMatch[0]}
                        </span>
                        {parts.slice(1).join(bracketMatch[0])}
                      </>
                    );
                  }

                  const match = description.match(/(Expected Delivery on [0-9]{2}\/[0-9]{2}\/[0-9]{4})/i);
                  if (!match) return description;

                  const parts = description.split(match[1]);
                  return (
                    <>
                      {parts[0]}
                      <br />
                      <span className="rounded-md border border-red-200 bg-red-50 px-1 py-0.5 font-bold text-red-600">
                        {match[1]}
                      </span>
                      {parts.slice(1).join(match[1])}
                    </>
                  );
                })() : description}
              </p>

              {(entry.TruckNo || entry.VIAStation || entry.TotParcel) && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {entry.FromBranch && entry.ToBranch && (
                    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs", accent.pill)}>
                      {entry.FromBranch} → {entry.ToBranch}
                    </span>
                  )}
                  {entry.TruckNo && (
                    <span className="inline-flex items-center rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-xs text-foreground/70">
                      Vehicle {entry.TruckNo}
                    </span>
                  )}
                  {entry.VIAStation && entry.VIAStation.toUpperCase() !== "DIRECT" && (
                    <span className="inline-flex items-center rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-xs text-foreground/70">
                      Via {entry.VIAStation}
                    </span>
                  )}
                  {entry.TotParcel && (
                    <span className="inline-flex items-center rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-xs text-foreground/70">
                      {entry.TotParcel} parcel{entry.TotParcel === "1" ? "" : "s"}
                    </span>
                  )}
                </div>
              )}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
