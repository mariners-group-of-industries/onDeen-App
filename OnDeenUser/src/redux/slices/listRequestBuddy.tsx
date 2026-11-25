import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api';
import { RootState } from '../store';

interface ListRequestBuddySliceState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  data: any[];
  message: string | null;
  error: string | null;
  apiStatus: boolean | null;
}

const initialState: ListRequestBuddySliceState = {
  status: 'idle',
  data: [],
  message: null,
  error: null,
  apiStatus: null,
};

// Helper function to get auth tokens
const getAuthTokens = (state: RootState) => ({
  authToken: state.token?.token?.access_token,
  bearerToken: state.user?.loginToken ||
    state.verifyOtp.verifyOtp_access_token ||
    state.registerUser.access_token,
});

export const listRequestBuddy = createAsyncThunk(
  'allSessionList/listRequestBuddy',
  async (_, { getState, rejectWithValue }) => {
    const { authToken, bearerToken } = getAuthTokens(getState() as RootState);

    try {
      const response = await apiRequest({
        url: '/customer_app/event/get_request_buddy_list',
        method: 'POST',
        authToken,
        bearerToken,
        data: { type: 2 },
        contentType: 'application/json',
      });
      return response;
    } catch (error: any) {

      return rejectWithValue(error.response?.data?.message || 'Failed to fetch session list.');
    }
  }
);

const listRequestBuddySlice = createSlice({
  name: 'allSessionList',
  initialState,
  reducers: {
    resetApiStatus: (state) => {
      state.apiStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(listRequestBuddy.pending, (state) => {
        state.status = 'loading';
        state.apiStatus = null;
      })
      .addCase(listRequestBuddy.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload || [];
        state.message = action.payload.message;
        state.apiStatus = action.payload.status;
      })
      .addCase(listRequestBuddy.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.apiStatus = false;
      });
  },
});

export const { resetApiStatus } = listRequestBuddySlice.actions;
export default listRequestBuddySlice.reducer;