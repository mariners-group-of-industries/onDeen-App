// geteventListingSlice.js
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {apiRequest} from '../../services/api';
import {showResponce} from '../../responce/showResponce';

export const geteventListing = createAsyncThunk(
  'event/get_all_events',
  async (filter: { status: number, page: number, per_page: number, upcoming_days?: number }, { getState, rejectWithValue }) => {
    const token = (getState() as any).token.token?.access_token;
    const bearerToken = (getState() as any).user.loginToken;

    try {
      const response = await apiRequest({
        url: '/organizer_app/event/get_all_event',
        method: 'POST',
        data: filter,
        bearerToken: bearerToken,
        authToken: token,
        contentType: 'application/json',
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
      return rejectWithValue('Failed to fetch categories');
    }
  },
);

const geteventListingSlice = createSlice({
  name: 'geteventlist',
  initialState: {
    status: 'idle',
    error: null,
    geteventlist: null,
  },
  reducers: {
    seteventListdata(state, action) {
      state.geteventlist = action.payload;
    },
    cleaneventlistdata(state) {
      state.geteventlist = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(geteventListing.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(geteventListing.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.geteventlist = action.payload.response;
        state.error = null;
      })
      .addCase(geteventListing.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error occurred';
      });
  },
});

export const {cleaneventlistdata, seteventListdata} = geteventListingSlice.actions;
export default geteventListingSlice.reducer;
