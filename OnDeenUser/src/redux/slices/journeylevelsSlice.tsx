import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiGetRequest, apiRequest } from '../../services/api';
import { RootState } from '../store';

export const journeylevelslistAPI = createAsyncThunk(
  'customer_app/journey_levels',
  async (eventId: number, { getState, rejectWithValue }) => {
    const token = (getState() as RootState).token?.token?.access_token;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp.verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser.access_token;

    try {
      const response = await apiGetRequest({
        url: `/customer_app/event/journey_levels`,
        method: 'GET',
        authToken: token,
        bearerToken: bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        contentType: 'application/json',
      });
      if (!response.status) {
        return rejectWithValue(response.message);
      }
      return response.response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch questions and answers.'
      );
    }
  }
);

const journeylevelsSlice = createSlice({
  name: 'journeylevels',
  initialState: {
    status: 'idle',
    error: null,
    journeylevels: null,
  },
  reducers: {
    setjourneylevels(state, action) {
      state.journeylevels = action.payload;
    },
    cleanjourneylevels(state) {
      state.journeylevels = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(journeylevelslistAPI.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(journeylevelslistAPI.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.journeylevels = action.payload;
        state.error = null;
      })
      .addCase(journeylevelslistAPI.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error occurred';
      })
          
  },
});

export const { cleanjourneylevels, setjourneylevels } = journeylevelsSlice.actions;
export default journeylevelsSlice.reducer;
