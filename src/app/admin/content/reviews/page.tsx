import { AdminPageHeader } from "@/components/admin/admin-primitives";
import {
  AdminReviewsCrud,
  AdminSystemPageStatus,
} from "@/features/content/components/admin-content-crud";
import {
  getSystemPageSettings,
  listAdminReviews,
} from "@/server/repositories/content.repository";

function serialize<TData>(data: TData): TData {
  return JSON.parse(JSON.stringify(data)) as TData;
}

export default async function AdminReviewsPage() {
  const [reviews, pageStatus] = await Promise.all([
    listAdminReviews(),
    getSystemPageSettings("reviews"),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Контент"
        title="Відгуки"
        description="Модеруйте магазинні та товарні відгуки перед показом на сайті."
        badges={["Moderation", "Store", "Product"]}
      />
      {pageStatus ? (
        <AdminSystemPageStatus page={serialize(pageStatus)} />
      ) : null}
      <AdminReviewsCrud reviews={serialize(reviews)} />
    </div>
  );
}
