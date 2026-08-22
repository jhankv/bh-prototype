import type { ReactNode } from "react";
import {
  ChevronRightIcon,
  EllipsisIcon,
  FolderIcon,
  HomeIcon,
} from "lucide-react";
import "./breadcrumbs.css";

export type BreadcrumbSeparator = "slash" | "chevron";
export type BreadcrumbStyle = "default" | "raised";

export type BreadcrumbItem = {
  label: string;
  href?: string;
  icon?: ReactNode;
  current?: boolean;
};

export type BreadcrumbsProps = {
  "aria-label"?: string;
  className?: string;
  dir?: "ltr" | "rtl" | "auto";
  iconOnly?: boolean;
  items: BreadcrumbItem[];
  maxItems?: number;
  overflowLabel?: string;
  separator?: BreadcrumbSeparator;
  style?: BreadcrumbStyle;
};

type VisibleBreadcrumbItem = BreadcrumbItem & { overflow?: boolean };

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function visibleItems(
  items: BreadcrumbItem[],
  maxItems?: number,
  overflowLabel?: string,
): VisibleBreadcrumbItem[] {
  if (!maxItems || maxItems < 3 || items.length <= maxItems) {
    return items;
  }

  const tailCount = maxItems - 2;
  return [items[0], { label: overflowLabel ?? "", overflow: true }, ...items.slice(-tailCount)];
}

export function Breadcrumbs({
  "aria-label": ariaLabel,
  className,
  dir,
  iconOnly = false,
  items,
  maxItems,
  overflowLabel,
  separator = "slash",
  style: surfaceStyle = "default",
}: BreadcrumbsProps) {
  const renderedItems = visibleItems(items, maxItems, overflowLabel);

  return (
    <nav
      aria-label={ariaLabel}
      className={cx(
        "ds-breadcrumbs",
        `ds-breadcrumbs--${surfaceStyle}`,
        `ds-breadcrumbs--${separator}`,
        iconOnly && "ds-breadcrumbs--icon-only",
        className,
      )}
      dir={dir}
    >
      <ol>
        {renderedItems.map((item, index) => {
          const isLast = index === renderedItems.length - 1;
          const isCurrent = item.current || isLast;
          const content = (
            <>
              <span className="ds-breadcrumbs__icon" aria-hidden={item.icon ? "true" : undefined}>
                {item.overflow ? <OverflowIcon /> : item.icon}
              </span>
              <span className={cx("ds-breadcrumbs__label", iconOnly && "ds-breadcrumbs__label--hidden")}>
                {item.label}
              </span>
            </>
          );

          return (
            <li key={`${item.label}-${index}`}>
              {index > 0 && <Separator separator={separator} />}
              {item.href && !isCurrent && !item.overflow ? (
                <a href={item.href}>{content}</a>
              ) : (
                <span aria-current={isCurrent ? "page" : undefined} className={isCurrent ? "is-current" : undefined}>
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function Separator({ separator }: { separator: BreadcrumbSeparator }) {
  return (
    <span aria-hidden="true" className="ds-breadcrumbs__separator">
      {separator === "slash" ? "/" : <ChevronIcon />}
    </span>
  );
}

export function BreadcrumbHomeIcon() {
  return <HomeIcon aria-hidden="true" strokeWidth="var(--bh-icon-stroke-190)" />;
}

export function BreadcrumbFolderIcon() {
  return <FolderIcon aria-hidden="true" strokeWidth="var(--bh-icon-stroke-190)" />;
}

function ChevronIcon() {
  return <ChevronRightIcon aria-hidden="true" strokeWidth="var(--bh-icon-stroke-200)" />;
}

function OverflowIcon() {
  return <EllipsisIcon aria-hidden="true" strokeWidth="var(--bh-icon-stroke-225)" />;
}
