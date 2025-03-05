import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth, currentUser } from "@clerk/nextjs/server";

const prisma = new PrismaClient();


export async function POST(request: NextRequest) {
    try {
        const user = await currentUser();

    } catch (error) {

    }
}