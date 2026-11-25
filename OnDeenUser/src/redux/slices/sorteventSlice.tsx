import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {apiRequest} from '../../services/api';
import { RootState } from '../store';

export const eventSortAPI = createAsyncThunk(
  'sortevent/listing',
  async (
    {
      data,
    }: {category_id: string; sort: string; longitude: string; latitude: string},
    {getState, rejectWithValue},
  ) => {

    const token = (getState() as RootState).token?.token?.access_token;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp
      ?.verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser
      ?.access_token;
    try {
      const response = await apiRequest({
        url: '/customer_app/event/event',
        method: 'POST',
        data: data,
        authToken: token,
        bearerToken:
          bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        contentType: 'application/json',
      });
      if (response?.status) {
      }
      if (!response?.status) {

      }

      return response;
    } catch (log: any) {

      return rejectWithValue('Failed to login');
    }
  },
);

const sorteventSlice = createSlice({
  name: 'sortevent',
  initialState: {
    status: 'idle',
    error: null,
    sortevent: null,
  },
  reducers: {
    setSortEvent(state, action) {
      state.sortevent = action.payload;
    },
    cleanEventSort(state) {
      state.sortevent = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(eventSortAPI.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(eventSortAPI.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.sortevent = action.payload.response;
        state.error = null;
      })
      .addCase(eventSortAPI.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error occurred';
      });
  },
});

export const {cleanEventSort, setSortEvent} = sorteventSlice.actions;
export default sorteventSlice.reducer;
