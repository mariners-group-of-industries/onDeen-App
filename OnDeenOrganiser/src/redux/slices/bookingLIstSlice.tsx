import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {apiRequest} from '../../services/api';
import {showResponce} from '../../responce/showResponce';

export const fetchBookingList = createAsyncThunk(
  'events/get_all_events',
  async (
    filter: {
      status: number;
      page: number;
      per_page: number;
      upcoming_days?: number;
      start_date: string;
      end_date: string;
    },
    {getState, rejectWithValue},
  ) => {
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

const bookingListSlice = createSlice({
  name: 'bookingList',
  initialState: {
    status: 'idle',
    error: null,
    bookingList: null,
  },
  reducers: {
    seteventListsdata(state, action) {
      state.bookingList = action.payload;
    },
    cleaneventlistsdata(state) {
      state.bookingList = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchBookingList.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchBookingList.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.bookingList = action.payload.response;
        state.error = null;
      })
      .addCase(fetchBookingList.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error occurred';
      });
  },
});

export const {cleaneventlistsdata, seteventListsdata} =
  bookingListSlice.actions;
export default bookingListSlice.reducer;
