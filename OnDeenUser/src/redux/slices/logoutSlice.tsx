import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiGetRequest, apiRequest } from '../../services/api';
import { RootState } from '../store';

interface LogoutState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  message: string | null;
  error: string | null;
}

const initialState: LogoutState = {
  status: 'idle',
  message: null,
  error: null,
};

// Async thunk to call the logout API
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, {getState, rejectWithValue}) => {
    const token = (getState() as RootState).token?.token?.access_token;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp.verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser.access_token;
    try {
      const response = await apiGetRequest({
        url: '/customer_app/users/logout',
        method: 'GET',
        authToken: token,
        bearerToken:bearerToken||accessTokenVerifyOtp||accessTokenNewRegister,
        contentType: 'application/json',
      });


      if (response?.status) {
        return response.response.message; // Extract the success message
      } else {
        throw new Error('Logout failed'); // Handle unexpected responses
      }
    } catch (error: any) {

      return rejectWithValue(error.message || 'Failed to log out');
    }
  }
);

const logoutSlice = createSlice({
  name: 'logout',
  initialState,
  reducers: {
    resetLogoutState: state => {
      // Resets the logout state to its initial values
      state.status = 'idle';
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Pending state handling
      .addCase(logoutUser.pending, state => {
        state.status = 'loading';
        state.message = null;
        state.error = null;
      })
      // Fulfilled (success) state handling
      .addCase(logoutUser.fulfilled, (state, action) => {
        
        
        state.status = 'succeeded';
        state.message = action.payload; // Set success message
        state.error = null;
      })
      // Rejected (error) state handling
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = 'failed';
        state.message = null;
        state.error = action.payload || 'Unknown error occurred';
      });
  },
});

export const { resetLogoutState } = logoutSlice.actions; // Export reset action for use in components

export default logoutSlice.reducer;
