import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { auth } from "@clerk/nextjs/server"
import { currentUser } from '@clerk/nextjs/server'
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET
});


interface cloudinaryUploadResult {
    public_id: string;
    [key: string]: any
}


export async function POST(req: NextRequest) {

    try {

        const { userId } = await auth();


        if (!userId) {
            return NextResponse.json({ error: "didn't got the userId for image-upload" }, { status: 401 })
        }


        if (
            !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
            !process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ||
            !process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET
        ) {
            return NextResponse.json({ error: "credential is missing " }, { status: 500 })
        }

        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: "file not found " }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const result = await new Promise<cloudinaryUploadResult>(
            (resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "EduNexus images" },
                    (error, result) => {
                        if (error) {
                            reject(error)
                        } else {
                            resolve(result as cloudinaryUploadResult)
                        }
                    }
                )
                uploadStream.end(buffer)
            }
        )
        return NextResponse.json({ public_id: result.public_id, url: result.secure_url }, { status: 200 });

    } catch (error) {
        console.log("upload image failed ", error)
        return NextResponse.json({ error: "upload image failed" }, { status: 500 })
    }
}