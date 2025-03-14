import { NextRequest, NextResponse } from "next/server";
import { execSync, spawn } from "child_process";
import fs from "fs";
import path from "path";

async function transcribeAudio(filePath: string) {
    return new Promise((resolve, reject) => {
        const whisperProcess = spawn("whisper", [filePath, "--model", "base"]);

        let output = "";
        whisperProcess.stdout.on("data", (data) => {
            output += data.toString();
        });

        whisperProcess.stderr.on("data", (data) => {
            console.error("Whisper Error:", data.toString());
        });

        whisperProcess.on("close", (code) => {
            if (code === 0) {
                resolve(output);
            } else {
                reject(new Error("Whisper failed to transcribe the audio"));
            }
        });
    });
}

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

        // Download the YouTube audio/video file
        const command = `yt-dlp -f "${format === "audio" ? "bestaudio" : "best"}" -o "${filePath}" "${url}"`;
        execSync(command);

        // Run Whisper transcription
        const transcription = await transcribeAudio(filePath);

        // Delete the file after processing
        fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting file:", err);
        });

        return NextResponse.json({
            message: "Transcription completed successfully",
            transcription
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
