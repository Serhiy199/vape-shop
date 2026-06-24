import { AdminPageHeader } from "@/components/admin/admin-primitives";
import {
  AdminFAQCrud,
  AdminSystemPageStatus,
} from "@/features/content/components/admin-content-crud";
import {
  getSystemPageSettings,
  listFAQSections,
} from "@/server/repositories/content.repository";

function serialize<TData>(data: TData): TData {
  return JSON.parse(JSON.stringify(data)) as TData;
}

export default async function AdminFAQPage() {
  const [sections, pageStatus] = await Promise.all([
    listFAQSections(),
    getSystemPageSettings("faq"),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Контент"
        title="FAQ"
        description="Структуровані розділи та питання для сторінки FAQ."
        badges={["Sections", "Items"]}
      />
      {pageStatus ? (
        <AdminSystemPageStatus page={serialize(pageStatus)} />
      ) : null}
      <AdminFAQCrud sections={serialize(sections)} />
    </div>
  );
}
