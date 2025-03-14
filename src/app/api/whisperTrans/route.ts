

import { NextRequest, NextResponse } from "next/server";
import { execSync, exec } from "child_process";
import fs from "fs";
import path from "path";
import util from "util";

// const execPromise = util.promisify(exec);

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
        const { filePath } = await req.json();
        const transcription = await transcribeAudio(filePath);
        const cleanedText = transcription
            .replace(/\[.*?\]/g, "")
            .replace(/\n/g, " ")
            .replace(/\s+/g, " ")
            .trim();


        fs.unlinkSync(filePath);

        return NextResponse.json({
            message: "transcription completed",

            cleanedText,
            status: 200
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
