"use client";

import { Fragment, useState } from "react";
import { ImageIcon } from "lucide-react";

import { AdminEmptyState } from "@/components/admin/admin-primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AdminBannerCrud,
  type AdminBannerItem,
} from "@/features/banners/components/admin-banner-crud";

export function AdminBannerTable({ banners }: { banners: AdminBannerItem[] }) {
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

  if (banners.length === 0) {
    return (
      <AdminEmptyState
        icon={ImageIcon}
        title="Банери ще не додані"
        description="Створіть перший банер у формі вище, щоб секція з'явилась на головній."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-20">Preview</TableHead>
          <TableHead>Назва банера</TableHead>
          <TableHead className="w-32">Статус</TableHead>
          <TableHead className="w-24">Порядок</TableHead>
          <TableHead className="w-32 text-right">Дії</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {banners.map((banner) => {
          const isEditing = editingBannerId === banner.id;

          return (
            <Fragment key={banner.id}>
              <TableRow aria-expanded={isEditing}>
                <TableCell>
                  <div className="bg-muted border-border/70 h-20 w-12 overflow-hidden rounded-md border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={banner.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-medium">{banner.title}</p>
                </TableCell>
                <TableCell>
                  <Badge variant={banner.isActive ? "secondary" : "outline"}>
                    {banner.isActive ? "Активний" : "Неактивний"}
                  </Badge>
                </TableCell>
                <TableCell>{banner.sortOrder}</TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    variant={isEditing ? "secondary" : "outline"}
                    size="sm"
                    onClick={() =>
                      setEditingBannerId((current) =>
                        current === banner.id ? null : banner.id,
                      )
                    }
                  >
                    Редагувати
                  </Button>
                </TableCell>
              </TableRow>

              {isEditing ? (
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableCell colSpan={5} className="p-4 whitespace-normal">
                    <AdminBannerCrud
                      mode="edit"
                      selectedBanner={banner}
                      onUpdated={() => setEditingBannerId(null)}
                    />
                  </TableCell>
                </TableRow>
              ) : null}
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}
