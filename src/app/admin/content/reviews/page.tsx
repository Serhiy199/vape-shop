import { AdminPageHeader } from "@/components/admin/admin-primitives";
import { AdminReviewsCrud } from "@/features/content/components/admin-content-crud";
import { listAdminReviews } from "@/server/repositories/content.repository";

function serialize<TData>(data: TData): TData {
  return JSON.parse(JSON.stringify(data)) as TData;
}

export default async function AdminReviewsPage() {
  const reviews = await listAdminReviews();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Контент"
        title="Відгуки"
        description="Модеруйте магазинні та товарні відгуки перед показом на сайті."
        badges={["Moderation", "Store", "Product"]}
      />
      <AdminReviewsCrud reviews={serialize(reviews)} />
    </div>
  );
}
