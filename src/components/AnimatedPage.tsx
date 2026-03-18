import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

interface AnimatedPageProps extends PropsWithChildren {
  className?: string;
}

export function AnimatedPage({ children, className }: AnimatedPageProps) {
  return <div className={cn("animate-page-enter motion-reduce:animate-none", className)}>{children}</div>;
}
