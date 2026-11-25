import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api';
import { RootState } from '../store';

interface BookingListItem {
  event_id: number;
  event_name: string;
  event_date: string;
  payment_status: number;
  participant_id: number;
  qrcode: string;
  user_id: number;
}

interface BookingListResponse {
  bookings: BookingListItem[];
  total_count: number;
}

interface BookingListState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  bookingListData: BookingListResponse | null;
}

const initialBookingListState: BookingListState = {
  status: 'idle',
  error: null,
  bookingListData: null,
};

export const APICallForMonthCalemder = createAsyncThunk(
  '/customer_app/event/APICallForMonthCalemder',
  async (
    {
      data,
    }: { data: object; },
    { getState, rejectWithValue },
  ) => {

    const token = (getState() as RootState).token?.token?.access_token;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp
      .verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser
      .access_token;
    try {
      const response = await apiRequest({
        url: '/customer_app/event/booking_list',
        method: 'POST',
        authToken: token,
        bearerToken:
          bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        contentType: 'application/json',
        data: data,
      });
      return response
    } catch (error: any) {

    }
  },
);

export const fetchBookingList = createAsyncThunk(
  '/customer_app/event/booking_list',
  async (
    {
      filter
    }: { filter: object },
    { getState, rejectWithValue },
  ) => {

    const token = (getState() as RootState).token?.token?.access_token;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp
      .verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser
      .access_token;
    console.log(filter, 'CHECK PAYLOAD  ');
    
    try {
      const response = await apiRequest({
        url: '/customer_app/event/booking_list',
        method: 'POST',
        authToken: token,
        bearerToken:
          bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        contentType: 'application/json',
        data: filter,
      });

      if (!response.status) {
        return rejectWithValue(
          response.response?.message || 'Failed to fetch booking list data',
        );
      }
      return response.response as BookingListResponse; // Ensure data is serializable
    } catch (error: any) {


      return rejectWithValue(
        error.message || 'Failed to fetch booking list data',
      );
    }
  },
);

const bookingListSlice = createSlice({
  name: 'bookingList',
  initialState: initialBookingListState,
  reducers: {
    clearBookingListData(state) {
      state.status = 'idle';
      state.error = null;
      state.bookingListData = null;
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
        state.bookingListData = action.payload;
      })
      .addCase(fetchBookingList.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          typeof action.payload === 'string' ? action.payload : 'Unknown error';
        state.bookingListData = null;
      });
  },
});

export const { clearBookingListData } = bookingListSlice.actions;
export default bookingListSlice.reducer;
