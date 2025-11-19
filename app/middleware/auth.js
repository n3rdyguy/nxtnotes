export default defineNuxtRouteMiddleware(async () => {
  // We do not want this to run on client
  if (process.client) {
    return;
  }
  const { $verifyJwtToken } = useNuxtApp();
  const accessToken = useCookie("accessToken");
  if (!accessToken.value) {
    return navigateTo("/register");
  }
  try {
    await $verifyJwtToken(accessToken.value, process.env.JWT_SECRET);
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (error) {
    return navigateTo("/login");
  }
});
