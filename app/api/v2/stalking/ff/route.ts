import { NextResponse } from "next/server"
import { siteConfig } from "@/lib/config"

export async function GET(request: Request) {
  if (siteConfig.maintenance.enabled) {
    return NextResponse.json(siteConfig.maintenance.apiResponse, {
      status: 503,
    })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get("id")

  if (!query) {
    return NextResponse.json(
      {
        status: false,
        creator: siteConfig.api.creator,
        error: "Parameter 'id' wajib diisi",
      },
      { status: 400 }
    )
  }

  try {
    const res = await fetch(`https://api.kenshiro.cfd/api/stalker/game/ff/v2?q=${encodeURIComponent(query)}`)

    const result = await res.json()

    return NextResponse.json(
      {
        status: true,
        creator: siteConfig.api.creator,
        result,
      },
      { status: 200 }
    )
  } catch (err) {
    return NextResponse.json(
      {
        status: false,
        creator: siteConfig.api.creator,
        error: err instanceof Error ? err.message : "Gagal fetch data",
      },
      { status: 500 }
    )
  }
}
