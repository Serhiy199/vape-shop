import { AdminModuleScaffold, getAdminModuleIcon } from "@/components/admin/admin-module-scaffold";

export default function AdminProductsPage() {
  return (
    <AdminModuleScaffold
      eyebrow="Товари"
      title="Розділ товарів готовий до наповнення"
      description="Саме тут з'явиться головний CRUD каталогу: картки товарів, ціни, статуси, зв'язки з брендами та категоріями."
      entityLabel="Товар"
      emptyTitle="Товари ще не наповнені"
      emptyDescription="Маршрут уже готовий до підключення реальних товарів, списку, фільтрів, detail screen і форми редагування."
      detailLabel="Вибраний товар"
      detailDescription="У деталях будуть ціна, бренд, категорія, статус, SKU та службові метадані."
      icon={getAdminModuleIcon("products")}
      statusLabel="Підготовлено до CRUD"
      formDemo={{
        title: "Демо форми товару",
        description: "Тут найчастіше використовуватиметься повний набір form primitives.",
        nameLabel: "Назва товару",
        slugLabel: "Slug товару",
        notesLabel: "Короткий опис товару",
        visibilityLabel: "Показувати товар на сайті",
      }}
    />
  );
}
