import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api';
import { RootState } from '../store';

interface VerifyOtpState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  verifyOtp_access_token: string | null;
  first_name: string | null;
  last_name: string | null;
  is_register: boolean | null;
  message: string | null;
  mobile_number: string | null;
  otp: number | null;
  country_code: string | null;
}

const initialState: VerifyOtpState = {
  status: 'idle',
  error: null,
  verifyOtp_access_token: null,
  first_name: null,
  last_name: null,
  is_register: null,
  message: null,
  mobile_number: null,
  otp: null,
  country_code: null,
};

// Async thunk to handle OTP verification
export const verifyOtp = createAsyncThunk(
  'otp/verifyOtp',
  async ({ data }: { data: object }, { getState, rejectWithValue },) => {
    const token = (getState() as RootState).token?.token?.access_token; // Optional token handling
    console.log(data, 'PAYLOAD FOR VERIFY OTP');

    try {
      const response = await apiRequest({
        url: '/customer_app/users/verify_otp',
        method: 'POST',
        data: data,
        authToken: token,
        contentType: 'application/json',
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to verify OTP');
    }
  },
);

const verifyOtpSlice = createSlice({
  name: 'verifyOtp',
  initialState,
  reducers: {
    resetOtpState: state => {
      Object.assign(state, initialState);
    },
    setAccessToken: (state, action) => {
      state.verifyOtp_access_token = action.payload.access_token;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(verifyOtp.pending, (state, action) => {
        state.status = 'loading';
        state.error = null; // Clear previous errors
        state.message = null; // Clear any previous messages
        state.mobile_number = action.meta.arg.mobile_number;
        state.otp = action.meta.arg.otp;
        state.country_code = action.meta.arg.country_code;
      })
    builder.addCase(verifyOtp.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.verifyOtp_access_token = action.payload.access_token;
      state.first_name = action.payload.first_name;
      state.last_name = action.payload.last_name;
      state.is_register = action.payload.is_register ?? null;
      state.message = action.payload.message;
      state.error = null; // Clear error on success

    })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to verify OTP';
        state.message = action.payload?.message || null;
      });
  },
});

export const { resetOtpState } = verifyOtpSlice.actions;
export const selectOtpStatus = (state: RootState) => state.verifyOtp.status;
export const selectOtpError = (state: RootState) => state.verifyOtp.error;
export const selectOtpMessage = (state: RootState) => state.verifyOtp.message;
export const selectAccessToken = (state: RootState) =>
  state.verifyOtp.verifyOtp_access_token;
export const selectFirstName = (state: RootState) => state.verifyOtp.first_name;
export const selectLastName = (state: RootState) => state.verifyOtp.last_name;
export const selectIsRegister = (state: RootState) =>
  state.verifyOtp.is_register;

export const { setAccessToken } = verifyOtpSlice.actions;
export default verifyOtpSlice.reducer;
