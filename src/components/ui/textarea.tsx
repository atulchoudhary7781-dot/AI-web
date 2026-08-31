import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Base styling - dark cyberpunk theme
        "border placeholder:text-muted-foreground",
        "selection:bg-neon-cyan selection:text-deep-black",
        // Background and border - glass effect
        "bg-dark-surface/50 border-white/10 backdrop-blur-sm",
        // Sizing and layout
        "flex field-sizing-content min-h-[80px] w-full rounded-lg px-4 py-3 text-base",
        // Font styling
        "text-foreground font-medium",
        // Transitions
        "transition-all duration-300 ease-out resize-y",
        // Focus states - neon glow effect
        "focus:border-neon-cyan/60 focus:outline-none",
        "focus:shadow-[0_0_0_3px_rgba(0,255,255,0.1),0_0_20px_rgba(0,255,255,0.2),inset_0_0_10px_rgba(0,255,255,0.05)]",
        "focus:bg-dark-surface/80",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50",
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

export { Textarea }
