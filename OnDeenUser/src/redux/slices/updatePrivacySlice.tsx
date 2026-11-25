import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {apiRequest} from '../../services/api';
import {RootState} from '../store';

interface PrivacySettingsPayload {
  show_course: number;
  show_events: number;
  show_reviews: number;
  show_journeylevel: number;
  show_awards: number;
}

interface UpdatePrivacyState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  message: string | null;
  error: string | null;
  apiStatus: boolean | null;
  userId: number | null;
}

const initialState: UpdatePrivacyState = {
  status: 'idle',
  message: null,
  error: null,
  apiStatus: null,
  userId: null,
};

export const updatePrivacySettings = createAsyncThunk(
  'privacy/updatePrivacySettings',
  async (payload: PrivacySettingsPayload, {getState, rejectWithValue}) => {
    const token = (getState() as RootState).token?.token?.access_token;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp.verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser.access_token;
    try {
      const response = await apiRequest({
        url: '/customer_app/users/update_privacy',
        method: 'POST',
        authToken: token,
        bearerToken: bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        data: payload,
        contentType: 'application/json',
      });

      return response;
    } catch (error: any) {

        
      return rejectWithValue(
        error?.response?.data?.message || 'Failed to update privacy settings.',
      );
    }
  },
);

const updatePrivacySlice = createSlice({
  name: 'privacy',
  initialState,
  reducers: {
    resetPrivacyStatus: state => {
      state.status = 'idle';
      state.apiStatus = null;
      state.message = null;
      state.error = null;
      state.userId = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(updatePrivacySettings.pending, state => {
        state.status = 'loading';
        state.apiStatus = null;
        state.error = null;
      })
      .addCase(updatePrivacySettings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.message = action.payload?.response?.message || null;
        state.userId = action.payload?.response?.user_id || null;
        state.apiStatus = action.payload?.status || false;
      })
      .addCase(updatePrivacySettings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.apiStatus = false;
      });
  },
});

export const {resetPrivacyStatus} = updatePrivacySlice.actions;
export default updatePrivacySlice.reducer;
