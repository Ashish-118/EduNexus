
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

interface TITLE {
    title: string;
    userId: string;

}
const prisma = new PrismaClient();
export async function POST(req: NextRequest) {
    try {
        const body: TITLE = await req.json();
        const { title, userId } = body;

        if (!title || !userId) {
            return NextResponse.json({ error: "Title and userId are required" }, { status: 400 });
        }
        const existingCourse = await prisma.userCreatedCourse.findUnique({
            where: { title }
        });
        if (existingCourse) {
            return NextResponse.json({ error: "Course with this title already exists" }, { status: 400 });
        }
        const newCourse = await prisma.userCreatedCourse.create({
            data: {
                title: title,

                user: { connect: { id: userId } },
            }
        });

        return NextResponse.json({
            message: "Course created successfully",
            course: newCourse,
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    finally {
        await prisma.$disconnect();
    }
}