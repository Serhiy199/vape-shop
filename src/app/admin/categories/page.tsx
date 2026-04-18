import { AdminModuleScaffold, getAdminModuleIcon } from "@/components/admin/admin-module-scaffold";

export default function AdminCategoriesPage() {
  return (
    <AdminModuleScaffold
      eyebrow="Категорії"
      title="Розділ категорій готовий до наповнення"
      description="Тут буде базовий CRUD для кореневих категорій каталогу. Каркас уже підготовлений під список, деталі й форму редагування."
      entityLabel="Категорія"
      emptyTitle="Категорії ще не наповнені"
      emptyDescription="Наступним кроком сюди можна підключити реальні записи з бази, фільтри та операції створення або редагування категорій."
      detailLabel="Вибрана категорія"
      detailDescription="Праворуч буде опис категорії, slug, SEO-поля та пов'язані підкатегорії."
      icon={getAdminModuleIcon("categories")}
      formDemo={{
        title: "Демо форми категорії",
        description: "Типовий create/edit сценарій для сутності каталогу.",
        nameLabel: "Назва категорії",
        slugLabel: "Slug категорії",
        notesLabel: "Опис категорії",
        visibilityLabel: "Показувати категорію на сайті",
      }}
    />
  );
}
