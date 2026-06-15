import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CmsPageShell } from "@/components/storefront/cms-content";
import { SafeRichTextContent } from "@/components/storefront/safe-rich-text-content";
import { StorefrontCard } from "@/components/storefront/storefront-primitives";
import {
  getPublishedBlogPost,
  incrementBlogPostViews,
} from "@/server/repositories/content.repository";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPost(slug);

  if (!post) {
    return {};
  }

  return {
    description: post.seoDescription ?? post.excerpt ?? undefined,
    openGraph: {
      description: post.seoDescription ?? post.excerpt ?? undefined,
      images: post.seoImage ? [post.seoImage] : undefined,
      title: post.seoTitle ?? post.title,
    },
    title: post.seoTitle ?? post.title,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedBlogPost(slug);

  if (!post) {
    notFound();
  }

  await incrementBlogPostViews(post.id);

  return (
    <CmsPageShell
      eyebrow={post.category?.name ?? "Блог"}
      title={post.title}
      description={post.excerpt}
    >
      <StorefrontCard className="overflow-hidden">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt=""
            className="aspect-[16/7] w-full object-cover"
          />
        ) : null}
        <div className="space-y-5 p-5 sm:p-7">
          <p className="text-muted-foreground text-sm">
            {post.authorName ?? "Voodoo Vape"}
            {post.publishedAt
              ? ` · ${post.publishedAt.toLocaleDateString("uk-UA")}`
              : ""}
            {post.readingTime ? ` · ${post.readingTime} хв` : ""}
          </p>
          <SafeRichTextContent html={post.contentHtml} />
        </div>
      </StorefrontCard>
    </CmsPageShell>
  );
}
