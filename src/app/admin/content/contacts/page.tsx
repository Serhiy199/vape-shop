import { AdminPageHeader } from "@/components/admin/admin-primitives";
import { AdminContactsCrud } from "@/features/content/components/admin-content-crud";
import {
  ensureContactSettings,
  listContactRequests,
} from "@/server/repositories/content.repository";

function serialize<TData>(data: TData): TData {
  return JSON.parse(JSON.stringify(data)) as TData;
}

export default async function AdminContactsPage() {
  const [settings, requests] = await Promise.all([
    ensureContactSettings(),
    listContactRequests(),
  ]);
  const mappedRequests = requests.map((request) => ({
    ...request,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Контент"
        title="Контакти"
        description="Налаштування сторінки контактів і заявки з публічної форми."
        badges={["Settings", "Requests"]}
      />
      <AdminContactsCrud
        settings={serialize(settings)}
        requests={serialize(mappedRequests)}
      />
    </div>
  );
}
