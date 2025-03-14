// import { NextApiRequest, NextApiResponse } from "next";
// import ffmpeg from "fluent-ffmpeg";
// import path from "path";


// export default function handler(req: NextApiRequest, res: NextApiResponse) {
//     if (req.method !== "POST") {
//         return res.status(405).json({ error: "Method Not Allowed" });
//     }

//     const { videoPath } = req.body;

//     if (!videoPath) {
//         return res.status(400).json({ error: "Video path is required" });
//     }

//     const outputPath = path.join(process.cwd(), "public", "audio.mp3");

//     ffmpeg(videoPath)
//         .output(outputPath)
//         .on("end", () => res.status(200).json({ message: "Conversion done!", audioPath: "/audio.mp3" }))
//         .on("error", (err: any) => res.status(500).json({ error: err.message }))
//         .run();
// }
