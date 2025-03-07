import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth, currentUser } from "@clerk/nextjs/server";
import { error } from "console";

const prisma = new PrismaClient();

interface UserData {
    email: string;
    fullName: string;
    lastName: string;
    userName: string;
    role: string;
    mobileNum: string;
    clerkId: string;

    country: string;

}
export async function POST(request: NextRequest) {
    try {
        const body: UserData = await request.json();
        const { email, fullName, lastName, userName, role, mobileNum, clerkId, country } = body;

        if (!email || !fullName || !lastName || !userName || !role || !clerkId || !country) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { userName }
        });

        if (existingUser) {
            return NextResponse.json({ error: "Username already exists" }, { status: 400 });
        }

        const newUser = await prisma.user.create({
            data: {
                email,
                fullName,
                lastName,
                userName,
                role,
                mobileNum,
                clerkId,
                isAdmin: role != "Student",
                country,
            },

        });


        if (!newUser) {
            return NextResponse.json({ error: "User not created" }, { status: 400 });
        }

        return NextResponse.json({ message: "User created successfully", user: newUser }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}



