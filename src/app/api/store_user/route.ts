import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth, currentUser } from "@clerk/nextjs/server";
import { error } from "console";

const prisma = new PrismaClient();

interface UserData {
    email: string;
    firstName: string;
    lastName: string;
    userName: string;
    role: string;
    mobileNum: string;
    clerkId: string;

    country: string;

}
export async function POST(request: NextRequest) {

    try {
        const { userId } = await auth();
        if (!userId) {
            throw new Error("Not authenticated");
        }
        console.log("User ID api:", userId);
        const body: UserData = await request.json();
        const { email, firstName, lastName, userName, role, mobileNum, country } = body;
        console.log("hello peeps1")
        if (!email || !firstName || !lastName || !userName || !role) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }
        console.log(email, firstName, lastName, userName, role)
        const existingUser = await prisma.user.findUnique({
            where: { userName },
        });

        console.log("hello peeps2")
        if (existingUser) {
            return NextResponse.json({ error: "Username already exists" }, { status: 400 });
        }
        console.log("userid or clerkid ", userId)
        const newUser = await prisma.user.create({
            data: {
                email,
                firstName,
                lastName,
                userName,
                role,
                mobileNum,
                clerkId: userId,
                isAdmin: role != "Student",
                country,
                signUpCompleted: true
            },

        });


        if (!newUser) {
            return NextResponse.json({ error: "User not created" }, { status: 400 });
        }

        return NextResponse.json({ message: "User created successfully", user: newUser }, { status: 200 });

    } catch (error: any) {
        // console.log("Error finding existing user:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

}



