import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type PhoneFrameProps = {
  children: ReactNode;
  className?: string;
  side: "left" | "right";
  label?: string;
};

export function PhoneFrame({ children, className, side, label }: PhoneFrameProps) {
  const accentBorder =
    side === "left"
      ? "border-player1-accent/30"
      : "border-player2-accent/30";

  return (
    <div
      className={cn(
        "glass glass-inset rounded-3xl p-4",
        "w-full max-w-sm h-[600px]",
        "flex flex-col gap-3",
        accentBorder,
        className
      )}
    >
      {/* Phone "notch" decoration */}
      <div className="w-24 h-1 bg-white/30 rounded-full mx-auto" />

      {/* Optional label */}
      {label && (
        <div className={cn(
          "text-center text-sm font-medium",
          side === "left" ? "text-player1-accent/80" : "text-player2-accent/80"
        )}>
          {label}
        </div>
      )}

      {/* Content area (video will go here) */}
      <div className="flex-1 overflow-hidden rounded-2xl">{children}</div>
    </div>
  );
}
