import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api';
import { RootState } from '../store';

export interface Participant {
  buddy_first_name: string | null;
  buddy_id: number | null;
  buddy_last_name: string | null;
  event_id: number;
  first_name: string;
  is_mine: number;
  last_name: string;
  participant_id: number;
  profile_image: string;
  request_buddy_id: number | null;
  user_id: number;
}

interface ParticipantsState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  participants: Participant[];
}

const initialState: ParticipantsState = {
  status: 'idle',
  error: null,
  participants: [],
};

export const fetchParticipants = createAsyncThunk(
  'participants/fetchParticipants',
  async (eventId: number, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp?.verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser?.access_token;
    const token = state.token?.token?.access_token;

    try {
      const response = await apiRequest({
        url: '/customer_app/event/participant_list',
        method: 'POST',
        authToken: token,
        bearerToken: bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        contentType: 'application/json',
        data: { event_id: eventId },
      });

      if (!response.status) {
        return rejectWithValue(response.message || 'Failed to fetch participants.');
      }

      return response.response as Participant[];
    } catch (error: any) {

        
      return rejectWithValue(error.response?.data?.message || 'An unexpected error occurred.');
    }
  }
);

const participantsSlice = createSlice({
  name: 'participants',
  initialState,
  reducers: {
    resetParticipantsState: (state) => {
      state.status = 'idle';
      state.error = null;
      state.participants = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchParticipants.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchParticipants.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.participants = action.payload;
      })
      .addCase(fetchParticipants.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { resetParticipantsState } = participantsSlice.actions;
export default participantsSlice.reducer;
