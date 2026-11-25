import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiGetRequest, apiRequest } from '../../services/api';
import { showResponce } from '../../responce/showResponce';

export const getProfileDetails = createAsyncThunk(
  '/profile/get_profile',
  async (_, { getState, rejectWithValue }) => {
    const token = (getState() as any).token.token?.access_token;
    const bearerToken = (getState() as any).user.loginToken;
    try {
      const response = await apiGetRequest({
        url: '/organizer_app/profile/get_profile',
        method: 'GET',
        authToken: token,
        bearerToken: bearerToken,
      });
      if (response?.status) {
        // showResponce(response?.response?.message, 1);
      }
      if (!response?.status) {
        showResponce(response?.response?.message, 3);
      }
      
      return response; 
    } catch (error: any) {
      ;
      return rejectWithValue('Failed to fetch profiledatails');
    }
  }
);

const getprofileSlice = createSlice({
  name: 'profiledatails',
  initialState: {
    status: 'idle',
    error: null,
    profiledatails: null, 
  },
  reducers: {
    setgetprofile(state, action) {
      state.profiledatails = action.payload;
    },
    cleangetprofile(state) {
      state.profiledatails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProfileDetails.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getProfileDetails.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profiledatails = action.payload.response;  
      })
      .addCase(getProfileDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error occurred';
      });
  },
});

export const { cleangetprofile, setgetprofile } = getprofileSlice.actions;
export default getprofileSlice.reducer;
