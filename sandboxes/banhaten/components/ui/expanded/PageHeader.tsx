import type { ElementType, ReactNode } from "react";
import { HomeIcon as LucideHomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs as OwnedBreadcrumbs } from "./Breadcrumbs";
import { Tabs, type TabsProps } from "../tabs";
import "./pageHeader.css";

export type PageHeaderBreadcrumb = {
  label: string;
  href?: string;
  current?: boolean;
  icon?: ReactNode;
};

export type PageHeaderAction = {
  label: string;
  ariaLabel?: string;
  disabled?: boolean;
  href?: string;
  onClick?: () => void;
};

export type PageHeaderTabs = Pick<
  TabsProps,
  "activeIndex" | "ariaLabel" | "defaultActiveIndex" | "items" | "onActiveIndexChange"
>;

export type PageHeaderProps = {
  actions?: PageHeaderAction[] | false;
  breadcrumbLabel?: string;
  breadcrumbs?: PageHeaderBreadcrumb[] | false;
  className?: string;
  description?: string;
  dir?: "ltr" | "rtl";
  icon?: ReactNode | false;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  metaInfo?: string;
  tabs?: PageHeaderTabs | false;
  title?: string;
};

function classes(...names: Array<string | false | undefined>) {
  return names.filter(Boolean).join(" ");
}

function HomeIcon() {
  return <LucideHomeIcon aria-hidden="true" className="ds-page-header__home-icon" strokeWidth="var(--bh-icon-stroke-190)" />;
}

function Action({ action }: { action: PageHeaderAction }) {
  const className = "ds-page-header__action";
  const label = <span>{action.label}</span>;

  if (action.href) {
    return (
      <Button asChild className={className} variant="secondary">
        <a
          aria-disabled={action.disabled || undefined}
          aria-label={action.ariaLabel}
          href={action.disabled ? undefined : action.href}
          onClick={(event) => {
            if (action.disabled) {
              event.preventDefault();
              return;
            }
            action.onClick?.();
          }}
          tabIndex={action.disabled ? -1 : undefined}
        >
          {label}
        </a>
      </Button>
    );
  }

  return (
    <Button
      aria-label={action.ariaLabel}
      className={className}
      disabled={action.disabled}
      onClick={action.onClick}
      type="button"
      variant="secondary"
    >
      {label}
    </Button>
  );
}

export function PageHeader({
  actions = [],
  breadcrumbLabel,
  breadcrumbs = [],
  className,
  description,
  dir,
  headingLevel = 1,
  icon,
  metaInfo,
  tabs = {},
  title,
}: PageHeaderProps) {
  const breadcrumbItems = breadcrumbs === false ? [] : breadcrumbs;
  const actionItems = actions === false ? [] : actions;
  const showIcon = icon !== false;
  const Heading = `h${headingLevel}` as ElementType;

  return (
    <header className={classes("ds-page-header", className)} dir={dir}>
      {breadcrumbItems.length > 0 && (
        <OwnedBreadcrumbs
          aria-label={breadcrumbLabel ?? "Breadcrumb"}
          className="ds-page-header__breadcrumbs"
          dir={dir}
          items={breadcrumbItems}
        />
      )}

      <div className="ds-page-header__section">
        <div className="ds-page-header__topline">
          <div className="ds-page-header__copy">
            <div className="ds-page-header__heading-row">
              <div className="ds-page-header__heading-main">
                {showIcon && <span className="ds-page-header__icon">{icon ?? <HomeIcon />}</span>}
                {title && <Heading className="ds-page-header__title">{title}</Heading>}
              </div>
              {metaInfo && (
                <span className="ds-page-header__meta">
                  {metaInfo}
                </span>
              )}
            </div>
            {description && (
              <p className="ds-page-header__description">
                {description}
              </p>
            )}
          </div>

          {actionItems.length > 0 && (
            <div className="ds-page-header__actions">
              {actionItems.map((action, index) => (
                <Action action={action} key={`${action.label}-${index}`} />
              ))}
            </div>
          )}
        </div>

        {tabs !== false && (
          <Tabs
            ariaLabel={tabs.ariaLabel}
            className="ds-page-header__tabs"
            fullWidth
            items={tabs.items}
            activeIndex={tabs.activeIndex}
            defaultActiveIndex={tabs.defaultActiveIndex}
            onActiveIndexChange={tabs.onActiveIndexChange}
            size="md"
            variant="underline"
            dir={dir}
          />
        )}
      </div>
    </header>
  );
}
