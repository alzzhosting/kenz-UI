import { NextResponse } from "next/server"
import { siteConfig } from "@/lib/config"

export async function GET(request: Request) {
  if (siteConfig.maintenance.enabled) {
    return new NextResponse(
      JSON.stringify({
        status: siteConfig.maintenance.apiResponse.status,
        creator: siteConfig.api.creator,
        message: siteConfig.maintenance.apiResponse.message,
      }),
      {
        status: 503,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    )
  }

  const { searchParams } = new URL(request.url)
  const qrisData = searchParams.get("UrlQris")
  const amount = searchParams.get("amount")

  if (!qrisData || !amount) {
    return NextResponse.json(
      {
        status: false,
        creator: siteConfig.api.creator,
        error: "Parameter 'q' dan 'amount' wajib diisi",
      },
      {
        status: 400,
      }
    )
  }

  try {
    const url = `https://api.kenshiro.cfd/api/payment/createqris?q=${encodeURIComponent(
      qrisData
    )}&amount=${amount}&gradient=false`

    const response = await fetch(url)
    const result = await response.json()

    return NextResponse.json({
      status: true,
      creator: siteConfig.api.creator,
      data: result,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: false,
        creator: siteConfig.api.creator,
        error: error instanceof Error ? error.message : "Terjadi kesalahan",
      },
      {
        status: 500,
      }
    )
  }
}
