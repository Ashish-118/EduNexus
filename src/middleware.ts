import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
const isPublicRoute = createRouteMatcher([
    "/sign-in",
    "/sign-up",
    "/home",
    "/",

])

const isPublicApiRoute = createRouteMatcher([
    "/api/course"
])

export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth();
    const currentURL = new URL(req.url)
    const isAccessingDashboard = currentURL.pathname === "/home"
    const isApiRequest = currentURL.pathname.startsWith("/api")

    // if he is logged in 
    if (userId && isPublicRoute(req) && !isAccessingDashboard) {
        return NextResponse.redirect(new URL("/home", req.url))
    }

    //if he is not logged in

    if (!userId) {
        if (!isPublicRoute(req) && !isPublicApiRoute(req)) {
            return NextResponse.redirect(new URL("/sign-in", req.url))
        }

        if (isApiRequest && !isPublicApiRoute(req)) {
            return NextResponse.redirect(new URL("/sign-in", req.url))
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