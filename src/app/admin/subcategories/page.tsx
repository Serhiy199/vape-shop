import { AdminModuleScaffold, getAdminModuleIcon } from "@/components/admin/admin-module-scaffold";

export default function AdminSubcategoriesPage() {
  return (
    <AdminModuleScaffold
      eyebrow="Підкатегорії"
      title="Розділ підкатегорій готовий до наповнення"
      description="Тут житиме CRUD для дочірніх категорій із прив'язкою до батьківської категорії та окремими SEO-налаштуваннями."
      entityLabel="Підкатегорія"
      emptyTitle="Підкатегорії ще не наповнені"
      emptyDescription="Маршрут уже готовий до підключення реального каталожного дерева без додаткової роботи над UI-каркасом."
      detailLabel="Вибрана підкатегорія"
      detailDescription="У деталях з'являться батьківська категорія, порядок сортування та видимість у меню."
      icon={getAdminModuleIcon("subcategories")}
      formDemo={{
        title: "Демо форми підкатегорії",
        description: "Після підключення даних тут можна буде швидко зібрати реальну admin-форму.",
        nameLabel: "Назва підкатегорії",
        slugLabel: "Slug підкатегорії",
        notesLabel: "Опис підкатегорії",
        visibilityLabel: "Показувати підкатегорію на сайті",
      }}
    />
  );
}
