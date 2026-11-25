import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api';
import { RootState } from '../store';

// ====== Types ======

interface AwardLevel {
  attend_count: number;
  id: number;
  image: string;
  title: string;
}

interface ParticipantProfile {
  age: number;
  attended_count: number;
  avg_rating: number;
  award_level: AwardLevel[];
  country_code: string;
  course_count: number;
  created_on: string;
  email_id: string;
  event_count: number;
  first_name: string;
  gender: number;
  journey_level_id: number;
  journey_level_title: string;
  last_name: string;
  mobile_number: string;
  profile_image: string;
  rating_count: number;
  show_awards: number;
  show_course: number;
  show_events: number;
  show_journeylevel: number;
  show_reviews: number;
  status: number;
  tour_count: number;
}

interface ParticipantProfileState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  profile: ParticipantProfile | null;
}

// ====== Initial State ======

const initialState: ParticipantProfileState = {
  status: 'idle',
  error: null,
  profile: null,
};

// ====== Async Thunk ======

export const fetchParticipantProfile = createAsyncThunk(
  'participantProfile/fetchParticipantProfile',
  async (userId: number, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp?.verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser?.access_token;
    const token = state.token?.token?.access_token;


    try {
      const response = await apiRequest({
        url: '/customer_app/event/get_user_profile',
        method: 'POST',
        authToken: token,
        bearerToken: bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        contentType: 'application/json',
        data: { user_id: userId },
      });


      if (!response.status) {
        return rejectWithValue(response.message || 'Failed to fetch participant profile.');
      }

      return response.response as ParticipantProfile;
    } catch (error: any) {

      return rejectWithValue(error.response?.data?.message || 'An unexpected error occurred.');
    }
  }
);

// ====== Slice ======

const participantProfileSlice = createSlice({
  name: 'participantProfile',
  initialState,
  reducers: {
    resetParticipantProfileState: (state) => {
      state.status = 'idle';
      state.error = null;
      state.profile = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchParticipantProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchParticipantProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(fetchParticipantProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

// ====== Exports ======

export const { resetParticipantProfileState } = participantProfileSlice.actions;
export default participantProfileSlice.reducer;
