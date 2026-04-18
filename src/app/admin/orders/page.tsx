import { AdminModuleScaffold, getAdminModuleIcon } from "@/components/admin/admin-module-scaffold";

export default function AdminOrdersPage() {
  return (
    <AdminModuleScaffold
      eyebrow="Замовлення"
      title="Розділ замовлень готовий до наповнення"
      description="Тут буде робочий центр для перегляду нових замовлень, статусів, клієнтських даних і фінальної обробки покупки."
      entityLabel="Замовлення"
      emptyTitle="Замовлення ще не наповнені"
      emptyDescription="Поки що це каркас, але він уже готовий для списку замовлень, detail panel і службових дій."
      detailLabel="Вибране замовлення"
      detailDescription="У деталях будуть статус, покупець, склад замовлення, сума та історія обробки."
      icon={getAdminModuleIcon("orders")}
      statusLabel="Очікує бізнес-логіку"
    />
  );
}
