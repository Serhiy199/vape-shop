import type { ReactNode } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AdminListColumn<T> = {
  key: string;
  header: string;
  className?: string;
  cell: (item: T) => ReactNode;
};

export function AdminSplitLayout({
  list,
  detail,
}: {
  list: ReactNode;
  detail: ReactNode;
}) {
  return <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">{list}{detail}</div>;
}

export function AdminListTable<T>({
  columns,
  items,
  emptyState,
}: {
  columns: AdminListColumn<T>[];
  items: T[];
  emptyState?: ReactNode;
}) {
  if (!items.length) {
    return emptyState ?? null;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key} className={column.className}>
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, index) => (
          <TableRow key={index}>
            {columns.map((column) => (
              <TableCell key={column.key} className={column.className}>
                {column.cell(item)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function AdminDetailList({
  items,
}: {
  items: Array<{ label: string; value: ReactNode; note?: string }>;
}) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-border/70 bg-card/90 p-4"
        >
          <p className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
            {item.label}
          </p>
          <div className="mt-2 text-sm leading-6 font-medium">{item.value}</div>
          {item.note ? (
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              {item.note}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
