import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type LegacyBrandPageProps = {
  params: Promise<{
    brandSlug: string;
  }>;
};

export default async function LegacyBrandPage({
  params,
}: LegacyBrandPageProps) {
  const { brandSlug } = await params;

  redirect(`/brand/${brandSlug}`);
}
