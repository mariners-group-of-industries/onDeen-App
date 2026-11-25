import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api';
import { RootState } from '../store';

interface PaymentStatusRequest {
  payment_intent_id: any;
  status: number;
}

interface PaymentStatusState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  message: string | null;
}

const initialState: PaymentStatusState = {
  status: 'idle',
  error: null,
  message: null,
};

export const updatePaymentStatus = createAsyncThunk<
  string,
  PaymentStatusRequest,
  { rejectValue: string }
>(
  'payment/updatePaymentStatus',
  async (paymentData, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const bearerToken =
      state.user?.loginToken ||
      state.verifyOtp?.verifyOtp_access_token ||
      state.registerUser?.access_token;
    const token = state.token?.token?.access_token;

    try {
      const response = await apiRequest({
        url: '/update_payment_status',
        method: 'POST',
        authToken: token,
        bearerToken,
        contentType: 'application/json',
        data: paymentData,
      });

      if (!response.status) {
        return rejectWithValue(
          response.message || 'Failed to update payment status.',
        );
      }

      return response.message as string;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'An unexpected error occurred.',
      );
    }
  },
);

const paymentStatusSlice = createSlice({
  name: 'paymentStatus',
  initialState,
  reducers: {
    resetPaymentStatusState: state => {
      state.status = 'idle';
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(updatePaymentStatus.pending, state => {
        state.status = 'loading';
        state.error = null;
        state.message = null;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.message = action.payload;
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error';
      });
  },
});

export const { resetPaymentStatusState } = paymentStatusSlice.actions;
export default paymentStatusSlice.reducer;
