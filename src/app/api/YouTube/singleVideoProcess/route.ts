

import { NextRequest, NextResponse } from "next/server";
import { execSync, exec } from "child_process";
import fs from "fs";
import path from "path";
import util from "util";



const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function POST(req: NextRequest) {
    try {
        const { url, format } = await req.json();
        if (!url) {
            return NextResponse.json({ error: "YouTube video URL is required" }, { status: 400 });
        }

        const fileFormat = format === "audio" ? "mp3" : "mp4";
        const storageDir = path.join(process.cwd(), "public", "downloads");


        if (!fs.existsSync(storageDir)) {
            fs.mkdirSync(storageDir, { recursive: true });
        }

        const fileName = `download-${Date.now()}.${fileFormat}`;
        const filePath = path.join(storageDir, fileName);


        const command = `yt-dlp -f ${fileFormat === "mp3" ? "bestaudio" : "best"} -o "${filePath}" "${url}"`;
        execSync(command);




        const response = await fetch(`${API_BASE_URL}/api/whisperTrans`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filePath }),
        });


        if (!response.ok) {
            throw new Error("Transcription API failed");
        }
        const { cleanedText } = await response.json();

        return NextResponse.json({
            message: "Download | stored in the server and transcription completed successfully",
            filePath,
            cleanedText,
            status: 200,

        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
