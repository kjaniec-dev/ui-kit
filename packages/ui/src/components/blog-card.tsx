import * as React from "react";
import { cn } from "../lib/cn";
import { Card } from "./card";
import { Badge } from "./badge";
import { Avatar } from "./avatar";

export interface BlogCardAuthor {
  name: string;
  avatarUrl?: string;
  role?: string;
}

export interface BlogCardProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "title"> {
  title: string;
  description?: string;
  coverUrl?: string;
  coverAlt?: string;
  category?: string;
  readTime?: string;
  publishedAt?: string;
  author?: BlogCardAuthor;
  orientation?: "vertical" | "horizontal";
  href?: string;
}

export const BlogCard = React.forwardRef<HTMLElement, BlogCardProps>(
  (
    {
      className,
      title,
      description,
      coverUrl,
      coverAlt,
      category,
      readTime,
      publishedAt,
      author,
      orientation = "vertical",
      href,
      ...props
    },
    ref
  ) => {
    const isHorizontal = orientation === "horizontal";
    const isInteractive = Boolean(href || props.onClick);

    return (
      <Card
        ref={ref}
        as={href ? "a" : "div"}
        href={href}
        interactive={isInteractive}
        className={cn(
          "group flex overflow-hidden transition-all duration-300",
          isHorizontal ? "flex-col sm:flex-row" : "flex-col",
          className
        )}
        {...props}
      >
        {coverUrl && (
          <div
            className={cn(
              "relative overflow-hidden bg-muted shrink-0",
              isHorizontal ? "w-full sm:w-2/5 min-h-[160px]" : "w-full aspect-[16/9]"
            )}
          >
            <img
              src={coverUrl}
              alt={coverAlt || title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[0.75rem] text-muted-foreground">
              {category && <Badge variant="secondary">{category}</Badge>}
              {(readTime || publishedAt) && (
                <span>
                  {publishedAt} {publishedAt && readTime && "•"} {readTime}
                </span>
              )}
            </div>

            <h3 className="text-base font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
              {title}
            </h3>

            {description && (
              <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{description}</p>
            )}
          </div>

          {author && (
            <div className="mt-4 flex items-center gap-2.5 border-t border-border/60 pt-3">
              <Avatar src={author.avatarUrl} alt={author.name} size="sm">
                {author.name.charAt(0)}
              </Avatar>
              <div className="flex flex-col text-xs">
                <span className="font-semibold text-foreground">{author.name}</span>
                {author.role && (
                  <span className="text-[0.7rem] text-muted-foreground">{author.role}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }
);
BlogCard.displayName = "BlogCard";
