import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styling - dark cyberpunk theme
        "file:text-foreground placeholder:text-muted-foreground",
        "selection:bg-neon-orange selection:text-deep-black",
        // Background and border
        "bg-dark-surface/50 border border-white/10 backdrop-blur-sm",
        // Sizing
        "flex h-11 w-full min-w-0 rounded-lg px-4 py-2 text-base",
        // Font
        "text-foreground font-medium",
        // Transitions
        "transition-all duration-300 ease-out",
        // Focus states - neon glow effect
        "focus:border-neon-orange/60 focus:outline-none",
        "focus:shadow-[0_0_0_3px_rgba(0,255,255,0.1),0_0_20px_rgba(0,255,255,0.2),inset_0_0_10px_rgba(0,255,255,0.05)]",
        "focus:bg-dark-surface/80",
        // Disabled state
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        // Size variants
        "md:text-sm",
        // Invalid state
        "aria-invalid:border-red-500 aria-invalid:focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1),0_0_20px_rgba(239,68,68,0.2)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
