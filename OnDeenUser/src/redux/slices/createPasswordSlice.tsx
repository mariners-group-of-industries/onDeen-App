import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api';
import { RootState } from '../store';

interface CreatePasswordRequest {
  new_password: string;
  old_password?: string; // Only required when changing the password
}

interface ForgotPasswordRequest {
  new_password: string;
  // In-app change: the user's current password (required by the backend).
  old_password?: string;
  // Forgot-password: access token returned by OTP verification. Sent as the
  // Bearer token only, never in the request body.
  resetToken?: string;
}

interface CreatePasswordResponse {
  message: string;
  status: boolean;
}

interface CreatePasswordState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  forgotPasswordStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  forgotPasswordError: string | null;
  responseMessage: string | null;
  forgotPasswordResponseMessage: string | null;
  createPasswordStatus: boolean | null;
  forgotPasswordApiStatus: boolean | null;
}

const initialCreatePasswordState: CreatePasswordState = {
  status: 'idle',
  forgotPasswordStatus: 'idle',
  error: null,
  forgotPasswordError: null,
  responseMessage: null,
  forgotPasswordResponseMessage: null,
  createPasswordStatus: null,
  forgotPasswordApiStatus: null,
};

export const createPassword = createAsyncThunk(
    '/customer_app/users/change_password',
    async (data: {new_password: string; confirm_password: string}, { getState, rejectWithValue }) => {
      const state = getState() as RootState;
      const token = state.token?.token?.access_token;
      const bearerToken = state.user?.loginToken;
      const accessTokenVerifyOtp = state.verifyOtp?.verifyOtp_access_token;
      const accessTokenNewRegister = state.registerUser?.access_token;
  
      try {
        const response = await apiRequest({
          url: '/customer_app/users/change_password',
          method: 'POST',
          authToken: token,
          bearerToken: bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
          contentType: 'application/json',
          data,
        });
  
        if (!response.status) {
          return rejectWithValue(response.response?.message || 'Failed to update password');
        }
        return response.response as CreatePasswordResponse;
      } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to update password');
      }
    },
  );
  
  export const forgotPassword = createAsyncThunk(
    '/customer_app/users/forgot_password',
        async (data: ForgotPasswordRequest, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const token = state.token?.token?.access_token;
        const bearerToken = state.user?.loginToken;
        const accessTokenVerifyOtp = state.verifyOtp?.verifyOtp_access_token;
        const accessTokenNewRegister = state.registerUser?.access_token;
        // Forgot-password passes the token returned by OTP verification. The
        // backend only accepts a reset without old_password from a fresh OTP
        // session, so it must take priority over any stored login token.
        const { resetToken, ...body } = data;

        try {
        const response = await apiRequest({
          url: '/customer_app/users/change_password',
          method: 'POST',
          authToken: token,
          bearerToken: resetToken || bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
          contentType: 'application/json',
          data: body,
        });
        
        if (!response.status) {
          return rejectWithValue(response.response?.message || 'Failed to reset password');
        }
        return response.response as CreatePasswordResponse;
      } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to reset password');
      }
    },
  );
  

  const createPasswordSlice = createSlice({
    name: 'createPassword',
    initialState: initialCreatePasswordState,
    reducers: {
      clearCreatePasswordState(state) {
        state.status = 'idle';
        state.error = null;
        state.responseMessage = null;
        state.forgotPasswordApiStatus = null; // Reset API status when clearing
      },
      resetForgotPasswordApiStatus(state) {
        state.forgotPasswordApiStatus = null;
      },
    },
    extraReducers: builder => {
      builder
        .addCase(createPassword.pending, state => {
          state.status = 'loading';
          state.error = null;
          state.createPasswordStatus = null;
        })
        .addCase(createPassword.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.responseMessage = action.payload.message;
          state.createPasswordStatus = action.payload.status;
        })
        .addCase(createPassword.rejected, (state, action) => {
          state.status = 'failed';
          state.error = typeof action.payload === 'string' ? action.payload : 'Unknown error';
          state.createPasswordStatus = false;
        })
        .addCase(forgotPassword.pending, state => {
          state.forgotPasswordStatus = 'loading';
          state.forgotPasswordApiStatus = null;
        })
        .addCase(forgotPassword.fulfilled, (state, action) => {
          state.forgotPasswordStatus = 'succeeded';
          state.forgotPasswordResponseMessage = action.payload.message;
          state.forgotPasswordApiStatus = true; // Ensure this is updated properly
        })
        .addCase(forgotPassword.rejected, (state, action) => {
          state.forgotPasswordStatus = 'failed';
          state.forgotPasswordError = typeof action.payload === 'string' ? action.payload : 'Unknown error';
          state.forgotPasswordApiStatus = false; // Ensure this is updated properly
        });
    },
  });
  

export const { clearCreatePasswordState, resetCreatePasswordApiStatus, resetForgotPasswordApiStatus } =
  createPasswordSlice.actions;
export default createPasswordSlice.reducer;
