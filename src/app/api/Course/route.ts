import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export async function GET(request: NextRequest) {
    try {
        const courses = await prisma.course.findMany({
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(courses)
    } catch (error) {
        return NextResponse.status(500).json({ error: "Server Error" })

    }
}

