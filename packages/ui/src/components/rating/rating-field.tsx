"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { Label, Hint } from "../field";
import { Rating, type RatingProps } from "./rating";

export interface RatingFieldProps extends RatingProps {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  errorMessage?: React.ReactNode;
  required?: boolean;
  containerClassName?: string;
}

export const RatingField = React.forwardRef<HTMLDivElement, RatingFieldProps>(
  (
    {
      id: customId,
      label,
      helperText,
      errorMessage,
      required,
      className,
      containerClassName,
      "aria-describedby": ariaDescribedBy,
      ...ratingProps
    },
    ref
  ) => {
    const generatedId = React.useId();
    const id = customId || generatedId;
    const helperId = helperText ? `${id}-helper` : undefined;
    const errorId = errorMessage ? `${id}-error` : undefined;

    const describedBy = [ariaDescribedBy, helperId, errorId].filter(Boolean).join(" ") || undefined;

    return (
      <div className={cn("flex flex-col gap-1.5", containerClassName)}>
        {label && (
          <Label htmlFor={id} required={required}>
            {label}
          </Label>
        )}
        <Rating
          ref={ref}
          id={id}
          className={className}
          aria-describedby={describedBy}
          {...ratingProps}
        />
        {helperText && <Hint id={helperId}>{helperText}</Hint>}
        {errorMessage && (
          <Hint id={errorId} error>
            {errorMessage}
          </Hint>
        )}
      </div>
    );
  }
);

RatingField.displayName = "RatingField";
