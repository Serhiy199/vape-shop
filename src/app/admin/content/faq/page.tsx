import { AdminPageHeader } from "@/components/admin/admin-primitives";
import { AdminFAQCrud } from "@/features/content/components/admin-content-crud";
import { listFAQSections } from "@/server/repositories/content.repository";

function serialize<TData>(data: TData): TData {
  return JSON.parse(JSON.stringify(data)) as TData;
}

export default async function AdminFAQPage() {
  const sections = await listFAQSections();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Контент"
        title="FAQ"
        description="Структуровані розділи та питання для сторінки FAQ."
        badges={["Sections", "Items"]}
      />
      <AdminFAQCrud sections={serialize(sections)} />
    </div>
  );
}
