import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api';
import { RootState } from '../store';

interface CancelBookingState {
  cancelBookingStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  cancelBookingErrror: string | null;
  cancelBookingMessage: string | null;
}

const initialState: CancelBookingState = {
  cancelBookingStatus: 'idle',
  cancelBookingErrror: null,
  cancelBookingMessage: null,
};

export const cancelBooking = createAsyncThunk(
  'booking/cancelBooking',
  async (
    { data }: { data: object },
    { getState, rejectWithValue },
  ) => {
    const state = getState() as RootState;

    const token = state.token?.token?.access_token;
    const bearerToken = state.user?.loginToken;
    const accessTokenVerifyOtp = state.verifyOtp?.verifyOtp_access_token;
    const accessTokenNewRegister = state.registerUser?.access_token;

    try {
      const response = await apiRequest({
        url: '/customer_app/event/cancle_booking',
        method: 'POST',
        authToken: token,
        bearerToken:
          bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        contentType: 'application/json',
        data: data,
      });

      return response.response;
    } catch (error: any) {

      return rejectWithValue(
        error.response?.data?.message || 'Failed to cancel booking.',
      );
    }
  },
);

const cancelBookingSlice = createSlice({
  name: 'cancelBooking',
  initialState,
  reducers: {
    resetCancelBookingState: state => {
      state.cancelBookingStatus = 'idle';
      state.cancelBookingErrror = null;
      state.cancelBookingMessage = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(cancelBooking.pending, state => {
        state.cancelBookingStatus = 'loading';
        state.cancelBookingErrror = null;
        state.cancelBookingMessage = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.cancelBookingStatus = 'succeeded';
        state.cancelBookingMessage = action.payload?.message;
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.cancelBookingStatus = 'failed';
        state.cancelBookingErrror = action.payload as string;
      });
  },
});

export const { resetCancelBookingState } = cancelBookingSlice.actions;
export default cancelBookingSlice.reducer;
