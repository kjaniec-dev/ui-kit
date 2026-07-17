import * as React from "react";
import { cn } from "../lib/cn";

export type TimelineAlign = "left" | "right" | "alternate";
export type TimelineDotVariant = "default" | "primary" | "secondary" | "success" | "warning" | "danger";
export type TimelineDotSize = "sm" | "md" | "lg";

interface TimelineCtx {
  align: TimelineAlign;
}
const TimelineContext = React.createContext<TimelineCtx | null>(null);

export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: TimelineAlign;
}

export const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  ({ align = "left", className, children, ...props }, ref) => {
    // Clone children to inject index so alternating items can position themselves odd/even
    const childrenWithIndex = React.Children.map(children, (child, index) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement<any>, {
          index,
        });
      }
      return child;
    });

    return (
      <TimelineContext.Provider value={{ align }}>
        <div
          ref={ref}
          role="list"
          className={cn("flex flex-col gap-6 w-full", className)}
          {...props}
        >
          {childrenWithIndex}
        </div>
      </TimelineContext.Provider>
    );
  }
);
Timeline.displayName = "Timeline";

export interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  index?: number;
}

export const TimelineItem = React.forwardRef<HTMLDivElement, TimelineItemProps>(
  ({ className, index = 0, children, ...props }, ref) => {
    const ctx = React.useContext(TimelineContext);
    if (!ctx) throw new Error("TimelineItem must be used within a Timeline");

    const { align } = ctx;
    const isEven = index % 2 === 0;

    // Grid config per alignment
    const gridClass = cn(
      "grid w-full gap-4 items-start group/timeline-item",
      align === "left" && "grid-cols-[auto_1fr]",
      align === "right" && "grid-cols-[1fr_auto] text-right",
      align === "alternate" && "md:grid-cols-[1fr_auto_1fr] grid-cols-[auto_1fr]"
    );

    // Pass isEven and align context properties down by mapping children
    const childrenWithLayout = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement<any>, {
          isEven,
          align,
        });
      }
      return child;
    });

    return (
      <div
        ref={ref}
        role="listitem"
        className={cn(gridClass, className)}
        {...props}
      >
        {childrenWithLayout}
      </div>
    );
  }
);
TimelineItem.displayName = "TimelineItem";

export interface TimelineSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  isEven?: boolean;
  align?: TimelineAlign;
}

export const TimelineSeparator = React.forwardRef<HTMLDivElement, TimelineSeparatorProps>(
  ({ className, isEven, align, ...props }, ref) => {
    const separatorClass = cn(
      "flex flex-col items-center justify-self-center h-full min-h-[40px]",
      align === "alternate" && "md:col-start-2 col-start-1",
      align === "left" && "col-start-1",
      align === "right" && "col-start-2",
      className
    );

    return <div ref={ref} className={separatorClass} {...props} />;
  }
);
TimelineSeparator.displayName = "TimelineSeparator";

export interface TimelineConnectorProps extends React.HTMLAttributes<HTMLDivElement> {
  dashed?: boolean;
}

export const TimelineConnector = React.forwardRef<HTMLDivElement, TimelineConnectorProps>(
  ({ className, dashed, ...props }, ref) => {
    const connectorClass = cn(
      "grow bg-border group-last/timeline-item:hidden",
      dashed ? "w-0 border-l border-dashed border-border" : "w-0.5",
      className
    );

    return <div ref={ref} className={connectorClass} {...props} />;
  }
);
TimelineConnector.displayName = "TimelineConnector";

export interface TimelineDotProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: TimelineDotVariant;
  size?: TimelineDotSize;
}

export const TimelineDot = React.forwardRef<HTMLDivElement, TimelineDotProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "w-2.5 h-2.5 rounded-full my-1.5",
      md: "w-4 h-4 rounded-full my-1 border-2 bg-background border-border",
      lg: "w-8 h-8 rounded-full border flex items-center justify-center bg-background text-[0.8rem]",
    };

    const variantClasses = {
      default: "border-border text-muted-foreground",
      primary: "border-primary bg-primary/5 text-primary",
      secondary: "border-secondary bg-secondary/5 text-secondary",
      success: "border-success bg-success-surface text-success",
      warning: "border-warning bg-warning-surface text-warning",
      danger: "border-danger bg-danger-surface text-danger",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "shrink-0 select-none",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);
TimelineDot.displayName = "TimelineDot";

export interface TimelineContentProps extends React.HTMLAttributes<HTMLDivElement> {
  isEven?: boolean;
  align?: TimelineAlign;
}

export const TimelineContent = React.forwardRef<HTMLDivElement, TimelineContentProps>(
  ({ className, isEven, align, ...props }, ref) => {
    const contentClass = cn(
      "pb-8 flex flex-col gap-1 w-full",
      align === "left" && "col-start-2 text-left",
      align === "right" && "col-start-1 text-right",
      align === "alternate" && (
        isEven 
          ? "md:col-start-3 col-start-2 text-left" 
          : "md:col-start-1 col-start-2 md:text-right text-left"
      ),
      className
    );

    return <div ref={ref} className={contentClass} {...props} />;
  }
);
TimelineContent.displayName = "TimelineContent";

export const TimelineTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h4
      ref={ref}
      className={cn("m-0 text-sm font-semibold tracking-[-0.01em] text-foreground", className)}
      {...props}
    />
  )
);
TimelineTitle.displayName = "TimelineTitle";

export const TimelineTime = React.forwardRef<HTMLTimeElement, React.HTMLAttributes<HTMLTimeElement>>(
  ({ className, ...props }, ref) => (
    <time
      ref={ref}
      className={cn("text-[0.75rem] text-muted-foreground font-normal", className)}
      {...props}
    />
  )
);
TimelineTime.displayName = "TimelineTime";
