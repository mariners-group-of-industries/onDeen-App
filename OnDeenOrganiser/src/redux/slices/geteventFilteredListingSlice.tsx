// geteventFilteredListingSlice.js
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {apiRequest} from '../../services/api';
import {showResponce} from '../../responce/showResponce';

export const filteredeventListing = createAsyncThunk(
  'event/filtered_get_all_events',
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

const geteventFilteredListingSlice = createSlice({
  name: 'getfilteredeventlist',
  initialState: {
    status: 'idle',
    error: null,
    getfilteredeventlist: null,
  },
  reducers: {
    setFilteredeventListdata(state, action) {
      state.getfilteredeventlist = action.payload;
    },
    cleanfilterdeventlistdata(state) {
      state.getfilteredeventlist = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(filteredeventListing.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(filteredeventListing.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.getfilteredeventlist = action.payload.response;
        state.error = null;
      })
      .addCase(filteredeventListing.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error occurred';
      });
  },
});

export const {cleanfilterdeventlistdata, setFilteredeventListdata} = geteventFilteredListingSlice.actions;
export default geteventFilteredListingSlice.reducer;
