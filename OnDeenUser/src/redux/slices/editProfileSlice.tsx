import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api';
import { RootState } from '../store';

export const editProfileAPI = createAsyncThunk(
  'editProfile/update',
  async (
    {
      first_name,
      last_name,
      email_id,
      country_code,
      mobile_number,
      journey_level_id,
      age,
      status,
      password,
      dob,
      gender,
      profile_image
    }: {
      first_name: any;
      last_name: any;
      email_id: any;
      country_code: any;
      mobile_number: any;
      journey_level_id: any;
      age: any;
      status: any;
      password: any;
      dob: any;
      gender: any;
      profile_image:any
    },
    { getState, rejectWithValue }
  ) => {
    const token = (getState() as RootState).token?.token?.access_token;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp?.verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser?.access_token;

    try {
      const response = await apiRequest({
        url: `/customer_app/users/update_profile`,
        method: 'POST',
        data: {
          first_name,
          last_name,
          // email_id,
          // country_code,
          // mobile_number,
          journey_level_id,
          age,
          // status,
          password,
          dob,
          gender,
          profile_image
        },
        authToken: token,
        bearerToken: bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        contentType: 'application/json',
      });
      
      if (response?.status) {
        return response;
      } else {
        return rejectWithValue(response?.response?.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

const editProfileSlice = createSlice({
  name: 'editProfile',
  initialState: {
    status: 'idle',
    error: null,
    profileData: null,
  },
  reducers: {
    resetEditProfileState(state) {
      state.status = 'idle';
      state.error = null;
      state.profileData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(editProfileAPI.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(editProfileAPI.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profileData = action.payload.response;
        state.error = null;
      })
      .addCase(editProfileAPI.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error occurred';
      });
  },
});

export const { resetEditProfileState } = editProfileSlice.actions;
export default editProfileSlice.reducer;
