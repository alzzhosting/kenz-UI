import { NextResponse } from "next/server"
import { siteConfig } from "@/lib/config"

export async function GET(request: Request) {
  if (siteConfig.maintenance.enabled) {
    return NextResponse.json(siteConfig.maintenance.apiResponse, { status: 503 })
  }

  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")

  if (!url) {
    return NextResponse.json(
      {
        status: false,
        creator: siteConfig.api.creator,
        error: "Parameter 'url' wajib diisi",
      },
      { status: 400 }
    )
  }

  try {
    const res = await axios.get(`https://fgsi1-restapi.hf.space/api/downloader/youtube/v2?url=${encodeURIComponent(url)}&type=mp4`)
    const result = await res.json()

    if (!result.status) {
      return NextResponse.json(
        {
          status: false,
          creator: siteConfig.api.creator,
          error: result.error || "Gagal mengambil data video",
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        status: true,
        creator: siteConfig.api.creator,
        result: result.result,
      },
      { status: 200 }
    )
  } catch (err) {
    return NextResponse.json(
      {
        status: false,
        creator: siteConfig.api.creator,
        error: err instanceof Error ? err.message : "Terjadi kesalahan saat fetch data",
      },
      { status: 500 }
    )
  }
}
