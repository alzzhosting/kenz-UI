import { NextResponse } from "next/server"
import { siteConfig } from "@/lib/config"

export async function GET(request: Request) {
  if (siteConfig.maintenance.enabled) {
    return NextResponse.json(siteConfig.maintenance.apiResponse, { status: 503 })
  }

  const { searchParams } = new URL(request.url)
  const q = searchParams.get("id")
  const server = searchParams.get("server")

  if (!q || !server) {
    return NextResponse.json(
      {
        status: false,
        creator: siteConfig.api.creator,
        error: "Parameter 'q' dan 'server' wajib diisi",
      },
      { status: 400 }
    )
  }

  try {
    const res = await fetch(`https://api.kenshiro.cfd/api/stalker/game/mlbb/v2?q=${encodeURIComponent(q)}&server=${encodeURIComponent(server)}`)
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
        error: err instanceof Error ? err.message : "Gagal ambil data",
      },
      { status: 500 }
    )
  }
}
