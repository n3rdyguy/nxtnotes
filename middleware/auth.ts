/* eslint-disable node/prefer-global/process */
export default defineNuxtRouteMiddleware(async (event) => {
  // We do not want this to run on client
  if (process.client) {
    return;
  }
  const { $verifyJwtToken } = useNuxtApp();
  const jwtToken = useCookie("jwtToken");
  if (!jwtToken.value) {
    return navigateTo("/register");
  }
  try {
    await $verifyJwtToken(jwtToken.value, process.env.JWT_SECRET);
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (error) {
    return navigateTo("/register");
  }
});
