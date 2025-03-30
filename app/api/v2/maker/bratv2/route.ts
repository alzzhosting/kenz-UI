import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/config";
import { memoryCache } from "@/lib/cache";

// Cache TTL in seconds
const CACHE_TTL = 3600; // 1 hour

export async function GET(request: Request) {
  if (siteConfig.maintenance.enabled) {
    return NextResponse.json(
      {
        status: siteConfig.maintenance.apiResponse.status,
        creator: siteConfig.api.creator,
        message: siteConfig.maintenance.apiResponse.message,
      },
      { status: 503, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } }
    );
  }

  const { searchParams } = new URL(request.url);
  const textt = searchParams.get("text");

  if (!textt) {
    return NextResponse.json(
      {
        status: false,
        creator: siteConfig.api.creator,
        error: "Text parameter is required",
        version: "v2",
      },
      { status: 400, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } }
    );
  }

  try {
    const cacheKey = `bratv2-${textt}`;
    const cachedResponse = memoryCache.get<ArrayBuffer>(cacheKey);

    if (cachedResponse) {
      return new NextResponse(cachedResponse, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=1800, s-maxage=3600",
          "X-Creator": siteConfig.api.creator,
          "X-Version": "v2",
          "X-Cached": "true",
        },
      });
    }

    // Fetch ke API eksternal dan clone response agar bisa dibaca ulang
    const response = await fetch(`https://api.im-rerezz.xyz/api/sticker/bratv2?text=${encodeURIComponent(textt)}`);
    if (!response.ok) {
      throw new Error(`External API returned status ${response.status}`);
    }

    // Clone response agar body bisa dibaca ulang
    const responseClone = response.clone();

    // Ambil arrayBuffer dari clone agar tidak terjadi "body stream already read"
    const imageBuffer = await responseClone.arrayBuffer();

    // Cache hasilnya
    memoryCache.set(cacheKey, imageBuffer, CACHE_TTL);

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=1800, s-maxage=3600",
        "X-Creator": siteConfig.api.creator,
        "X-Version": "v2",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: false,
        creator: siteConfig.api.creator,
        error: error instanceof Error ? error.message : "An error occurred",
        version: "v2",
      },
      { status: 500, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } }
    );
  }
}
