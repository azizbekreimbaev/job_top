import { createAuthActions } from "@insforge/sdk/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true });
  const auth = createAuthActions({
    requestCookies: request.cookies,
    responseCookies: response.cookies,
  });
  const { error } = await auth.signOut();

  if (error) {
    console.error("[POST /api/auth/sign-out] Unable to end session", {
      code: error.error,
      statusCode: error.statusCode,
    });
    return NextResponse.json(
      { message: "We couldn’t sign you out. Please try again." },
      { status: error.statusCode || 500 },
    );
  }

  return response;
}
