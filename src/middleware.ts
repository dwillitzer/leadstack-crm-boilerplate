import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authMiddleware } from "next-firebase-auth-edge/lib/next/middleware";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/terms",
  "/privacy",
  "/f",
  "/api/forms",
  "/setup.html",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export default function middleware(request: NextRequest) {
  // Skip auth middleware if Firebase is not configured
  if (
    !process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    !process.env.FIREBASE_ADMIN_PROJECT_ID
  ) {
    return NextResponse.next();
  }

  return authMiddleware(request, {
    loginPath: "/api/login",
    logoutPath: "/api/logout",
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    cookieName: "__session",
    cookieSignatureKeys: [
      process.env.COOKIE_SECRET_CURRENT ?? "",
      process.env.COOKIE_SECRET_PREVIOUS ?? "",
    ],
    cookieSerializeOptions: {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 12 * 60 * 60 * 24, // 12 days
    },
    serviceAccount: {
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID ?? "",
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL ?? "",
      privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "").replace(
        /\\n/g,
        "\n",
      ),
    },
    handleValidToken: async ({ decodedToken }, headers) => {
      // Allow authenticated users through
      // Attach user info to headers for downstream use
      headers.set("x-user-uid", decodedToken.uid);
      headers.set("x-user-email", decodedToken.email ?? "");

      return NextResponse.next({ request: { headers } });
    },
    handleInvalidToken: async () => {
      const pathname = request.nextUrl.pathname;

      // Allow public paths without authentication
      if (isPublicPath(pathname)) {
        return NextResponse.next();
      }

      // Redirect unauthenticated users to login for protected paths
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    },
    handleError: async () => {
      const pathname = request.nextUrl.pathname;

      // On error, allow public paths and redirect protected paths
      if (isPublicPath(pathname)) {
        return NextResponse.next();
      }

      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/api/login",
    "/api/logout",
  ],
};
