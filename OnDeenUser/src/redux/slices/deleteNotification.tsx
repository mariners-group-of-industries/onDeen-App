import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api';
import { RootState } from '../store';

interface DeleteNotificationState {
  deleteStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  deleteMessage: string | null;
  deletedUserId: number | null;
}

const initialState: DeleteNotificationState = {
  deleteStatus: 'idle',
  error: null,
  deleteMessage: null,
  deletedUserId: null,
};

// Async thunk for deleting notification
export const deleteNotificationCall = createAsyncThunk(
  'notification/deleteNotification',
  async ({ data }: { data: object }, { getState, rejectWithValue }) => {
    const token = (getState() as RootState).token?.token?.access_token;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp.verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser.access_token;
    try {
      const response = await apiRequest({
        url: '/customer_app/users/delete_notification',
        method: 'POST',
        authToken: token,
        bearerToken: bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        contentType: 'application/json',
        data: data,
      });

      if (!response.status) return rejectWithValue(response.message);


      return response.response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete notification.'
      );
    }
  }
);

const deleteNotificationSlice = createSlice({
  name: 'deleteNotification',
  initialState,
  reducers: {
    resetDeleteNotificationState: (state) => {
      state.deleteStatus = 'idle';
      state.error = null;
      state.deleteMessage = null;
      state.deletedUserId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(deleteNotificationCall.pending, (state) => {
        state.deleteStatus = 'loading';
        state.error = null;
        state.deleteMessage = null;
        state.deletedUserId = null;
      })
      .addCase(deleteNotificationCall.fulfilled, (state, action) => {
        state.deleteStatus = 'succeeded';
        state.deleteMessage = action.payload.message;
        state.deletedUserId = action.payload.user_id;
      })
      .addCase(deleteNotificationCall.rejected, (state, action) => {
        state.deleteStatus = 'failed';
        state.error = action.payload as string;
        state.deleteMessage = null;
        state.deletedUserId = null;
      });
  },
});

export const { resetDeleteNotificationState } = deleteNotificationSlice.actions;
export default deleteNotificationSlice.reducer;
