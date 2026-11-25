import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiGetRequest, apiRequest } from '../../services/api';
import { showResponce } from '../../responce/showResponce';

export const getdashboardDetails = createAsyncThunk(
  '/organizer_app/profile/dashboard',
  async (_, { getState, rejectWithValue }) => {
    const token = (getState() as any).token.token?.access_token;
    const bearerToken = (getState() as any).user.loginToken;
    try {
      const response = await apiGetRequest({
        url: '/organizer_app/profile/dashboard',
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
      return rejectWithValue('Failed to fetch getdashboard');
    }
  }
);

const getdashboardSlice = createSlice({
  name: 'getdashboard',
  initialState: {
    status: 'idle',
    error: null,
    getdashboard: null, 
  },
  reducers: {
    setgetprofile(state, action) {
      state.getdashboard = action.payload;
    },
    cleangetprofile(state) {
      state.getdashboard = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getdashboardDetails.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getdashboardDetails.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.getdashboard = action.payload.response;  
      })
      .addCase(getdashboardDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error occurred';
      });
  },
});

export const { cleangetprofile, setgetprofile } = getdashboardSlice.actions;
export default getdashboardSlice.reducer;
