"use client";

import * as React from "react";
import { cn } from "../lib/cn";

export type SectionHeaderAlign = "left" | "center";
export type SectionHeaderHeadingLevel = "h2" | "h3" | "h4";

export interface SectionHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  kicker?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  align?: SectionHeaderAlign;
  headingLevel?: SectionHeaderHeadingLevel;
  divider?: boolean;
}

export type SectionHeaderKickerProps = React.HTMLAttributes<HTMLParagraphElement>;
export interface SectionHeaderTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: SectionHeaderHeadingLevel;
}
export type SectionHeaderDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;
export type SectionHeaderActionsProps = React.HTMLAttributes<HTMLDivElement>;

const SectionHeaderKicker = React.forwardRef<HTMLParagraphElement, SectionHeaderKickerProps>(
  ({ className, children, ...props }, ref) => {
    if (!children) return null;
    return (
      <p
        ref={ref}
        className={cn(
          "font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary",
          className
        )}
        {...props}
      >
        {children}
      </p>
    );
  }
);
SectionHeaderKicker.displayName = "SectionHeaderKicker";

const SectionHeaderTitle = React.forwardRef<HTMLHeadingElement, SectionHeaderTitleProps>(
  ({ className, as: Component = "h2", children, ...props }, ref) => {
    if (!children) return null;
    return (
      <Component
        ref={ref}
        className={cn("text-2xl font-bold tracking-tight text-foreground sm:text-3xl", className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
SectionHeaderTitle.displayName = "SectionHeaderTitle";

const SectionHeaderDescription = React.forwardRef<
  HTMLParagraphElement,
  SectionHeaderDescriptionProps
>(({ className, children, ...props }, ref) => {
  if (!children) return null;
  return (
    <p
      ref={ref}
      className={cn("text-base leading-relaxed text-muted-foreground max-w-2xl", className)}
      {...props}
    >
      {children}
    </p>
  );
});
SectionHeaderDescription.displayName = "SectionHeaderDescription";

const SectionHeaderActions = React.forwardRef<HTMLDivElement, SectionHeaderActionsProps>(
  ({ className, children, ...props }, ref) => {
    if (!children) return null;
    return (
      <div ref={ref} className={cn("flex flex-wrap items-center gap-3", className)} {...props}>
        {children}
      </div>
    );
  }
);
SectionHeaderActions.displayName = "SectionHeaderActions";

export const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  (
    {
      kicker,
      title,
      description,
      actions,
      align = "left",
      headingLevel = "h2",
      divider = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isCentered = align === "center";

    return (
      <div
        ref={ref}
        className={cn(
          "space-y-4",
          isCentered
            ? "text-center items-center mx-auto max-w-3xl"
            : "md:flex md:items-end md:justify-between md:space-y-0",
          divider && "border-b border-border pb-6",
          className
        )}
        {...props}
      >
        {children ? (
          children
        ) : (
          <>
            <div className={cn("space-y-2", isCentered && "flex flex-col items-center")}>
              {kicker && <SectionHeaderKicker>{kicker}</SectionHeaderKicker>}
              {title && <SectionHeaderTitle as={headingLevel}>{title}</SectionHeaderTitle>}
              {description && <SectionHeaderDescription>{description}</SectionHeaderDescription>}
            </div>
            {actions && (
              <SectionHeaderActions className={cn(isCentered && "justify-center mt-4")}>
                {actions}
              </SectionHeaderActions>
            )}
          </>
        )}
      </div>
    );
  }
) as React.ForwardRefExoticComponent<SectionHeaderProps & React.RefAttributes<HTMLDivElement>> & {
  Kicker: typeof SectionHeaderKicker;
  Title: typeof SectionHeaderTitle;
  Description: typeof SectionHeaderDescription;
  Actions: typeof SectionHeaderActions;
};

SectionHeader.displayName = "SectionHeader";
SectionHeader.Kicker = SectionHeaderKicker;
SectionHeader.Title = SectionHeaderTitle;
SectionHeader.Description = SectionHeaderDescription;
SectionHeader.Actions = SectionHeaderActions;
