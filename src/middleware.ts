import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
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


])

export default clerkMiddleware(async (auth, req: NextRequest) => {
    const { userId } = await auth();
    const currentURL = new URL(req.url)
    const isAccessingDashboard = currentURL.pathname === "/home"


    const isApiRequest = currentURL.pathname.startsWith("/api")

    // if he is logged in 





    // If user is logged in but hasn't completed signup, allow access to /sign-up
    if (userId) {
        const signUpCompleted = req.cookies.get("signupComplete")?.value;

        if (signUpCompleted === "false" && (currentURL.pathname === "/sign-in" || !isPublicRoute(req))) {
            return NextResponse.redirect(new URL("/sign-up", req.url));
        }

        if (signUpCompleted === "true") {

            if (!isPublicRoute(req)) {
                return NextResponse.next();
            }


            if (currentURL.pathname === "/sign-in" || currentURL.pathname === "/sign-up") {
                return NextResponse.redirect(new URL("/home", req.url));
            }
        }


        if (isApiRequest) {
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
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}