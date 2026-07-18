import * as React from "react";
import { cn } from "../lib/cn";
import { Card } from "./card";
import { Badge } from "./badge";

export interface ProjectCardMetric {
  label?: string;
  value: string | number;
  icon?: React.ReactNode;
}

export interface ProjectCardStatus {
  label: string;
  variant?: "success" | "warning" | "danger" | "neutral" | "info";
}

export interface ProjectCardProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "title"> {
  title: string;
  description?: string;
  status?: ProjectCardStatus;
  techStack?: string[];
  metrics?: ProjectCardMetric[];
  updatedAt?: string;
  actions?: React.ReactNode;
}

export const ProjectCard = React.forwardRef<HTMLElement, ProjectCardProps>(
  (
    {
      className,
      title,
      description,
      status,
      techStack = [],
      metrics = [],
      updatedAt,
      actions,
      href,
      ...props
    },
    ref
  ) => {
    const isInteractive = Boolean(href || props.onClick);

    return (
      <Card
        ref={ref}
        as={href ? "a" : "div"}
        href={href}
        interactive={isInteractive}
        className={cn(
          "group flex flex-col justify-between p-5 transition-all duration-300",
          className
        )}
        {...props}
      >
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
              {title}
            </h3>
            {status && (
              <Badge variant={status.variant || "neutral"} className="shrink-0 text-[0.65rem]">
                {status.label}
              </Badge>
            )}
          </div>

          {description && (
            <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{description}</p>
          )}

          {techStack.length > 0 && (
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {techStack.map((tech) => (
                <Badge key={tech} variant="neutral" className="text-[0.65rem] py-0 px-2 font-mono">
                  {tech}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {(metrics.length > 0 || updatedAt || actions) && (
          <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-[0.75rem] text-muted-foreground">
            <div className="flex items-center gap-3">
              {metrics.map((metric, idx) => (
                <span
                  key={metric.label ? `${metric.label}-${idx}` : idx}
                  className="flex items-center gap-1 font-mono font-medium"
                >
                  {metric.icon && <span className="shrink-0">{metric.icon}</span>}
                  <span>{metric.value}</span>
                  {metric.label && <span className="text-muted-foreground/70">{metric.label}</span>}
                </span>
              ))}
              {updatedAt && <span>{updatedAt}</span>}
            </div>

            {actions && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 shrink-0"
              >
                {actions}
              </div>
            )}
          </div>
        )}
      </Card>
    );
  }
);
ProjectCard.displayName = "ProjectCard";
