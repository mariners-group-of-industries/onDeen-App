import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiGetRequest, apiRequest } from '../../services/api';
import { RootState } from '../store';

interface Event {
  ar_title: string | null;
  category_image: string | null;
  category_title: string;
  end_date: string;
  id: number;
  is_wishlisted: number;
  location_type: number;
  price: number;
  price_type: number;
  primary_image: string;
  start_date: string;
  tags: string;
  title: string;
}

interface HomeEventsState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  events: Event[] | null;
}

const initialState: HomeEventsState = {
  status: 'idle',
  error: null,
  events: null,
};

export const fetchHomeEvents = createAsyncThunk(
  'homeEvents/fetchEvents',
  async (category_id?: number, { getState, rejectWithValue }) => {
    const token = (getState() as RootState).token?.token?.access_token;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp.verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser.access_token;
// console.log('category_id >>>',category_id);

    try {
      const response = await apiRequest({
        url: '/customer_app/event/event',
        method: 'POST',
        authToken: token,
        data: category_id ? { category_id } : {}, // Conditionally include category_id
        bearerToken: bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        contentType: 'application/json',
      });
      // console.log(JSON.stringify(response), 'RRRRRRRŘ234567890');

      // console.log('API Response:', JSON.stringify(response));

      return response.response.events; // Return events from response
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Failed to fetch home events';
      return rejectWithValue(message);
    }
  }
);


const homeEventsSlice = createSlice({
  name: 'homeEvents',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeEvents.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchHomeEvents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.events = action.payload;
      })
      .addCase(fetchHomeEvents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default homeEventsSlice.reducer;
