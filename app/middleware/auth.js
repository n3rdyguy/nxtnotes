import { authClient } from "../../lib/auth-client";

export default defineNuxtRouteMiddleware(async () => {
  // We do not want this to run on client
  if (process.client) {
    return;
  }

  // Use BetterAuth to check session
  const { data: session } = await authClient.useSession(useFetch);

  if (!session.value) {
    return navigateTo("/register");
  }
});
