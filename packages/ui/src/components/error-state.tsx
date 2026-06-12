import * as React from "react";
import { cn } from "../lib/cn";
import { Button } from "./button";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  ({ className, title = "Wystąpił błąd", message, onRetry, retryLabel = "Spróbuj ponownie", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 border border-danger/25 rounded-kj-lg bg-danger-surface/20 min-h-[300px]",
        className
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-surface border border-danger/30 text-danger mb-4">
        <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      </div>
      <h3 className="text-base font-bold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button size="sm" variant="danger" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  )
);
ErrorState.displayName = "ErrorState";
