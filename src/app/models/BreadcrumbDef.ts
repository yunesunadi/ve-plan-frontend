export type BreadcrumbValue = string | ((data: Record<string, unknown>) => string);
export type BreadcrumbLink = string | unknown[] | ((data: Record<string, unknown>) => string | unknown[]);

export interface BreadcrumbDef {
  label: BreadcrumbValue;
  link?: BreadcrumbLink;
}

export type BreadcrumbDefEntry = string | BreadcrumbDef;
