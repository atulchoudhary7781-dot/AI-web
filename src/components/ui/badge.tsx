import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-orange/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all duration-200 overflow-hidden uppercase tracking-wider",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-neon-orange to-neon-orange text-deep-black shadow-[0_0_10px_rgba(0,255,255,0.3)]",
        secondary:
          "border-transparent bg-dark-surface text-foreground/80 border border-white/10",
        destructive:
          "border-transparent bg-gradient-to-r from-red-500 to-red-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.3)]",
        outline:
          "border-neon-orange/40 text-neon-orange bg-transparent hover:bg-neon-orange/10 hover:border-neon-orange/60",
        // NEXUS AI Custom Variants
        neon:
          "border-transparent bg-gradient-to-r from-neon-orange via-neon-orange to-neon-amber text-deep-black font-bold animate-gradient-shift bg-[length:200%_auto] shadow-glow-cyan",
        neonCyan:
          "border-neon-orange/50 bg-neon-orange/10 text-neon-orange shadow-[0_0_10px_rgba(0,255,255,0.2)] backdrop-blur-sm",
        neonPurple:
          "border-neon-amber/50 bg-neon-amber/10 text-neon-amber shadow-[0_0_10px_rgba(139,92,246,0.2)] backdrop-blur-sm",
        glass:
          "glass text-foreground/90 border-white/20 hover:border-neon-orange/40 transition-colors",
        cyberpunk:
          "border-l-2 border-l-neon-orange bg-dark-surface/80 text-neon-orange font-mono text-[10px] tracking-widest pl-3",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
