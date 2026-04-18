import { AdminModuleScaffold, getAdminModuleIcon } from "@/components/admin/admin-module-scaffold";

export default function AdminBrandsPage() {
  return (
    <AdminModuleScaffold
      eyebrow="Бренди"
      title="Розділ брендів готовий до наповнення"
      description="Тут з'явиться керування брендами, їх slug, логотипами й пов'язаними товарами."
      entityLabel="Бренд"
      emptyTitle="Бренди ще не наповнені"
      emptyDescription="Каркас уже готовий для таблиці брендів, detail panel та create/edit сценарію."
      detailLabel="Вибраний бренд"
      detailDescription="У деталях можна буде показувати бренд, опис, видимість і пов'язані товари."
      icon={getAdminModuleIcon("brands")}
      formDemo={{
        title: "Демо форми бренду",
        description: "Секції форми вже підходять для брендів, SEO та службових полів.",
        nameLabel: "Назва бренду",
        slugLabel: "Slug бренду",
        notesLabel: "Опис бренду",
        visibilityLabel: "Показувати бренд у каталозі",
      }}
    />
  );
}
