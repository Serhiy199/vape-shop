import { AdminPageHeader } from "@/components/admin/admin-primitives";
import { AdminContentPagesCrud } from "@/features/content/components/admin-content-crud";
import { listAdminContentPages } from "@/server/repositories/content.repository";

function serialize<TData>(data: TData): TData {
  return JSON.parse(JSON.stringify(data)) as TData;
}

export default async function AdminContentPagesPage() {
  const pages = await listAdminContentPages();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Контент"
        title="Інформаційні сторінки"
        description="Керуйте простими сторінками, SEO, статусами та показом у header/footer."
        badges={["CMS", "Rich text"]}
      />
      <AdminContentPagesCrud pages={serialize(pages)} />
    </div>
  );
}
