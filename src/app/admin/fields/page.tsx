import { AdminModuleScaffold, getAdminModuleIcon } from "@/components/admin/admin-module-scaffold";

export default function AdminFieldsPage() {
  return (
    <AdminModuleScaffold
      eyebrow="Поля"
      title="Розділ полів готовий до наповнення"
      description="Тут можна буде керувати додатковими характеристиками товарів, типами полів та їх відображенням у каталогах і картках."
      entityLabel="Поле"
      emptyTitle="Поля ще не наповнені"
      emptyDescription="UI-каркас уже готовий для майбутнього конструктора характеристик і пов'язаних значень."
      detailLabel="Вибране поле"
      detailDescription="У деталях з'являться тип поля, правила відображення, обов'язковість і зв'язок з категоріями."
      icon={getAdminModuleIcon("fields")}
      formDemo={{
        title: "Демо форми поля",
        description: "Ця форма пізніше стане базою для атрибутів і характеристик товарів.",
        nameLabel: "Назва поля",
        slugLabel: "Ключ поля",
        notesLabel: "Опис або службова примітка",
        visibilityLabel: "Показувати поле в картці товару",
      }}
    />
  );
}
