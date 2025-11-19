import { NextResponse } from "next/server";

/**
 * 🔒 Route protection for Next.js 15+
 * This replaces middleware.js and runs before all requests.
 */
export default function proxy(req) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get("sessionUser");

  // Define protected routes
  const protectedRoutes = [
    "/my-orders",
    "/kit-orderdetails",
    "/event-orderdetails",
    "/create-kit",
    "/checkout",
    "/finalize-order",
    "/dashboard",
    "/returns",
  ];

  // 🔐 Block access to protected pages if not logged in
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!session) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.search = `redirect=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(loginUrl);
    }
  }

  // 🔁 Prevent logged-in users from accessing login/register
  if (
    session &&
    (pathname.startsWith("/login") || pathname.startsWith("/register"))
  ) {
    const homeUrl = req.nextUrl.clone();
    homeUrl.pathname = "/";
    return NextResponse.redirect(homeUrl);
  }

  // ✅ Allow normal navigation
  return NextResponse.next();
}

// ✅ Match all app routes (ignores _next/static, images, etc.)
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
