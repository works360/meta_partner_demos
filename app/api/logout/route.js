import { serialize } from "cookie";

export async function GET() {
  const cookie = serialize("sessionUser", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,                 // DELETE COOKIE
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
      headers: { "Set-Cookie": cookie },
    }
  );
}
