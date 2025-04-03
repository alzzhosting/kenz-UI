import { NextResponse } from "next/server"; import { siteConfig } from "@/lib/config"; import { memoryCache } from "@/lib/cache";


export async function GET(request) { // Cek mode maintenance if (siteConfig.maintenance.enabled) { return NextResponse.json( { status: siteConfig.maintenance.apiResponse.status, creator: siteConfig.api.creator, message: siteConfig.maintenance.apiResponse.message, }, { status: 503, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } } ); }

const { searchParams } = new URL(request.url); const text = searchParams.get("text");

if (!text) { return NextResponse.json( { status: false, creator: siteConfig.api.creator, error: "Text parameter is required", version: "v1", }, { status: 400, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } } ); }

try { const cacheKey = lena-${text}; const cachedResponse = memoryCache.get<string>(cacheKey);

if (cachedResponse) {
  return NextResponse.json(
    {
      status: true,
      creator: siteConfig.api.creator,
      response: cachedResponse,
      cached: true,
    },
    { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=1800, s-maxage=3600" } }
  );
}


const response = await fetch(`https://fgsi1-restapi.hf.space/api/ai/lenna?text=${encodeURIComponent(text)}`);

if (!response.ok) {
  throw new Error(`External API returned status ${response.status}`);
}

const data = await response.json();
if (!data || !data.result) {
  throw new Error("Invalid response from Lena AI API");
}


memoryCache.set(cacheKey, data.result, CACHE_TTL);

return NextResponse.json(
  {
    status: true,
    creator: siteConfig.api.creator,
    response: data.result,
    cached: false,
  },
  { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=1800, s-maxage=3600" } }
);

} catch (error) { return NextResponse.json( { status: false, creator: siteConfig.api.creator, error: error instanceof Error ? error.message : "An error occurred", version: "v1", }, { status: 500, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } } ); } }

