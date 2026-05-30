import { NextResponse } from "next/server";

import { listActiveStorefrontBanners } from "@/server/repositories/banner.repository";

export async function GET() {
  const banners = await listActiveStorefrontBanners();

  return NextResponse.json({
    success: true,
    data: {
      banners,
    },
  });
}
