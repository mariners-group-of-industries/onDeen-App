import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {apiGetRequest, apiRequest} from '../../services/api';
import {RootState} from '../store';

// Speaker data interface
interface Speaker {
  id: number;
  name: string;
  biography: string;
  primary_image: string;
  // Add other fields you need for the speaker
}

interface SpeakerState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  speakerDetail: Speaker | null;
}

const initialState: SpeakerState = {
  status: 'idle',
  error: null,
  speakerDetail: null,
};

// Helper function to get auth tokens
const getAuthTokens = (state: RootState) => ({
  authToken: state.token?.token?.access_token,
  bearerToken: state.user?.loginToken,
});

// Async Thunk for fetching speaker details by ID
export const fetchSpeakerById = createAsyncThunk(
  'speakerDetails/fetchSpeakerById',
  async (speakerId: number, {getState, rejectWithValue}) => {
    const {authToken} = getAuthTokens(getState() as RootState);
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp
      .verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser
      .access_token;

    try {
      const response = await apiGetRequest({
        url: `/customer_app/speaker/speaker_id?id=${speakerId}`,
        method: 'GET',
        authToken,
        bearerToken:
          bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        contentType: 'application/json',
      });

      if (!response.status) return rejectWithValue(response.message);

      return response.response;
    } catch (error: any) {
      // Debug log
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch speaker details.',
      );
    }
  },
);

const speakerSlice = createSlice({
  name: 'speakerDetails',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchSpeakerById.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchSpeakerById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.speakerDetail = action.payload;
      })
      .addCase(fetchSpeakerById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default speakerSlice.reducer;
