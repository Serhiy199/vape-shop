import { AdminModuleScaffold, getAdminModuleIcon } from "@/components/admin/admin-module-scaffold";

export default function AdminSeoPage() {
  return (
    <AdminModuleScaffold
      eyebrow="SEO"
      title="Розділ SEO готовий до наповнення"
      description="Тут з'явиться керування metadata, службовими заголовками, slug, indexation і шаблонами SEO для сторінок каталогу."
      entityLabel="SEO-сторінка"
      emptyTitle="SEO-налаштування ще не наповнені"
      emptyDescription="Каркас уже готовий під список SEO-сутностей, деталі сторінки та окремі форми метаданих."
      detailLabel="Вибрана SEO-сутність"
      detailDescription="У деталях житимуть title, description, canonical, robots та інші метаполя."
      icon={getAdminModuleIcon("seo")}
      formDemo={{
        title: "Демо SEO-форми",
        description: "Тут form primitives особливо корисні для текстових і службових полів.",
        nameLabel: "Назва SEO-сутності",
        slugLabel: "Slug сторінки",
        notesLabel: "Meta description або службова примітка",
        visibilityLabel: "Дозволити індексацію сторінки",
      }}
    />
  );
}
