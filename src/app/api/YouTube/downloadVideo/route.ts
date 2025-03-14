

import { NextRequest, NextResponse } from "next/server";
import { execSync, exec } from "child_process";
import fs from "fs";
import path from "path";
import util from "util";

const execPromise = util.promisify(exec);

async function transcribeAudio(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const transcriptPath = filePath.replace(/\.\w+$/, ".txt");
        const whisperProcess = exec(
            `whisper "${filePath}" --model base --task translate --output_format txt --output_dir "${path.dirname(filePath)}"`,
            (error, stdout, stderr) => {
                if (error) {
                    console.error("Whisper Error:", stderr);
                    return reject(new Error("Whisper failed to transcribe the audio"));
                }
                if (fs.existsSync(transcriptPath)) {
                    const transcript = fs.readFileSync(transcriptPath, "utf8").trim();
                    resolve(transcript);
                    fs.unlinkSync(transcriptPath);
                } else {
                    reject(new Error("Transcription file not found"));
                }
            }
        );
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


        const command = `yt-dlp -f ${fileFormat === "mp3" ? "bestaudio" : "best"} -o "${filePath}" "${url}"`;
        execSync(command);


        const transcription = await transcribeAudio(filePath);


        fs.unlinkSync(filePath);

        return NextResponse.json({
            message: "Download and transcription completed",
            filePath,
            transcription,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
