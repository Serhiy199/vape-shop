import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CmsPageShell } from "@/components/storefront/cms-content";
import { StorefrontCard } from "@/components/storefront/storefront-primitives";
import {
  listBlogCategories,
  listBlogTags,
  isSystemPageActive,
  listPublishedBlogPosts,
} from "@/server/repositories/content.repository";

export const metadata: Metadata = {
  description: "Статті, поради та новини Voodoo Vape.",
  title: "Блог",
};

export default async function BlogPage() {
  if (!(await isSystemPageActive("blog"))) {
    notFound();
  }

  const [posts, categories, tags] = await Promise.all([
    listPublishedBlogPosts(),
    listBlogCategories(),
    listBlogTags(),
  ]);

  return (
    <CmsPageShell
      eyebrow="Матеріали"
      title="Блог"
      description="Корисні статті, добірки та новини магазину."
    >
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <StorefrontCard className="p-4">
            <h2 className="font-semibold">Категорії</h2>
            <div className="mt-3 grid gap-2 text-sm">
              {categories
                .filter((category) => category.isActive)
                .map((category) => (
                  <span key={category.id}>{category.name}</span>
                ))}
            </div>
          </StorefrontCard>
          <StorefrontCard className="p-4">
            <h2 className="font-semibold">Теги</h2>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              {tags
                .filter((tag) => tag.isActive)
                .map((tag) => (
                  <span
                    key={tag.id}
                    className="bg-muted rounded-full px-3 py-1"
                  >
                    {tag.name}
                  </span>
                ))}
            </div>
          </StorefrontCard>
        </aside>
        <div className="grid gap-4 sm:grid-cols-2">
          {posts.length ? (
            posts.map((post) => (
              <StorefrontCard key={post.id} className="overflow-hidden">
                {post.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.coverImage}
                    alt=""
                    className="aspect-[16/9] w-full object-cover"
                  />
                ) : null}
                <div className="space-y-3 p-5">
                  {post.category ? (
                    <span className="text-primary text-xs font-semibold uppercase">
                      {post.category.name}
                    </span>
                  ) : null}
                  <h2 className="text-xl font-semibold tracking-tight">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  {post.excerpt ? (
                    <p className="text-muted-foreground text-sm leading-6">
                      {post.excerpt}
                    </p>
                  ) : null}
                  <p className="text-muted-foreground text-xs">
                    {post.authorName ?? "Voodoo Vape"} · {post.viewsCount} переглядів
                    {post.readingTime ? ` · ${post.readingTime} хв` : ""}
                  </p>
                </div>
              </StorefrontCard>
            ))
          ) : (
            <StorefrontCard className="p-5">
              <p className="text-muted-foreground text-sm">
                Опублікованих статей ще немає.
              </p>
            </StorefrontCard>
          )}
        </div>
      </div>
    </CmsPageShell>
  );
}
