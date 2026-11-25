import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {apiRequest} from '../../services/api';
import {showResponce} from '../../responce/showResponce';

export const walletTransactionsAPI = createAsyncThunk(
  'profile/wallet_transactions',
  async (id: {id: string}, {getState, rejectWithValue}) => {
    const token = (getState() as any).token.token?.access_token;
    const bearerToken = (getState() as any).user.loginToken;

    try {
      const response = await apiRequest({
        url: '/organizer_app/profile/wallet_transactions',
        method: 'POST',
        data: {
          "search":"",
        },
        authToken: token,
        bearerToken: bearerToken,
        contentType: 'application/json',
      });
      if (response?.status) {
        // showResponce(response?.response?.message, 1);
      }
      if (!response?.status) {
        showResponce(response?.response?.message, 3);
      }
      //

      return response;
    } catch (error: any) {
      ;
      return rejectWithValue('Failed to login');
    }
  },
);

const walletTransactionsSlice = createSlice({
  name: 'wallettransactions',
  initialState: {
    status: 'idle',
    error: null,
    wallettransactions: null,
  },
  reducers: {
    setwallettransactionsid(state, action) {
      state.wallettransactions = action.payload;
    },
    cleanwallettrans(state) {
      state.wallettransactions = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(walletTransactionsAPI.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(walletTransactionsAPI.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.wallettransactions = action.payload.response;
        state.error = null;
      })
      .addCase(walletTransactionsAPI.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error occurred';
      });
  },
});

export const {cleanwallettrans, setwallettransactionsid} = walletTransactionsSlice.actions;
export default walletTransactionsSlice.reducer;
