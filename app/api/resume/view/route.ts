import { redirect } from "next/navigation";

import { createInsforgeServer } from "@/lib/insforge-server";

const SIGNED_URL_LIFETIME_SECONDS = 15 * 60;

export async function GET() {
  const insforge = await createInsforgeServer();
  const { data: authData, error: authError } =
    await insforge.auth.getCurrentUser();

  if (authError || !authData?.user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await insforge.database
    .from("profiles")
    .select("resume_pdf_key")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (
    profileError ||
    !profile ||
    typeof profile.resume_pdf_key !== "string"
  ) {
    return new Response("Resume not found.", { status: 404 });
  }

  const { data: signedUrlData, error: signedUrlError } = await insforge.storage
    .from("resumes")
    .createSignedUrl(
      profile.resume_pdf_key,
      SIGNED_URL_LIFETIME_SECONDS,
    );

  if (signedUrlError || !signedUrlData?.signedUrl) {
    console.error("[resume/view] Unable to create signed URL", signedUrlError);
    return new Response("Resume preview is temporarily unavailable.", {
      status: 503,
    });
  }

  return Response.redirect(signedUrlData.signedUrl, 307);
}
