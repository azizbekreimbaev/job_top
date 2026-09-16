import { createAuthActions } from "@insforge/sdk/ssr";
import { NextResponse, type NextRequest } from "next/server";

const OAUTH_VERIFIER_COOKIE = "insforge_code_verifier";

function oauthErrorResponse(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login?error=oauth", request.url));
  response.cookies.delete(OAUTH_VERIFIER_COOKIE);
  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("insforge_code");
  const verifier = request.cookies.get(OAUTH_VERIFIER_COOKIE)?.value;

  if (!code || !verifier) {
    return oauthErrorResponse(request);
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  const auth = createAuthActions({
    requestCookies: request.cookies,
    responseCookies: response.cookies,
  });
  const { error } = await auth.exchangeOAuthCode(code, verifier);

  if (error) {
    console.error("[OAuth callback] Code exchange failed", {
      code: error.error,
      statusCode: error.statusCode,
    });
    return oauthErrorResponse(request);
  }

  response.cookies.delete(OAUTH_VERIFIER_COOKIE);
  return response;
}
