import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background relative overflow-hidden liquid-glass",
  {
    variants: {
      variant: {
        default:
          "liquid-glass-primary text-black font-semibold hover:-translate-y-0.5 active:translate-y-0",
        destructive:
          "text-white shadow-lg hover:-translate-y-0.5",
        outline:
          "text-amber-100 hover:-translate-y-0.5",
        secondary:
          "text-white hover:-translate-y-0.5",
        ghost:
          "text-foreground/90 hover:text-white",
        link:
          "text-amber-200 underline-offset-4 hover:underline bg-transparent border-0 shadow-none",
        neon:
          "liquid-glass-primary text-black font-bold hover:-translate-y-1",
        neonOutline:
          "text-amber-100 hover:-translate-y-0.5",
        glass:
          "text-white hover:-translate-y-0.5",
        cyberpunk:
          "liquid-glass-primary text-black font-bold tracking-wider uppercase hover:-translate-y-1",
        locked:
          "text-gray-200 font-semibold cursor-not-allowed opacity-80",
      },
      size: {
        default: "h-10 px-5 py-2 has-[>svg]:px-4",
        sm: "h-8 rounded-lg gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-12 rounded-2xl px-7 text-base has-[>svg]:px-5 font-semibold",
        xl: "h-14 rounded-2xl px-8 text-lg has-[>svg]:px-6 font-semibold",
        icon: "size-10 rounded-xl",
        "icon-sm": "size-8 rounded-lg",
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
