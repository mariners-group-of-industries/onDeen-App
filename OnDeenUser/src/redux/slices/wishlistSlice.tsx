import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {apiGetRequest, apiRequest} from '../../services/api';
import {useDispatch} from 'react-redux';
import {RootState} from '../store';
import {fetchEventById} from './eventsSlice';

// Add to Wishlist API
export const addToWishlistAPI = createAsyncThunk(
  'customer_app/wishlist/toggle',
  async (
    {event_id, type}: {event_id: string; type: string},
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
        url: '/customer_app/wishlist/toggle', // The endpoint for adding to wishlist
        method: 'POST',
        data: {event_id: event_id}, // Sending item ID as payload
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
    } catch (error: any) {

      return rejectWithValue('Failed to add to wishlist');
    }
  },
);

export const getWishlistAPI = createAsyncThunk(
  'customer_app/wishlist/list',
  async (eventId: number, {getState, rejectWithValue}) => {
    const token = (getState() as RootState).token?.token?.access_token;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp
      .verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser
      .access_token;
    try {
      const response = await apiRequest({
        url: '/customer_app/wishlist/list',
        method: 'POST',
        authToken: token,
        bearerToken:
          bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        contentType: 'application/json',
        data: {},
      });
      
      if (!response.status) {
        return rejectWithValue(
          response.response?.message || 'Failed to fetch booking list data',
        );
      }
      return response.response;
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to fetch booking list data',
      );
    }
  },
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    status: 'idle',
    error: null,
    wishlist: null,
  },
  reducers: {
    setWishlist(state, action) {
      state.wishlist = action.payload;
    },
    cleanWishlist(state) {
      state.wishlist = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getWishlistAPI.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getWishlistAPI.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.wishlist = action.payload;
        state.error = null;
      })
      .addCase(getWishlistAPI.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error occurred';
      })
      .addCase(addToWishlistAPI.pending, state => {
        // You can add loading state for add to wishlist if needed
      })
      .addCase(addToWishlistAPI.fulfilled, (state, action) => {
        // Handle successful add to wishlist (optional)
      })
      .addCase(addToWishlistAPI.rejected, (state, action) => {
        state.error = action.payload || 'Failed to add item to wishlist';
      });
  },
});

export const {cleanWishlist, setWishlist} = wishlistSlice.actions;
export default wishlistSlice.reducer;
