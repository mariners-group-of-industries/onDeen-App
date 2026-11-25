import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api';
import { RootState } from '../store';

interface Review {
  id: number;
  event_id: number;
  event_title: string;
  rating_value: number;
  review: string;
  user_id: number;
  user_first_name: string;
  user_last_name: string;
  created_on: string;
}

interface RatingState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  reviews: Review[];
  addReviewStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  addReviewError: string | null;
}

const initialState: RatingState = {
  status: 'idle',
  error: null,
  reviews: [],
  addReviewStatus: 'idle',
  addReviewError: null,
};

export const addReview = createAsyncThunk(
  'rating/addReview',
  async (
    { eventId, ratingValue, review, title}: { eventId: number; ratingValue: number; review: string; title: string },
    { getState, rejectWithValue }
  ) => {
    const token = (getState() as RootState).token?.token?.access_token;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp?.verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser?.access_token;
   
    
    try {
      const response = await apiRequest({
        url: '/customer_app/event/add_rating',
        method: 'POST',
        authToken: token,
        bearerToken:bearerToken||accessTokenVerifyOtp||accessTokenNewRegister,
        contentType: 'application/json',
        data: { event_id: eventId, rating_value: ratingValue, review , title},
      });
      if (!response.status) {
        return rejectWithValue(response.message);
      }
      
      return response.response;
    } catch (error: any) {

      
      return rejectWithValue(error.response?.data?.message || 'Failed to add review.');
    }
  }
);

export const fetchReviewsByEventId = createAsyncThunk(
  'rating/fetchReviewsByEventId',
  async (userId: number, { getState, rejectWithValue }) => {
    const token = (getState() as RootState).token?.token?.access_token;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp?.verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser?.access_token;
    
    try {
      const response = await apiRequest({
        url: '/customer_app/event/get_rating',
        method: 'POST',
        authToken: token,
        bearerToken:bearerToken||accessTokenVerifyOtp||accessTokenNewRegister,
        contentType: 'application/json',
        data: { user_id: userId },
      });
      if (!response.status) {
        return rejectWithValue(response.message);
      }

      return response.response;
    } catch (error: any) {


      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews.');
    }
  }
);

const ratingSlice = createSlice({
  name: 'rating',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviewsByEventId.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchReviewsByEventId.fulfilled, (state, action) => {        
        state.status = 'succeeded';
        state.reviews = action.payload;
      })
      .addCase(fetchReviewsByEventId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(addReview.pending, (state) => {
        state.addReviewStatus = 'loading';
      })
      .addCase(addReview.fulfilled, (state) => {
        state.addReviewStatus = 'succeeded';
        state.addReviewError = null;
      })
      .addCase(addReview.rejected, (state, action) => {
        state.addReviewStatus = 'failed';
        state.addReviewError = action.payload as string;
      });
  },
});

export default ratingSlice.reducer;
