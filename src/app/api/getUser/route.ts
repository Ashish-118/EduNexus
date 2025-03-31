import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get("userId");
        // const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }
        console.log("User ID api:", userId);
        const user = await prisma.user.findUnique({
            where: {
                clerkId: userId,
            },
        })
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        return NextResponse.json({
            message: "User data fetched successfully",
            data: user
        }, { status: 200 })

    } catch (error) {
        // console.error("Error fetching user data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });

    }
}