import { NextResponse } from "next/server"
import { siteConfig } from "@/lib/config"

export async function GET(request: Request) {
  if (siteConfig.maintenance.enabled) {
    return NextResponse.json(siteConfig.maintenance.apiResponse, {
      status: 503,
    })
  }

  const { searchParams } = new URL(request.url)
  const qrisData = searchParams.get("UrlQris")
  const amount = searchParams.get("amount")

  if (!qrisData || !amount) {
    return NextResponse.json(
      {
        status: false,
        creator: siteConfig.api.creator,
        error: "Parameter 'UrlQris' dan 'amount' wajib diisi",
      },
      { status: 400 }
    )
  }

  try {
    const res = await fetch(
      `https://api.kenshiro.cfd/api/payment/createqris?q=${encodeURIComponent(
        qrisData
      )}&amount=${amount}&gradient=false`
    )

    const contentType = res.headers.get("content-type") || ""

    if (contentType.includes("image")) {
      const buffer = await res.arrayBuffer()
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=1800",
          "X-Creator": siteConfig.api.creator,
        },
      })
    } else if (contentType.includes("application/json")) {
      const json = await res.json()
      return NextResponse.json(json, { status: 200 })
    } else {
      throw new Error("Respon tidak dikenali")
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: false,
        creator: siteConfig.api.creator,
        error: error instanceof Error ? error.message : "Terjadi kesalahan",
      },
      { status: 500 }
    )
  }
}
