import {RootState} from '../store';

// Helper function to get auth tokens
export const getAuthTokens = (state: RootState) => ({
  bearerToken: state.user?.loginToken,
  accessTokenVerifyOtp: state.verifyOtp?.verifyOtp_access_token,
  accessTokenNewRegister: state.registerUser?.access_token,
});

// Utility function to validate tokens and return appropriate action
export const validateTokens = (state: RootState) => {
  const {bearerToken, accessTokenVerifyOtp, accessTokenNewRegister} =
    getAuthTokens(state);
  if (
    (bearerToken && bearerToken.length >= 5) || 
    (accessTokenVerifyOtp && accessTokenVerifyOtp.length >= 5) || 
    (accessTokenNewRegister && accessTokenNewRegister.length >= 5)
  ) {
    return true;
  }

  // If none of the tokens are valid, return false indicating login is required
  return false;
};