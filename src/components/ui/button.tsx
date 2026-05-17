import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-card hover:-translate-y-0.5 hover:shadow-glow",
        secondary: "bg-surface text-foreground border border-border hover:bg-primaryLight/50",
        ghost: "bg-transparent text-foreground hover:bg-muted",
        danger: "bg-danger text-danger-foreground hover:opacity-90"
      }
    },
    defaultVariants: {
      variant: "primary"
    }
  }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />;
}
