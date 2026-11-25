import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api';
import { RootState } from '../store';

interface DeleteAccountState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  message: string | null;
  error: string | null;
}

const initialState: DeleteAccountState = {
  status: 'idle',
  message: null,
  error: null,
};

// Async thunk to handle account deletion
export const deleteAccount = createAsyncThunk(
  'auth/deleteAccount',
  async (_, { getState, rejectWithValue }) => {
    const token = (getState() as RootState).token?.token?.access_token;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp.verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser.access_token;
    try {
      const response = await apiRequest({
        url: '/customer_app/users/delete_account',
        method: 'GET',
        authToken: token,
        bearerToken:bearerToken||accessTokenVerifyOtp||accessTokenNewRegister,
        contentType: 'application/json',
      });

      if (response?.status) {
        return response.response.message; // e.g. "deleted_successfully"
      } else {
        throw new Error('Account deletion failed');
      }
    } catch (error: any) {

      return rejectWithValue(error.message || 'Failed to delete account');
    }
  }
);

const deleteAccountSlice = createSlice({
  name: 'deleteAccount',
  initialState,
  reducers: {
    resetDeleteAccountState: state => {
      state.status = 'idle';
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(deleteAccount.pending, state => {
        state.status = 'loading';
        state.message = null;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.message = action.payload;
        state.error = null;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.status = 'failed';
        state.message = null;
        state.error = action.payload || 'Unknown error occurred';
      });
  },
});

export const { resetDeleteAccountState } = deleteAccountSlice.actions;

export default deleteAccountSlice.reducer;
