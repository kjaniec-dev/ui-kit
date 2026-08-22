import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const avatarVariants = cva(
  "grid place-items-center shrink-0 rounded-full font-semibold border-2 border-surface",
  {
    variants: {
      size: {
        sm: "h-7 w-7 text-[0.7rem]",
        md: "h-9 w-9 text-[0.8rem]",
        lg: "h-12 w-12 text-base",
      },
      tone: {
        secondary: "bg-secondary text-secondary-foreground",
        primary: "bg-primary text-primary-foreground",
        info: "bg-info text-white",
        muted: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { size: "md", tone: "secondary" },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof avatarVariants> {
  /** Image URL; falls back to initials/children when absent. */
  src?: string;
  alt?: string;
  /** Show an online status dot. */
  status?: boolean;
}

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, size, tone, src, alt, status, children, ...props }, ref) => {
    const node = (
      <span
        ref={ref}
        className={cn(avatarVariants({ size, tone }), "overflow-hidden", className)}
        {...props}
      >
        {src ? <img src={src} alt={alt} className="h-full w-full object-cover" /> : children}
      </span>
    );
    if (!status) return node;
    return (
      <span className="relative inline-flex">
        {node}
        <span className="absolute -right-px -bottom-px h-[0.7rem] w-[0.7rem] rounded-full bg-success border-2 border-surface" />
      </span>
    );
  }
);
Avatar.displayName = "Avatar";

/** Overlapping cluster of avatars. */
export const AvatarGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex [&>*:not(:first-child)]:-ml-2.5", className)} {...props} />
  )
);
AvatarGroup.displayName = "AvatarGroup";
