import { PostHogIdentity } from "@/components/analytics/PostHogIdentity";
import { getSessionUser } from "@/lib/insforge-server";

export async function ProtectedIdentity() {
  const { data } = await getSessionUser();

  if (!data?.user) {
    return null;
  }

  return (
    <PostHogIdentity
      userId={data.user.id}
      email={data.user.email}
      name={data.user.profile?.name}
    />
  );
}
