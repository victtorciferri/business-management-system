/**
 * Page Header Components
 * 
 * Reusable components for creating consistent page headers
 */

import * as React from "react"
import { cn } from "@/lib/utils"

export function PageHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      className={cn("grid gap-1", className)}
      {...props}
    >
      {children}
    </section>
  )
}

export function PageHeaderHeading({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        "text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl",
        className
      )}
      {...props}
    />
  )
}

export function PageHeaderDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-muted-foreground md:text-lg", className)}
      {...props}
    />
  )
}

export function PageActions({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 pt-4 md:pt-6",
        className
      )}
      {...props}
    />
  )
}