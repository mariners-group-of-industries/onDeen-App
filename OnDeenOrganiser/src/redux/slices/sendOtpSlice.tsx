import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {apiRequest} from '../../services/api';
import {RootState} from '../store';
import {loginRoutesForRole, ROLE_TYPES} from '../../helpers/roleRoutes';

interface OtpState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: OtpState = {
  status: 'idle',
  error: null,
};

export const sendOtp = createAsyncThunk(
  'otp/sendOtp',
  async (
    {
      country_code,
      mobile_number,
      roleType = ROLE_TYPES.ORGANISER,
      showToast,
    }: {
      country_code: string;
      mobile_number: string;
      roleType?: number;
      showToast?: (message: string, type?: number) => void;
    },
    {getState, rejectWithValue},
  ) => {
    const token = (getState() as RootState).token?.token?.access_token;

    try {
      const response = await apiRequest({
        url: loginRoutesForRole(roleType).sendOtp,
        method: 'POST',
        data: {
          country_code,
          mobile_number,
        },
        authToken: token,
        contentType: 'application/json',
        showToast,
      });
      if (response?.status) {
        showToast?.(response?.response?.message || 'OTP sent successfully!', 1);
      } else {
        showToast?.(response?.response?.message || 'Failed to send OTP.', 3);
      }
      return response;
    } catch (error: any) {
      showToast?.(error?.Error || 'Failed', 3);
      return rejectWithValue(error.response?.data || 'Failed to send OTP');
    }
  },
);

const sendOtpSlice = createSlice({
  name: 'otp',
  initialState: {
    status: 'idle',
    error: null,
    is_register: null,
    message: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(sendOtp.pending, state => {
        
        state.status = 'loading';
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.is_register = action.payload.response.is_register;
        state.message = action.payload.response.message;
        state.status = action.payload.response.status;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default sendOtpSlice.reducer;
