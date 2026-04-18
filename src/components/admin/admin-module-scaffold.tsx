import {
  BoxesIcon,
  MegaphoneIcon,
  PackageIcon,
  ScanSearchIcon,
  SearchCheckIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  TagsIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import {
  AdminDetailList,
  AdminListTable,
  AdminSplitLayout,
} from "@/components/admin/admin-data-primitives";
import {
  AdminFormActions,
  AdminFormGrid,
  AdminFormSection,
  AdminInputField,
  AdminSwitchField,
  AdminTextareaField,
} from "@/components/admin/admin-form-primitives";
import {
  AdminActionsBar,
  AdminEmptyState,
  AdminPageHeader,
  AdminSectionCard,
  AdminStatsGrid,
} from "@/components/admin/admin-primitives";
import { Badge } from "@/components/ui/badge";

type AdminModuleScaffoldProps = {
  eyebrow: string;
  title: string;
  description: string;
  entityLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  detailLabel: string;
  detailDescription: string;
  icon: LucideIcon;
  statusLabel?: string;
  formDemo?: {
    title: string;
    description: string;
    nameLabel: string;
    slugLabel: string;
    notesLabel: string;
    visibilityLabel: string;
  };
};

const iconByEntity: Record<string, LucideIcon> = {
  categories: BoxesIcon,
  subcategories: TagsIcon,
  brands: TagsIcon,
  products: PackageIcon,
  fields: ScanSearchIcon,
  orders: ShoppingCartIcon,
  users: UsersIcon,
  "promo-codes": MegaphoneIcon,
  seo: SearchCheckIcon,
};

export function getAdminModuleIcon(entity: string) {
  return iconByEntity[entity] ?? ShieldCheckIcon;
}

export function AdminModuleScaffold({
  eyebrow,
  title,
  description,
  entityLabel,
  emptyTitle,
  emptyDescription,
  detailLabel,
  detailDescription,
  icon: Icon,
  statusLabel = "Чернетка",
  formDemo,
}: AdminModuleScaffoldProps) {
  const demoItems = [
    {
      name: `${entityLabel} 01`,
      slug: `${entityLabel.toLowerCase().replace(/\s+/g, "-")}-01`,
      status: "Чернетка",
    },
    {
      name: `${entityLabel} 02`,
      slug: `${entityLabel.toLowerCase().replace(/\s+/g, "-")}-02`,
      status: "Очікує наповнення",
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        badges={["Admin Foundation", "Пустий розділ"]}
      />

      <AdminStatsGrid
        items={[
          {
            label: "Статус",
            value: "Готовий shell",
            note: "Розділ уже живе в єдиній адмін-структурі.",
          },
          {
            label: "List view",
            value: "Підготовлено",
            note: "Є місце для таблиці, фільтрів і швидких дій.",
          },
          {
            label: "Detail view",
            value: "Підготовлено",
            note: "Права колонка вже готова під детальний перегляд запису.",
          },
          {
            label: "Форма",
            value: formDemo ? "Показано" : "Наступним кроком",
            note: formDemo
              ? "Секції форми можна підключати без нової локальної верстки."
              : "Create/edit сценарії ляжуть на готові form primitives.",
          },
        ]}
      />

      <AdminActionsBar
        actions={[
          { href: "/admin", label: "Повернутися до огляду", variant: "outline" },
          { href: "/", label: "Відкрити магазин", variant: "outline" },
        ]}
        note={`Цей розділ уже можна наповнювати логікою для сутності "${entityLabel}".`}
      />

      <AdminSectionCard
        title="Базовий list/detail каркас"
        description="Порожній модуль уже має правильну структуру для списку записів і детального перегляду вибраного елемента."
      >
        <AdminSplitLayout
          list={
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Список розділу</p>
                  <p className="text-muted-foreground text-sm leading-6">
                    Тимчасові елементи лише для візуальної перевірки каркаса.
                  </p>
                </div>
                <Badge variant="outline">{demoItems.length} записи</Badge>
              </div>

              <AdminListTable
                items={demoItems}
                columns={[
                  {
                    key: "name",
                    header: entityLabel,
                    cell: (item) => (
                      <div className="space-y-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-muted-foreground text-xs">{item.slug}</p>
                      </div>
                    ),
                  },
                  {
                    key: "status",
                    header: "Статус",
                    className: "w-48",
                    cell: (item) => (
                      <Badge variant={item.status === "Чернетка" ? "outline" : "secondary"}>
                        {item.status}
                      </Badge>
                    ),
                  },
                ]}
                emptyState={
                  <AdminEmptyState
                    icon={Icon}
                    title={emptyTitle}
                    description={emptyDescription}
                  />
                }
              />
            </div>
          }
          detail={
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Панель деталей</p>
                <p className="text-muted-foreground text-sm leading-6">
                  Праворуч уже є місце під детальний перегляд вибраного запису.
                </p>
              </div>

              <AdminDetailList
                items={[
                  {
                    label: detailLabel,
                    value: `${entityLabel} 01`,
                    note: detailDescription,
                  },
                  {
                    label: "Стан",
                    value: statusLabel,
                    note: "На реальному модулі тут будуть статуси, дати й технічні поля.",
                  },
                  {
                    label: "Наступний крок",
                    value: "Підключити реальні дані та дії",
                    note: "Каркас detail view уже готовий і не потребує нової верстки.",
                  },
                ]}
              />
            </div>
          }
        />
      </AdminSectionCard>

      {formDemo ? (
        <AdminSectionCard
          title="Демо секції форми"
          description="Показує, як create/edit сценарій цього розділу ляже на вже готові form primitives."
        >
          <div className="space-y-4">
            <AdminFormSection
              title={formDemo.title}
              description={formDemo.description}
            >
              <AdminFormGrid>
                <AdminInputField
                  id={`${eyebrow}-name`}
                  label={formDemo.nameLabel}
                  defaultValue={`${entityLabel} demo`}
                  placeholder="Введіть назву"
                />
                <AdminInputField
                  id={`${eyebrow}-slug`}
                  label={formDemo.slugLabel}
                  defaultValue={`${eyebrow.toLowerCase()}-demo`}
                  placeholder="slug-demo"
                />
              </AdminFormGrid>
              <div className="mt-4 space-y-4">
                <AdminTextareaField
                  id={`${eyebrow}-notes`}
                  label={formDemo.notesLabel}
                  defaultValue="Тут з'явиться опис або службова примітка для майбутньої форми."
                  placeholder="Введіть текст"
                />
                <AdminSwitchField
                  label={formDemo.visibilityLabel}
                  description="Перемикач уже готовий для статусів, публікації та видимості."
                  checked
                />
                <AdminFormActions
                  primaryLabel="Зберегти"
                  secondaryLabel="Скасувати"
                />
              </div>
            </AdminFormSection>
          </div>
        </AdminSectionCard>
      ) : null}
    </div>
  );
}
