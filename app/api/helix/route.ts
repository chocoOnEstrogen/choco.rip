import { NextResponse } from "next/server"
import { Helix } from "@/lib/helix"

export async function POST(request: Request) {
  try {
    const { operation, data } = await request.json()
    const helix = new Helix(data.workerId)

    switch (operation) {
      case "generateId":
        const id = helix.generateId()
        return NextResponse.json({ id: id.toString() })

      case "generateBatchIds":
        const size = data.size || 1
        const ids = Array.from({ length: size }, () => helix.generateId())
        return NextResponse.json({ ids: ids.map(id => id.toString()) })

      case "generateToken":
        const token = helix.generateToken(data.metadata)
        return NextResponse.json({ token })

      case "decodeId":
        const decodedId = Helix.decodeId(BigInt(data.id))
        return NextResponse.json({
          timestamp: decodedId.timestamp.toISOString(),
          workerId: decodedId.workerId,
          sequence: decodedId.sequence,
        })

      case "decodeToken":
        const decodedToken = Helix.decodeToken(data.token)
        return NextResponse.json({ decoded: decodedToken })

      case "validateToken":
        try {
          const validated = Helix.decodeToken(data.token)
          return NextResponse.json({ valid: true, decoded: validated })
        } catch {
          return NextResponse.json({ valid: false })
        }

      default:
        return NextResponse.json({ error: "Invalid operation" }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    )
  }
} 