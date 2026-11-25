import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api';
import { RootState } from '../store';

interface SpeakerSlotsState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  data: any[];
  message: string | null;
  error: string | null;
  apiStatus: boolean | null;
}

const initialState: SpeakerSlotsState = {
  status: 'idle',
  data: [],
  message: null,
  error: null,
  apiStatus: null,
};

// Helper function to get authentication tokens
const getAuthTokens = (state: RootState) => ({
  authToken: state.token?.token?.access_token,
  bearerToken: state.user?.loginToken,
});

export const fetchSpeakerSlots = createAsyncThunk(
  'speakerSlots/fetchSpeakerSlots',
  async ({ speakerId, date }: { speakerId: number; date: string }, { getState, rejectWithValue }) => {
    const { authToken } = getAuthTokens(getState() as RootState);
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp.verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser.access_token;

    try {
      const response = await apiRequest({
        url: '/customer_app/speaker/speaker_slot',
        method: 'POST',
        authToken,
        bearerToken: bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        data: {
          id: speakerId?.toString(), // Ensure the ID is sent as a string
          date,
        },
        contentType: 'application/json',
      });

      return response;
    } catch (error: any) {

      return rejectWithValue(error.response?.data?.message || 'Failed to fetch speaker slots.');
    }
  }
);

const speakerSlotsSlice = createSlice({
  name: 'speakerSlots',
  initialState,
  reducers: {
    resetApiStatus: (state) => {
      state.apiStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSpeakerSlots.pending, (state) => {
        state.status = 'loading';
        state.apiStatus = null;
        state.data = [];
        state.error = null;
      })
      .addCase(fetchSpeakerSlots.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload || [];
        state.message = action.payload.message;
        state.apiStatus = action.payload.status;
      })
      .addCase(fetchSpeakerSlots.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.apiStatus = false;
      });
  },
});

export const { resetApiStatus } = speakerSlotsSlice.actions;
export default speakerSlotsSlice.reducer;
