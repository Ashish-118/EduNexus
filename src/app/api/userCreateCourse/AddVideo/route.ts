import { NextRequest, NextResponse } from "next/server"

interface video {
    title: string,
    thumbnail: string,
    url: string,
    id: string
}

export async function POST(req: NextRequest) {
    try {
        const body: video[] = await req.json();

        if (!Array.isArray(body) || body.length === 0) {
            return NextResponse.json({ error: "Empty array  for videos" }, { status: 400 });
        }

    } catch (error) {
        return NextResponse.json({ error: "error while adding videos to the course" }, { status: 500 })
    }
}