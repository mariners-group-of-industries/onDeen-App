import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {apiRequest} from '../../services/api';
import {RootState} from '../store';

interface OtpState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  otpSendMessage: any
}

const initialState: OtpState = {
  status: 'idle',
  error: null,
  otpSendMessage:null
};

export const sendOtp = createAsyncThunk(
  'otp/sendOtp',
  async (
    {
      country_code,
      mobile_number,
    }: {country_code: string; mobile_number: string},
    {getState, rejectWithValue},
  ) => {
    const token = (getState() as RootState).token?.token?.access_token;

    try {
      const response = await apiRequest({
        url: '/customer_app/users/send_otp',
        method: 'POST',
        data: {country_code, mobile_number},
        authToken: token,
        contentType: 'application/json',
      });
      return response;
    } catch (error: any) {

      
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
    otpSendMessage: null,
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
        state.otpSendMessage = action.payload.response.message;
        state.status = action.payload.response.status;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default sendOtpSlice.reducer;
