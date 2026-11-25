import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {apiRequest} from '../../services/api';
import {RootState} from '../store';

// Session request state interface
interface RequestSessionState {
  sessionStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  sessionMessage: string | null;
  requestSession: number | null; // 0 for no request, 1 for already requested
}

const initialState: RequestSessionState = {
  sessionStatus: 'idle',
  error: null,
  sessionMessage: null,
  requestSession: null,
};

// Async Thunk for session request
export const requestSessionCall = createAsyncThunk(
  'session/requestSession',
  async (
    {
      eventId,
      type,
      speakerId,
      date,
      time,
      userComment,
    }: {
      eventId: number | string;
      type: number | string;
      speakerId: number | string;
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
    // Create an object with all the required parameters
    const requestData = {
      event_id: eventId,
      type: type,
      speaker_id: speakerId,
      date: date,
      time: time,
      user_comment: userComment,
    };

    try {
      const response = await apiRequest({
        url: '/customer_app/event/request_buddy',
        method: 'POST',
        authToken: token,
        bearerToken:
          bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        contentType: 'application/json',
        data: requestData, // Pass the whole object here
      });

      if (!response.status) {
        return rejectWithValue(
          response.response?.message ||
            response.message ||
            'Failed to request session.',
        );
      }

      return response.response;
    } catch (error: any) {
      
      return rejectWithValue(
        error.response?.data?.message || 'Failed to request session.',
      );
    }
  },
);

const requestSessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(requestSessionCall.pending, state => {
        state.sessionStatus = 'loading';
        state.error = null;
        state.sessionMessage = null;
        state.requestSession = null;
      })
      .addCase(requestSessionCall.fulfilled, (state, action) => {
        state.sessionStatus = 'succeeded';
        state.sessionMessage = action.payload.message;
        state.requestSession = action.payload.request_session;
      })
      .addCase(requestSessionCall.rejected, (state, action) => {
        state.sessionStatus = 'failed';
        state.error = action.payload as string;
        state.sessionMessage = null;
        state.requestSession = null;
      });
  },
});

export default requestSessionSlice.reducer;
