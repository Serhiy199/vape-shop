import { AdminModuleScaffold, getAdminModuleIcon } from "@/components/admin/admin-module-scaffold";

export default function AdminPromoCodesPage() {
  return (
    <AdminModuleScaffold
      eyebrow="Промокоди"
      title="Розділ промокодів готовий до наповнення"
      description="Тут з'явиться керування акційними кодами, умовами використання, строками дії та зв'язком з категоріями або товарами."
      entityLabel="Промокод"
      emptyTitle="Промокоди ще не наповнені"
      emptyDescription="Каркас уже дає готове місце для списку кодів, детальної інформації та create/edit форми."
      detailLabel="Вибраний промокод"
      detailDescription="У деталях можна буде показувати тип знижки, період дії, ліміти та статистику використання."
      icon={getAdminModuleIcon("promo-codes")}
      formDemo={{
        title: "Демо форми промокоду",
        description: "Типовий create/edit сценарій для маркетингового модуля.",
        nameLabel: "Назва промокоду",
        slugLabel: "Код промокоду",
        notesLabel: "Умови або службова примітка",
        visibilityLabel: "Активувати промокод",
      }}
    />
  );
}
