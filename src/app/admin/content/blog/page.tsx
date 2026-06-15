import { AdminPageHeader } from "@/components/admin/admin-primitives";
import { AdminBlogCrud } from "@/features/content/components/admin-content-crud";
import {
  listAdminBlogPosts,
  listBlogCategories,
  listBlogTags,
} from "@/server/repositories/content.repository";

function serialize<TData>(data: TData): TData {
  return JSON.parse(JSON.stringify(data)) as TData;
}

export default async function AdminBlogPage() {
  const [categories, tags, posts] = await Promise.all([
    listBlogCategories(),
    listBlogTags(),
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
        description="Статті, категорії та теги для публічного блогу."
        badges={["Posts", "Categories", "Tags"]}
      />
      <AdminBlogCrud
        categories={serialize(categories)}
        tags={serialize(tags)}
        posts={serialize(mappedPosts)}
      />
    </div>
  );
}
