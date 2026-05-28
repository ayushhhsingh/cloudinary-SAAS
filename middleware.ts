import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
    "/sign-in",
    "/sign-up",
    "/",
    "/home"
])
const isPublicApiRoute = createRouteMatcher([
    "/api/videos"
]) 

const redirectTo = (path: string, reqUrl: string) => {
    return Response.redirect(new URL(path, reqUrl).toString())
}

export default clerkMiddleware((auth, req) => {
    const { userId } = auth();
    const currentUrl = new URL(req.url)
    const isAccessingDashboard = currentUrl.pathname === "/home"
    const isApiRequest = currentUrl.pathname.startsWith("/api")

    if (userId && isPublicRoute(req) && !isAccessingDashboard) {
        return redirectTo("/home", req.url)
    }

    if (!userId) {
        if (!isPublicRoute(req) && !isPublicApiRoute(req)) {
            return redirectTo("/sign-in", req.url)
        }

        if (isApiRequest && !isPublicApiRoute(req)) {
            return redirectTo("/sign-in", req.url)
        }
    }

    return
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
