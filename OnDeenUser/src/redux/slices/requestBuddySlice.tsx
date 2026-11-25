import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api';
import { RootState } from '../store';

// Buddy request state interface
interface BuddyRequestState {
  buddyStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  buddyMessage: string | null;
  requestBuddy: number | null; // 0 for no request, 1 for already requested
}

const initialState: BuddyRequestState = {
  buddyStatus: 'idle',
  error: null,
  buddyMessage: null,
  requestBuddy: null,
};

// Async Thunk for buddy request
export const requestBuddyCall = createAsyncThunk(
  'buddy/requestBuddy',
  async ( { eventId, type }: { eventId: number; type: any }, { getState, rejectWithValue }) => {
    const token = (getState() as RootState).token?.token?.access_token;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp.verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser.access_token;
    
    try {
      const response = await apiRequest({
        url: '/customer_app/event/request_buddy',
        method: 'POST',
        authToken: token,
        bearerToken: bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        contentType: 'application/json',
        data: { event_id: eventId , type:type},
      });

      if (!response.status) {
        return rejectWithValue(
          response.response?.message || response.message || 'Failed to request buddy.',
        );
      }

      return response.response;
    } catch (error: any) {

      return rejectWithValue(
        error.response?.data?.message || 'Failed to request buddy.',
      );
    }
  }
);

const buddySlice = createSlice({
  name: 'buddy',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(requestBuddyCall.pending, (state) => {
        state.buddyStatus = 'loading';
        state.error = null;
        state.buddyMessage = null;
        state.requestBuddy = null;
      })
      .addCase(requestBuddyCall.fulfilled, (state, action) => {
        state.buddyStatus = 'succeeded';
        state.buddyMessage = action.payload.message;
        state.requestBuddy = action.payload.request_buddy;
      })
      .addCase(requestBuddyCall.rejected, (state, action) => {
        state.buddyStatus = 'failed';
        state.error = action.payload as string;
        state.buddyMessage = null;
        state.requestBuddy = null;
      });
  },
});

export default buddySlice.reducer;
