import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api';
import { RootState } from '../store';

interface CheckInState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  message: string | null;
  error: string | null;
  apiStatus: boolean | null;

}

const initialState: CheckInState = {
  status: 'idle',
  message: null,
  error: null,
  apiStatus: null,

};

// Helper function to get auth tokens
const getAuthTokens = (state: RootState) => ({
  authToken: state.token?.token?.access_token,
  bearerToken: state.user?.loginToken,
});

export const checkInEvent = createAsyncThunk(
  'checkIn/checkInEvent',
    async ({ eventId,ticketId,latitude,longitude}: { eventId: number;ticketId:number; latitude:number; longitude:number}, { getState, rejectWithValue }) => {
    const { authToken } = getAuthTokens(getState() as RootState);
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp
      .verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser
      .access_token;

    try {
      const response = await apiRequest({
        url: `/customer_app/event/check_in`,
        method: 'POST',
        authToken,
        bearerToken:
          bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        data: {
          event_id: eventId,
          ticket_id: ticketId,
          latitude:latitude,
          longitude:longitude
        },
        contentType: 'application/json',
      });
      
      if (!response.status) return rejectWithValue(response.message);
      return response.response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to check-in.',
      );
    }
  }
);

const checkInSlice = createSlice({
  name: 'checkIn',
  initialState,
  reducers: {
    resetApiStatus: (state) => {
      state.apiStatus = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(checkInEvent.pending, state => {
        state.status = 'loading';
        state.apiStatus = null;
      })
      .addCase(checkInEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.message = action.payload.message;
        state.apiStatus = action.payload.status
      })
      .addCase(checkInEvent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.apiStatus = false;
      });
  },
});

export const {resetApiStatus} = checkInSlice.actions;
export default checkInSlice.reducer;
