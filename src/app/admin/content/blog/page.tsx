import { AdminPageHeader } from "@/components/admin/admin-primitives";
import { AdminBlogCrud } from "@/features/content/components/admin-content-crud";
import {
  listAdminBlogPosts,
  listBlogCategories,
} from "@/server/repositories/content.repository";

function serialize<TData>(data: TData): TData {
  return JSON.parse(JSON.stringify(data)) as TData;
}

export default async function AdminBlogPage() {
  const [categories, posts] = await Promise.all([
    listBlogCategories(),
    listAdminBlogPosts(),
  ]);

  const mappedPosts = posts.map((post) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
    publishedAt: post.publishedAt?.toISOString() ?? null,
    tagIds: post.tags.map((item) => item.tagId),
    updatedAt: post.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Контент"
        title="Блог"
        description="Статті та категорії для публічного блогу."
        badges={["Posts", "Categories"]}
      />
      <AdminBlogCrud
        categories={serialize(categories)}
        posts={serialize(mappedPosts)}
      />
    </div>
  );
}
