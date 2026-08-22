import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { SearchIcon } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";

import "./emptyState.css";

export type EmptyStateAlign = "center" | "start";
export type EmptyStateSize = "default" | "compact";

export type EmptyStateAction = {
  ariaLabel?: string;
  disabled?: boolean;
  href?: string;
  icon?: ReactNode;
  label: ReactNode;
  onAction?: () => void;
  rel?: string;
  size?: ButtonProps["size"];
  target?: string;
  type?: "button" | "submit" | "reset";
  variant?: ButtonProps["variant"];
};

export type EmptyStateProps = Omit<ComponentPropsWithoutRef<"section">, "title"> & {
  actions?: EmptyStateAction[];
  align?: EmptyStateAlign;
  description?: ReactNode;
  dir?: "ltr" | "rtl" | "auto";
  icon?: ReactNode;
  iconLabel?: string;
  size?: EmptyStateSize;
  title: ReactNode;
};

export function EmptyState({
  actions = [],
  align = "center",
  className,
  description,
  dir,
  icon,
  iconLabel,
  size = "default",
  title,
  ...props
}: EmptyStateProps) {
  const hasActions = actions.length > 0;

  return (
    <section
      className={cx(
        "ds-empty-state",
        `ds-empty-state--${align}`,
        `ds-empty-state--${size}`,
        className,
      )}
      dir={dir}
      {...props}
    >
      <span
        aria-hidden={iconLabel ? undefined : true}
        aria-label={iconLabel}
        className="ds-empty-state__icon-wrap"
        role={iconLabel ? "img" : undefined}
      >
        <span className="ds-empty-state__icon-media">
          {icon ?? <SearchIcon />}
        </span>
      </span>

      <div className="ds-empty-state__copy">
        <h3 className="ds-empty-state__title" dir="auto">
          {title}
        </h3>
        {description && (
          <p className="ds-empty-state__description" dir="auto">
            {description}
          </p>
        )}
      </div>

      {hasActions && (
        <div className="ds-empty-state__actions">
          {actions.map((action, index) => (
            <EmptyStateActionButton
              action={action}
              actionCount={actions.length}
              index={index}
              key={index}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function EmptyStateActionButton({
  action,
  actionCount,
  index,
}: {
  action: EmptyStateAction;
  actionCount: number;
  index: number;
}) {
  const variant =
    action.variant ?? (actionCount > 1 && index === 0 ? "secondary" : "default");
  const content = (
    <>
      {action.icon}
      {action.label}
    </>
  );

  if (action.href) {
    const isDisabled = Boolean(action.disabled);

    return (
      <Button
        aria-label={action.ariaLabel}
        asChild
        size={action.size ?? "default"}
        variant={variant}
      >
        <a
          aria-disabled={isDisabled || undefined}
          href={isDisabled ? undefined : action.href}
          rel={action.rel ?? (action.target === "_blank" ? "noreferrer" : undefined)}
          target={action.target}
        >
          {content}
        </a>
      </Button>
    );
  }

  return (
    <Button
      aria-label={action.ariaLabel}
      disabled={action.disabled}
      onClick={action.onAction}
      size={action.size ?? "default"}
      type={action.type ?? "button"}
      variant={variant}
    >
      {content}
    </Button>
  );
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
