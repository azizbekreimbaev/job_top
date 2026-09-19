import "server-only";

import { createServerClient } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

export async function createInsforgeServer() {
  return createServerClient({ cookies: await cookies() });
}

export const getSessionUser = cache(async () => {
  const insforge = await createInsforgeServer();
  return insforge.auth.getCurrentUser();
});
