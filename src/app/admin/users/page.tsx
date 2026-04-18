import { ShieldUserIcon, UsersIcon } from "lucide-react";

import {
  AdminDetailList,
  AdminListTable,
  AdminSplitLayout,
} from "@/components/admin/admin-data-primitives";
import {
  AdminActionsBar,
  AdminEmptyState,
  AdminPageHeader,
  AdminSectionCard,
  AdminStatsGrid,
} from "@/components/admin/admin-primitives";
import { Badge } from "@/components/ui/badge";

const mockUsers = [
  {
    name: "Олена Гнатюк",
    email: "olena@example.com",
    role: "Клієнт",
    status: "Активний",
  },
  {
    name: "Сергій Мельник",
    email: "serhii@example.com",
    role: "Адміністратор",
    status: "Активний",
  },
  {
    name: "Ірина Коваль",
    email: "iryna@example.com",
    role: "Клієнт",
    status: "Очікує дій",
  },
];

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Користувачі"
        title="Розділ користувачів уже підключений до нового каркаса"
        description="Ця сторінка зараз виступає тестовим майданчиком для screen primitives. Вона показує, як виглядатиме типова admin-сторінка без прив'язки до конкретної бізнес-логіки."
        badges={["Лише для адміністратора", "Screen primitives"]}
      />

      <AdminStatsGrid
        items={[
          {
            label: "Доступ",
            value: "Захищено",
            note: "Маршрут відкривається лише адміністратору.",
          },
          {
            label: "Layout",
            value: "Єдиний",
            note: "Сторінка використовує спільний admin shell та navigation.",
          },
          {
            label: "Header",
            value: "Винесено",
            note: "Заголовок зібрано через окремий reusable primitive.",
          },
          {
            label: "Empty state",
            value: "Готово",
            note: "Є стандартний блок для ще не наповнених модулів.",
          },
        ]}
      />

      <AdminActionsBar
        actions={[
          { href: "/admin", label: "Повернутися до огляду", variant: "outline" },
          { href: "/", label: "Відкрити магазин", variant: "outline" },
        ]}
        note="Коли тут з'явиться реальний CRUD, ця панель стане місцем для пошуку, фільтрів і створення нового користувача."
      />

      <AdminSectionCard
        title="Приклад list/detail екрана"
        description="Це вже каркас типової admin-сторінки: зліва список, справа блок деталей вибраного елемента."
      >
        <AdminSplitLayout
          list={
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Список користувачів</p>
                  <p className="text-muted-foreground text-sm leading-6">
                    Тимчасові дані для перевірки шаблону list view.
                  </p>
                </div>
                <Badge variant="outline">{mockUsers.length} записи</Badge>
              </div>

              <AdminListTable
                items={mockUsers}
                columns={[
                  {
                    key: "name",
                    header: "Користувач",
                    cell: (item) => (
                      <div className="space-y-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-muted-foreground text-xs">{item.email}</p>
                      </div>
                    ),
                  },
                  {
                    key: "role",
                    header: "Роль",
                    className: "w-40",
                    cell: (item) => item.role,
                  },
                  {
                    key: "status",
                    header: "Статус",
                    className: "w-40",
                    cell: (item) => (
                      <Badge variant={item.status === "Активний" ? "secondary" : "outline"}>
                        {item.status}
                      </Badge>
                    ),
                  },
                ]}
                emptyState={
                  <AdminEmptyState
                    icon={UsersIcon}
                    title="Список користувачів буде додано наступними кроками"
                    description="На цьому етапі ми свідомо не реалізуємо CRUD. Головна мета зараз — закріпити однакову структуру екранів і підготувати місце для майбутньої таблиці, фільтрів та детального перегляду користувача."
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
                  Праворуч житиме детальний перегляд вибраного запису.
                </p>
              </div>

              <AdminDetailList
                items={[
                  {
                    label: "Вибраний користувач",
                    value: "Сергій Мельник",
                    note: "Зараз це демонстраційний placeholder для detail view.",
                  },
                  {
                    label: "Роль",
                    value: "Адміністратор",
                    note: "У реальному модулі тут можуть бути також права доступу.",
                  },
                  {
                    label: "Стан акаунта",
                    value: "Активний",
                    note: "Далі сюди можна додати історію входів, замовлення та промокоди.",
                  },
                  {
                    label: "Наступний крок",
                    value: "Підключити реальні дані та detail screen",
                    note: "Поточний блок уже дає нам готову структуру для правої колонки.",
                  },
                ]}
              />
            </div>
          }
        />
      </AdminSectionCard>

      <AdminSectionCard
        title="Перевірка периметра доступу"
        description="Сторінка досі виконує роль контрольної точки для перевірки захисту вкладених admin-маршрутів."
      >
        <AdminEmptyState
          icon={ShieldUserIcon}
          title="Server-side guard працює коректно"
          description="Якщо цей екран бачить тільки адміністратор, значить захист вкладених маршрутів у зоні /admin/* і далі працює правильно поверх нового layout та нової навігації."
        />
      </AdminSectionCard>
    </div>
  );
}
