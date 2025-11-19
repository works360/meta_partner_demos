// app/api/logout/route.js
import { serialize } from "cookie";

export async function GET() {
  const cookie = serialize("sessionUser", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,                            // Expire immediately
    expires: new Date(0),                 // Force delete
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return new Response(
    JSON.stringify({
      success: true,
      message: "Logged out successfully",
    }),
    {
      status: 200,
      headers: {
        "Set-Cookie": cookie,
        "Content-Type": "application/json",
      },
    }
  );
}
