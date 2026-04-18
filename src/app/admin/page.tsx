import { LayoutPanelTopIcon, WaypointsIcon } from "lucide-react";

import {
  AdminFormActions,
  AdminFormGrid,
  AdminFormSection,
  AdminInputField,
  AdminSelectField,
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

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Адмінка"
        title="Базовий shell уже працює"
        description="Після кроків з layout і navigation адмін-панель уже має стабільний каркас. Тепер додаємо screen primitives, щоб усі наступні розділи збирались з однакових, передбачуваних блоків."
        badges={["Основа адмінки", "Крок 3"]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">UI foundation</Badge>
            <Badge variant="outline">Reusable blocks</Badge>
          </div>
        }
      />

      <AdminStatsGrid
        items={[
          {
            label: "Layout",
            value: "Готово",
            note: "Адмін-зона працює в окремому shell з адаптивним каркасом.",
          },
          {
            label: "Navigation",
            value: "Готово",
            note: "Єдина sidebar-навігація вже покриває всі майбутні модулі.",
          },
          {
            label: "Primitives",
            value: "В процесі",
            note: "На цьому кроці формуємо повторно використовувані screen-блоки.",
          },
          {
            label: "Modules",
            value: "Далі",
            note: "Після цього можемо швидко збирати пусті list/detail сторінки.",
          },
        ]}
      />

      <AdminActionsBar
        actions={[
          { href: "/admin/users", label: "Перейти до користувачів" },
          { href: "/", label: "Відкрити магазин", variant: "outline" },
        ]}
        note="Actions bar буде повторно використовуватись на списках, деталках і формах."
      />

      <AdminSectionCard
        title="Що саме входить у screen primitives"
        description="Це мінімальний набір блоків, з яких зручно збирати будь-який admin-екран без копіювання верстки між сторінками."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border/70 bg-card/90 p-4">
            <p className="text-sm font-medium">Page header</p>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Заголовок сторінки, опис, бейджі та зона швидких дій.
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card/90 p-4">
            <p className="text-sm font-medium">Section card</p>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Універсальна картка для таблиць, списків, форм і допоміжних блоків.
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card/90 p-4">
            <p className="text-sm font-medium">Empty state</p>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Стандартний вигляд для порожніх модулів і ще не наповнених розділів.
            </p>
          </div>
        </div>
      </AdminSectionCard>

      <AdminSectionCard
        title="Поточний стан панелі"
        description="Тут уже видно, як screen primitives можуть складатися в реальний admin-екран."
      >
        <AdminEmptyState
          icon={LayoutPanelTopIcon}
          title="Каркас адмін-екранів готовий до масштабування"
          description="Наступні модулі на кшталт категорій, брендів чи SEO можна буде швидко підключати, не вигадуючи заново header, дії та блоки-заглушки для кожної сторінки."
          action={{
            href: "/admin/users",
            label: "Подивитися приклад у розділі користувачів",
          }}
        />
      </AdminSectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminSectionCard
          title="Стандартизація екранів"
          description="Однаковий ритм секцій допомагає швидше додавати модулі й спрощує подальший редизайн."
        >
          <AdminEmptyState
            icon={WaypointsIcon}
            title="Єдина структура для list/detail сторінок"
            description="Ми вже підготували фундамент, на який у наступному кроці ляжуть list/detail screens, таблиці та інформаційні бокові блоки."
          />
        </AdminSectionCard>

        <AdminSectionCard
          title="Підготовка до admin-форм"
          description="Тепер ми маємо базові primitives для create/edit screen-ів: секції, поля, help text, перемикачі та footer з діями."
        >
          <div className="space-y-4">
            <AdminFormSection
              title="Демо форми товару"
              description="Приклад того, як будуть виглядати типові admin-форми для каталогу, SEO чи промокодів."
            >
              <AdminFormGrid>
                <AdminInputField
                  id="product-name"
                  label="Назва товару"
                  placeholder="Наприклад, Voodoo Salt Mango"
                  hint="Коротка зрозуміла назва для списків і detail screen."
                  defaultValue="Voodoo Salt Mango"
                  required
                />
                <AdminSelectField
                  label="Бренд"
                  placeholder="Оберіть бренд"
                  value="voodoo"
                  hint="Селект використовуватиметься для зв'язків між сутностями."
                  options={[
                    { value: "voodoo", label: "Voodoo" },
                    { value: "chaser", label: "Chaser" },
                    { value: "twisted", label: "Twisted" },
                  ]}
                  required
                />
                <AdminInputField
                  id="sku"
                  label="Артикул"
                  placeholder="SKU-001"
                  hint="Службовий ідентифікатор для пошуку в адмінці."
                  defaultValue="VOO-MNG-30"
                />
                <AdminInputField
                  id="price"
                  label="Ціна"
                  placeholder="0"
                  hint="На реальній формі тут може бути маска або валюта."
                  defaultValue="320"
                  required
                />
              </AdminFormGrid>
            </AdminFormSection>

            <AdminFormSection
              title="Текстові поля та налаштування"
              description="Textarea, switch і footer дій уже мають єдиний admin-стиль."
            >
              <div className="space-y-4">
                <AdminTextareaField
                  id="product-description"
                  label="Короткий опис"
                  placeholder="Опишіть основні характеристики товару"
                  hint="Цей блок буде зручний для описів, SEO та службових нотаток."
                  defaultValue="Яскравий фруктовий смак для лінійки сольових рідин."
                />
                <AdminSwitchField
                  label="Показувати товар у каталозі"
                  description="Перемикач стандартно використовуватиметься для статусів, видимості та feature flags."
                  checked
                />
                <AdminFormActions
                  primaryLabel="Зберегти зміни"
                  secondaryLabel="Скасувати"
                />
              </div>
            </AdminFormSection>
          </div>
        </AdminSectionCard>
      </div>
    </div>
  );
}
