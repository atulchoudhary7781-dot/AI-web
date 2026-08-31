import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-neon-cyan to-electric-blue text-deep-black font-semibold shadow-glow-cyan hover:shadow-glow-cyan-intense hover:-translate-y-0.5 active:translate-y-0",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:from-red-600 hover:to-red-700 hover:shadow-xl hover:-translate-y-0.5",
        outline:
          "border border-neon-cyan/30 bg-transparent text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan/60 hover:shadow-glow-cyan backdrop-blur-sm",
        secondary:
          "bg-glass-bg border border-white/10 text-white hover:bg-white/10 hover:border-white/20 shadow-lg hover:shadow-xl hover:-translate-y-0.5 backdrop-blur-sm",
        ghost:
          "text-foreground/80 hover:text-neon-cyan hover:bg-neon-cyan/10 transition-colors duration-200",
        link:
          "text-neon-cyan underline-offset-4 hover:underline hover:text-electric-blue transition-colors",
        // NEXUS AI Custom Variants
        neon: 
          "bg-gradient-to-r from-neon-cyan via-electric-blue to-neon-purple text-deep-black font-bold shadow-glow-cyan hover:shadow-glow-purple-intense hover:-translate-y-1 animate-gradient-shift bg-[length:200%_auto]",
        neonOutline:
          "border border-gradient-nexus bg-transparent text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple hover:bg-neon-cyan/5 shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:shadow-[0_0_25px_rgba(0,255,255,0.3)]",
        glass:
          "glass text-white hover:border-neon-cyan/40 hover:shadow-glow-cyan hover:-translate-y-0.5",
        cyberpunk:
          "bg-gradient-to-r from-neon-purple to-neon-cyan text-white font-bold tracking-wider uppercase shadow-glow-purple hover:shadow-glow-cyan-intense hover:-translate-y-1 clip-corner-sm",
      },
      size: {
        default: "h-10 px-5 py-2 has-[>svg]:px-4",
        sm: "h-8 rounded-md gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-12 rounded-xl px-7 text-base has-[>svg]:px-5 font-semibold",
        xl: "h-14 rounded-xl px-8 text-lg has-[>svg]:px-6 font-semibold",
        icon: "size-10 rounded-lg",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
