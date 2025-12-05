import { revalidatePath } from "next/cache"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const timestamp = Date.now()

  try {
    const body = await request.json()
    const { path } = body

    if (!path || typeof path !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Path is required and must be a string",
          timestamp,
        },
        { status: 400 },
      )
    }

    // Call revalidatePath with the provided path
    revalidatePath(path)

    return NextResponse.json({
      success: true,
      message: `Successfully revalidated path: ${path}`,
      timestamp,
      revalidatedPath: path,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp,
      },
      { status: 500 },
    )
  }
}
