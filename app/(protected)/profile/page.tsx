import { ProfileAttention } from "@/components/profile/ProfileAttention";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ResumeUpload } from "@/components/profile/ResumeUpload";

export default function ProfilePage() {
  return (
    <main className="mx-auto max-w-[1024px] space-y-8 px-5 py-8 sm:px-8 sm:py-10">
      <ProfileAttention />
      <ResumeUpload />
      <ProfileForm />
    </main>
  );
}
