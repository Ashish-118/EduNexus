import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
// import { PrismaClient } from "@prisma/client";

// // const prisma = new PrismaClient();
const isPublicRoute = createRouteMatcher([
    "/sign-in",
    "/sign-up",
    "/home",
    "/",

])

const isPublicApiRoute = createRouteMatcher([
    "/api/course",
    "/api/store_user",

    "/api/YouTube/downloadVideo",
    "/api/utilityApi/image-upload"


])

export default clerkMiddleware(async (auth, req: NextRequest) => {
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
    try {
        const { userId } = await auth();

        const currentURL = new URL(req.url)



        const isApiRequest = currentURL.pathname.startsWith("/api")

        // if he is logged in 





        // If user is logged in but hasn't completed signup, allow access to /sign-up
        if (userId) {
            console.log("User is logged in")
            console.log("User ID:", userId);
            console.log("User is logged in hello")

            const response = await fetch(`${BASE_URL}/api/getUser`, {
                method: "GET",
                headers: {
                    "userId": userId,
                    "Authorization": req.headers.get("Authorization") || "",
                    "Cookie": req.headers.get("Cookie") || "",
                },
            });

            const userData = await response.json();

            console.log("Fetched user data:", userData);
            let signUpCompleted = false;
            if ((response.status == 200)) {
                signUpCompleted = userData.data.signUpCompleted;

            }




            // if (signUpCompleted && (currentURL.pathname === "/sign-in" || !isPublicRoute(req))) {
            //     return NextResponse.redirect(new URL("/sign-up", req.url));
            // }

            if (signUpCompleted) {

                console.log("signup completed is true")
                if (!isPublicRoute(req)) {
                    return NextResponse.next();
                }


                if (currentURL.pathname === "/sign-in" || currentURL.pathname === "/sign-up") {
                    return NextResponse.redirect(new URL("/home", req.url));
                }
            }


            if (isApiRequest) {
                console.log("here1 at logged in api request");
                return NextResponse.next();
            }



        }



        // //if he is not logged in

        if (!userId) {
            console.log("not logged in")
            // if (!isPublicRoute(req) ) {
            if (!isPublicRoute(req) && !isPublicApiRoute(req)) {

                return NextResponse.redirect(new URL("/sign-in", req.url))
            }

            if (isApiRequest && !isPublicApiRoute(req)) {
                console.log("here2")
                return NextResponse.redirect(new URL("/sign-in", req.url))
            }
            if (isApiRequest && isPublicApiRoute(req)) {
                console.log("here3")
                return NextResponse.next()
            }
        }
        return NextResponse.next()
    } catch (error) {
        return NextResponse.json({ error: `An error occurred in middleware ${error}` }, { status: 500 });
    }
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}