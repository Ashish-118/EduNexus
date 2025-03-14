import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();
        if (!url) {
            return NextResponse.json({ error: "Playlist URL is required" }, { status: 400 });
        }

        const command = `yt-dlp --flat-playlist --print-json "${url}"`;
        const output = execSync(command).toString();


        const videos = output
            .trim()
            .split("\n")
            .map(line => JSON.parse(line))
            .map(video => ({
                id: video.id,
                title: video.title,
                url: `https://www.youtube.com/watch?v=${video.id}`,
                thumbnail: `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`
            }));

        return NextResponse.json({ message: "Playlist fetched successfully", videos }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
