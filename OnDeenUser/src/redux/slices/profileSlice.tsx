import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {apiGetRequest, apiRequest} from '../../services/api';
import {RootState} from '../store';

interface ProfileResponse {
  country_code: string;
  course_count: number;
  created_on: string;
  email_id: string;
  event_count: number;
  first_name: string;
  gender: number;
  last_name: string;
  mobile_number: string;
  profile_image: string;
  status: number;
  tour_count: number;
}

interface ProfileState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  data: ProfileResponse | null;
}

const initialState: ProfileState = {
  status: 'idle',
  error: null,
  data: null,
};

// Async Thunk for fetching profile data
export const fetchProfileData = createAsyncThunk(
  'profile/fetchProfileData',
  async (_, {getState, rejectWithValue}) => {
    const token = (getState() as RootState).token?.token?.access_token;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp?.verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser?.access_token;
    try {
      const response = await apiGetRequest({
        url: '/customer_app/users/get_profile',
        method: 'GET',
        authToken: token,
        bearerToken:bearerToken||accessTokenVerifyOtp||accessTokenNewRegister,
        contentType: 'application/json',
      });
      
      return response.response;
    } catch (error: any) {

      const message =
        error.response?.data?.message || 'Failed to fetch profile data';
      return rejectWithValue(message);
    }
  },
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    resetProfileState: (state) => {
      state.data = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProfileData.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProfileData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchProfileData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { resetProfileState } = profileSlice.actions;
export default profileSlice.reducer;
