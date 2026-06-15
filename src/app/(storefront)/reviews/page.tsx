import type { Metadata } from "next";
import { ReviewType } from "@prisma/client";

import { CmsPageShell } from "@/components/storefront/cms-content";
import { StorefrontCard } from "@/components/storefront/storefront-primitives";
import { ReviewSubmitForm } from "@/features/content/components/public-content-forms";
import { listPublicReviews } from "@/server/repositories/content.repository";

export const metadata: Metadata = {
  description: "Відгуки клієнтів про магазин і товари Voodoo Vape.",
  title: "Відгуки",
};

export default async function ReviewsPage() {
  const [storeReviews, productReviews] = await Promise.all([
    listPublicReviews(ReviewType.STORE),
    listPublicReviews(ReviewType.PRODUCT),
  ]);
  const allReviews = [...storeReviews, ...productReviews];
  const averageRating = allReviews.length
    ? allReviews.reduce((sum, review) => sum + review.rating, 0) /
      allReviews.length
    : 0;

  return (
    <CmsPageShell
      eyebrow="Довіра"
      title="Відгуки"
      description="Реальні відгуки клієнтів після модерації."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <ReviewGroup title="Про магазин" reviews={storeReviews} />
          <ReviewGroup title="Про товари" reviews={productReviews} />
        </div>
        <aside className="space-y-6">
          <StorefrontCard className="p-5">
            <h2 className="text-lg font-semibold">Рейтинг</h2>
            <p className="mt-3 text-4xl font-semibold">
              {averageRating.toFixed(1)}
            </p>
            <p className="text-muted-foreground text-sm">
              На основі {allReviews.length} відгуків
            </p>
            <div className="mt-4 space-y-2 text-sm">
              {[5, 4, 3, 2, 1].map((rating) => (
                <p key={rating} className="flex justify-between">
                  <span>{rating} зірок</span>
                  <span>
                    {allReviews.filter((review) => review.rating === rating).length}
                  </span>
                </p>
              ))}
            </div>
          </StorefrontCard>
          <StorefrontCard className="p-5">
            <h2 className="mb-4 text-lg font-semibold">Залишити відгук</h2>
            <ReviewSubmitForm />
          </StorefrontCard>
        </aside>
      </div>
    </CmsPageShell>
  );
}

function ReviewGroup({
  reviews,
  title,
}: {
  reviews: Awaited<ReturnType<typeof listPublicReviews>>;
  title: string;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {reviews.length ? (
        reviews.map((review) => (
          <StorefrontCard key={review.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{review.name}</p>
                {review.product ? (
                  <p className="text-muted-foreground text-xs">
                    Товар: {review.product.title}
                  </p>
                ) : null}
              </div>
              <span className="text-primary font-semibold">
                {"★".repeat(review.rating)}
              </span>
            </div>
            <p className="text-muted-foreground mt-3 text-sm leading-6">
              {review.text}
            </p>
          </StorefrontCard>
        ))
      ) : (
        <StorefrontCard className="p-5">
          <p className="text-muted-foreground text-sm">Відгуків ще немає.</p>
        </StorefrontCard>
      )}
    </section>
  );
}
