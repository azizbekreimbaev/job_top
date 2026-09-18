import { redirect } from "next/navigation";

import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { createInsforgeServer } from "@/lib/insforge-server";
import {
  calculateProfileCompletion,
  createProfileFormValues,
} from "@/lib/profile";

export default async function ProfilePage() {
  const insforge = await createInsforgeServer();
  const { data: authData, error: authError } =
    await insforge.auth.getCurrentUser();

  if (authError || !authData?.user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await insforge.database
    .from("profiles")
    .select("*")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError) {
    console.error("[ProfilePage] Unable to load profile", profileError);
    return (
      <main className="mx-auto max-w-[1024px] px-5 py-8 sm:px-8 sm:py-10">
        <div
          role="alert"
          className="border border-error bg-surface px-4 py-3 text-sm text-text-dark"
        >
          We could not load your profile. Refresh the page to try again.
        </div>
      </main>
    );
  }

  const initialValues = createProfileFormValues(profile, {
    email: authData.user.email,
    fullName: authData.user.profile?.name ?? "",
  });
  const initialCompletion = calculateProfileCompletion(initialValues);

  return (
    <main className="mx-auto max-w-[1024px] space-y-8 px-5 py-8 sm:px-8 sm:py-10">
      <ProfileEditor
        initialCompletion={initialCompletion}
        initialValues={initialValues}
      />
    </main>
  );
}
