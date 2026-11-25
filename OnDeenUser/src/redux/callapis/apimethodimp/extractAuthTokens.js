// utils/extractAuthTokens.js
export const extractAuthTokens = (state) => {
  const authToken = state.token?.token?.access_token;
  const bearerToken = state.user?.loginToken;
  const verifyOtpToken = state.verifyOtp?.verifyOtp_access_token;
  const registerToken = state.registerUser?.access_token;

  return {
    authToken,
    bearerToken: bearerToken || verifyOtpToken || registerToken,
  };
};
