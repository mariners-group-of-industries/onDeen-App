import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {apiRequest} from '../../services/api';

export const updateprofileAPI = createAsyncThunk(
  'organizer_app/event/update_attendance',
  async (data: {data: userdata}, {getState, rejectWithValue}) => {
    const token = (getState() as any).token.token?.access_token;
    const bearerToken = (getState() as any).user.loginToken;

    try {
      const response = await apiRequest({
        url: '/customer_app/users/update_profile',
        method: 'POST',
        data: data,
        authToken: token,
        bearerToken: bearerToken,
        contentType: 'application/json',
      });
      if (response?.status) {
      }
      if (!response?.status) {
      }

      return response;
    } catch (error: any) {
      ;
      return rejectWithValue('Failed to login');
    }
  },
);

const updateprofileSlice = createSlice({
  name: 'updateattendance',
  initialState: {
    status: 'idle',
    error: null,
    updateattendance: null,
  },
  reducers: {
    setupdateattendance(state, action) {
      state.updateattendance = action.payload;
    },
    cleanupdateattendance(state) {
      state.updateattendance = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(updateprofileAPI.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateprofileAPI.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.updateattendance = action.payload.response;
        state.error = null;
      })
      .addCase(updateprofileAPI.rejected, (state, action) => {
        state.status = 'failed';
      });
  },
});

export const {cleanupdateattendance, setupdateattendance} =
  updateprofileSlice.actions;
export default updateprofileSlice.reducer;
