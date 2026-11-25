import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiGetRequest, apiRequest } from '../../services/api';
import { RootState } from '../store';

export const membershipPurchase = createAsyncThunk(
  'customer_app/membership/purchase',
  async (
    {
      id,
    }: { id: string },
    { getState, rejectWithValue },
  ) => {
    const token = (getState() as RootState).token?.token?.access_token;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp
      ?.verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser
      ?.access_token;
      
    try {
      const response = await apiRequest({
        url: '/customer_app/membership/purchase',
        method: 'POST',
        data: {'id': id},
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
export const membershiplistAPI = createAsyncThunk(
  'customer_app/membership/list',
  async (
    { event_id, type }: { event_id: string; type: string },
    { getState, rejectWithValue },
  ) => {
    const token = (getState() as RootState).token?.token?.access_token;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp
      ?.verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser
      ?.access_token;
      
    try {
      const response = await apiRequest({
        url: '/customer_app/membership/list',
        method: 'POST',
        data: { "page": 1, "size": 10 },
        authToken: token,
        bearerToken:
          bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        contentType: 'application/json',
      });
      
      if (response?.status) {
      }
      if (!response?.status) {
      }
      return response?.response;
    } catch (error: any) {

      return rejectWithValue('Failed to add to wishlist');
    }
  },
);

export const membershipPurchasedListAPI = createAsyncThunk(
  'customer_app/membership/mine',
  async (_, { getState, rejectWithValue }) => {
    const token = (getState() as RootState).token?.token?.access_token;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp
      ?.verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser
      ?.access_token;

    try {
      const response = await apiGetRequest({
        url: '/customer_app/membership/mine',
        method: 'GET',
        authToken: token,
        bearerToken:
          bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        contentType: 'application/json',
      });


      if (!response?.status) {
        return rejectWithValue(response?.response?.message || 'Error');
      }

      return response?.response?.membership;
    } catch (error: any) {

      return rejectWithValue('Failed to fetch purchased memberships');
    }
  },
);


const membershipSlice = createSlice({
  name: 'membership',
  initialState: {
    status: 'idle',   
    error: null,
    membership: null,
    purchasedMemberships: [],
  },
  reducers: {
    setMembership(state, action) {
      state.membership = action.payload;
    },
    cleanMembership(state) {
      state.membership = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(membershiplistAPI.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(membershiplistAPI.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.membership = action.payload;
        state.error = null;
      })
      .addCase(membershiplistAPI.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error occurred';
      })
      .addCase(membershipPurchasedListAPI.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(membershipPurchasedListAPI.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.purchasedMemberships = action.payload;
        state.error = null;
      })
      .addCase(membershipPurchasedListAPI.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error occurred';
      });
  },
});

export const { cleanMembership, setMembership } = membershipSlice.actions;
export default membershipSlice.reducer;
