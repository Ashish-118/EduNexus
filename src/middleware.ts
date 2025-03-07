import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
const isPublicRoute = createRouteMatcher([
    "/sign-in",
    "/sign-up",
    "/home",
    "/",

])

const isPublicApiRoute = createRouteMatcher([
    "/api/course",
    "/api/store_user"
])

export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth();
    const currentURL = new URL(req.url)
    const isAccessingDashboard = currentURL.pathname === "/home"


    const isApiRequest = currentURL.pathname.startsWith("/api")

    // if he is logged in 

    let signUpCompleted = false;
    if (typeof window !== "undefined") {
        console.log("type of window wala hai ye")
        const part1data = JSON.parse(localStorage.getItem("part1data") || "{}");
        signUpCompleted = part1data?.signUpCompleted || false;
    }

    // If user is logged in but hasn't completed signup, allow access to /sign-up
    if (userId && !signUpCompleted && currentURL.pathname !== "/sign-up") {
        return NextResponse.redirect(new URL("/sign-up", req.url));
    }

    if (userId && isPublicRoute(req) && !isAccessingDashboard && signUpCompleted) {
        console.log("hello")
        return NextResponse.redirect(new URL("/home", req.url))
    }

    //if he is not logged in

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
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}