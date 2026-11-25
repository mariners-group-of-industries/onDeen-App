import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {apiRequest} from '../../services/api';
import {RootState} from '../store';

// Update session request state interface
interface UpdateSessionState {
  updateSessionStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  updateSessionMessage: string | null;
  updateSession: number | null; // 0 for no request, 1 for already requested
}

const initialState: UpdateSessionState = {
  updateSessionStatus: 'idle',
  error: null,
  updateSessionMessage: null,
  updateSession: null,
};

// Async Thunk for update session request
export const updateSessionCall = createAsyncThunk(
  'session/updateSession',
  async (
    {
      id,
      date,
      time,
      userComment,
    }: {
      id: number;
      date: string;
      time: string;
      userComment: string;
    },
    {getState, rejectWithValue},
  ) => {
    const token = (getState() as RootState).token?.token?.access_token;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp
      .verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser
      .access_token;
    
    // Create an object with all the required parameters for updating
    const requestData = {
      id: id,
      action: 'request_reschedule',
      date: date,
      time: time,
      user_comment: userComment,
    };

    try {
      const response = await apiRequest({
        url: '/customer_app/event/update_status_request_buddy',
        method: 'POST',
        authToken: token,
        bearerToken:
          bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        contentType: 'application/json',
        data: requestData, // Pass the whole object here
      });

      if (!response.status) return rejectWithValue(response.message);

      return response.response;
    } catch (error: any) {


      return rejectWithValue(
        error.response?.data?.message || 'Failed to update session.',
      );
    }
  },
);

const updateSessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(updateSessionCall.pending, state => {
        state.updateSessionStatus = 'loading';
        state.error = null;
        state.updateSessionMessage = null;
        state.updateSession = null;
      })
      .addCase(updateSessionCall.fulfilled, (state, action) => {
        state.updateSessionStatus = 'succeeded';
        state.updateSessionMessage = action.payload.message;
        state.updateSession = action.payload.update_session;
      })
      .addCase(updateSessionCall.rejected, (state, action) => {
        state.updateSessionStatus = 'failed';
        state.error = action.payload as string;
        state.updateSessionMessage = null;
        state.updateSession = null;
      });
  },
});

export default updateSessionSlice.reducer;
