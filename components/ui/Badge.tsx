import * as React from "react";
import clsx from "clsx";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-surface text-textPrimary border-border",
    success: "bg-buy-sick/10 text-buy-sick border-buy-sick/20",
    warning: "bg-buy-fair/10 text-buy-fair border-buy-fair/20",
    danger: "bg-buy-bad/10 text-buy-bad border-buy-bad/20",
  };

  return (
    <div
      className={clsx(
        "inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider font-mono border",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}