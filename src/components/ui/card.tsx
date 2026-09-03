import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, variant = "default", ...props }: React.ComponentProps<"div"> & { variant?: "default" | "glass" | "neon" | "locked" }) {
  const variantClasses = {
    default: "glass text-card-foreground flex flex-col rounded-xl transition-all duration-300 hover-lift hover:border-neon-cyan/30 shadow-glass py-6",
    glass: "glass text-card-foreground flex flex-col rounded-xl transition-all duration-300 hover-lift hover:border-neon-cyan/30 shadow-glass py-6",
    neon: "glass-strong text-card-foreground flex flex-col rounded-xl transition-all duration-300 hover-lift shadow-glow-cyan py-6",
    locked: "bg-gray-900/50 text-card-foreground flex flex-col rounded-xl transition-all duration-300 border border-yellow-500/30 opacity-75 py-6 cursor-not-allowed",
  }

  return (
    <div
      data-slot="card"
      className={cn(
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold font-display tracking-tight", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

// NEXUS AI Custom Card Variants
function NeonCard({ 
  className, 
  glowColor = "cyan",
  ...props 
}: React.ComponentProps<"div"> & { glowColor?: "cyan" | "purple" | "blue" }) {
  const glowClasses = {
    cyan: "hover:shadow-glow-cyan hover:border-neon-cyan/40",
    purple: "hover:shadow-glow-purple hover:border-neon-purple/40",
    blue: "hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:border-neon-cyan/40",
  }

  return (
    <div
      data-slot="neon-card"
      className={cn(
        "glass-strong text-card-foreground flex flex-col rounded-xl py-6",
        "transition-all duration-500 ease-out",
        "hover-lift",
        "feature-card",
        glowClasses[glowColor],
        className
      )}
      {...props}
    />
  )
}

function GradientCard({ 
  className,
  gradient = "cyan-purple",
  ...props 
}: React.ComponentProps<"div"> & { 
  gradient?: "cyan-purple" | "purple-blue" | "custom" 
}) {
  const gradients = {
    "cyan-purple": "border-transparent bg-gradient-to-br from-neon-cyan/10 via-transparent to-neon-purple/10",
    "purple-blue": "border-transparent bg-gradient-to-br from-neon-purple/10 via-transparent to-neon-cyan/10",
    "custom": "",
  }

  return (
    <div
      data-slot="gradient-card"
      className={cn(
        "text-card-foreground flex flex-col rounded-xl py-6 backdrop-blur-xl",
        "border border-white/10",
        "transition-all duration-500 ease-out",
        "hover-lift hover:scale-[1.02]",
        "shadow-glass",
        gradients[gradient],
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  NeonCard,
  GradientCard,
}
