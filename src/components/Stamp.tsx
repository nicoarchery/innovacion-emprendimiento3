import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const stampVariants = cva(
  "inline-flex shrink-0 items-center gap-1.5 rounded-[2px] border px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.08em]",
  {
    variants: {
      tone: {
        sello: "border-sello/40 bg-sello/[0.07] text-sello",
        verificado: "border-green-700/40 bg-green-50 text-green-800",
        revision: "border-amber-700/40 bg-amber-50 text-amber-800",
        riesgo: "border-red-800/40 bg-red-50 text-red-800",
        neutro: "border-tinta/30 bg-transparent text-tinta",
      },
    },
    defaultVariants: {
      tone: "neutro",
    },
  }
);

export interface StampProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof stampVariants> {}

export function Stamp({ className, tone, ...props }: StampProps) {
  return (
    <span className={cn(stampVariants({ tone }), className)} {...props} />
  );
}
