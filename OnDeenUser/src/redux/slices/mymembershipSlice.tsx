import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiGetRequest, apiRequest } from '../../services/api';
import { RootState } from '../store';

export const myMembershiplistAPI = createAsyncThunk(
  'customer_app/membership/mine',
  async (eventId: number, { getState, rejectWithValue }) => {
    const token = (getState() as RootState).token?.token?.access_token;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp.verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser.access_token;

    try {
      const response = await apiGetRequest({
        url: `/customer_app/membership/mine`,
        method: 'GET',
        authToken: token,
        bearerToken: bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        contentType: 'application/json',
      });
      if (!response.status) {
        return rejectWithValue(response.message);
      }
      return response.response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch questions and answers.'
      );
    }
  }
);

const mymembershipSlice = createSlice({
  name: 'mymembership',
  initialState: {
    status: 'idle',
    error: null,
    mymembership: null,
  },
  reducers: {
    setmymembership(state, action) {
      state.mymembership = action.payload;
    },
    cleanmymembership(state) {
      state.mymembership = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(myMembershiplistAPI.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(myMembershiplistAPI.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.mymembership = action.payload;
        state.error = null;
      })
      .addCase(myMembershiplistAPI.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error occurred';
      })
          
  },
});

export const { cleanmymembership, setmymembership } = mymembershipSlice.actions;
export default mymembershipSlice.reducer;
