import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {apiRequest} from '../../services/api';
import {RootState} from '../store';
import {showResponce} from '../../responce/showResponce';
import {loginRoutesForRole, ROLE_TYPES} from '../../helpers/roleRoutes';

interface VerifyOtpState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  access_token: string | null;
  first_name: string | null;
  last_name: string | null;
  is_register: boolean | null;
  message: string | null;
  mobile_number: string | null;
  otp: string | number | null;
  country_code: string | null;
  isLogin: boolean;
  loginToken: string | null;
}

const initialState: VerifyOtpState = {
  status: 'idle',
  error: null,
  access_token: null,
  first_name: null,
  last_name: null,
  is_register: null,
  message: null,
  mobile_number: null,
  otp: null,
  country_code: null,
  isLogin: false,
  loginToken: null,
};

export const verifyOtp = createAsyncThunk(
  'otp/verifyOtp',
  async (
    {
      mobile_number,
      otp,
      country_code,
      roleType = ROLE_TYPES.ORGANISER,
      showToast,
    }: {
      mobile_number: string;
      otp: string | number;
      country_code: string;
      roleType?: number;
      showToast?: (message: string, type?: number) => void;
    },
    {getState, rejectWithValue},
  ) => {
    const token = (getState() as RootState).token?.token?.access_token;
    try {
      const response = await apiRequest({
        url: loginRoutesForRole(roleType).verifyOtp,
        method: 'POST',
        data: {
          mobile_number,
          otp,
          country_code,
        },
        authToken: token,
        contentType: 'application/json',
      });
      if (response?.status) {
        showToast?.(response?.response?.message || 'Verify successfully!', 1);
      } else {
        showToast?.(response?.response?.message || 'Failed to verify.', 3);
      }
      return response;
    } catch (error: any) {
      showToast?.(error?.Error || 'Failed', 3);
      return rejectWithValue(error.response?.data || 'Failed to send OTP');
    }
  },
);

const verifyOtpSlice = createSlice({
  name: 'verifyOtp',
  initialState,
  reducers: {
    resetOtpState: state => {
      state.status = 'idle';
      state.error = null;
      state.access_token = null;
      state.first_name = null;
      state.last_name = null;
      state.is_register = null;
      state.message = null;
      state.mobile_number = null;
      state.otp = null;
      state.country_code = null;
      state.isLogin = false;
      state.loginToken = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(verifyOtp.pending, (state, action) => {
        state.status = 'loading';
        state.error = null;
        state.mobile_number = action.meta.arg.mobile_number;
        state.otp = action.meta.arg.otp;
        state.country_code = action.meta.arg.country_code;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.access_token = action.payload.response.access_token;
        state.first_name = action.payload.response.first_name;
        state.last_name = action.payload.response.last_name;
        state.is_register = action.payload.response.is_register;
        state.message = action.payload.response.message;
        if (action.payload.status === false) {
          state.error = action.payload.response.message;
        }
        state.loginToken = action.payload.response.access_token;
        state.error = null;

        state.isLogin = Boolean(
          action.payload.response.is_register &&
          Number(action.payload.response.user_status ?? 1) === 1 &&
          (action.payload.response.application_status || 'APPROVED') === 'APPROVED',
        );
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to verify OTP';
        state.message = action.payload?.message;
      });
  },
});

export const {resetOtpState} = verifyOtpSlice.actions;
export default verifyOtpSlice.reducer;
