import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {apiRequest} from '../../services/api';
import {RootState} from '../store';

const FCM_TOKEN_KEY = 'fcmToken';

interface FcmTokenState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  token: string | null;
  message: string | null;
  error: string | null;
  apiStatus: boolean | null;
}

const initialState: FcmTokenState = {
  status: 'idle',
  token: null,
  message: null,
  error: null,
  apiStatus: null,
};

export const fetchAndSaveFcmToken = createAsyncThunk(
  'fcmToken/fetchAndSaveFcmToken',
  async (_, {getState, rejectWithValue}) => {
    try {
      const token = await AsyncStorage.getItem(FCM_TOKEN_KEY);

      if (token) return token; // Avoid unnecessary API calls if token exists

      throw new Error('No FCM token found in AsyncStorage');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch FCM token.');
    }
  },
);

export const sendFcmTokenToServer = createAsyncThunk(
  'fcmToken/sendFcmTokenToServer',
  async (_, {getState, rejectWithValue}) => {
    const {token} = (getState() as RootState).fcmTokenSlice;
    const {isLogin} = (getState() as RootState).user;
    const {is_register} = (getState() as RootState).sendOtp;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp
      ?.verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser
      ?.access_token;
    if (!isLogin && !is_register) {
      return rejectWithValue('User is not logged in or registered.');
    }

    if (!token) {
      return rejectWithValue('No FCM token available.');
    }


    try {
      const response = await apiRequest({
        url: `/customer_app/users/insert_push_token`,
        method: 'POST',
        bearerToken:
          bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        data: {
          push_token: token, // ✅ Send token as a string, not an object
        },
        contentType: 'application/json',
      });

      return response;
    } catch (error: any) {

      return rejectWithValue(
        error.response?.data?.message || 'Failed to send FCM token.',
      );
    }
  },
);

const fcmTokenSlice = createSlice({
  name: 'fcmToken',
  initialState,
  reducers: {
    resetApiStatus: state => {
      state.apiStatus = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAndSaveFcmToken.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload;
        state.apiStatus = true;
      })
      .addCase(fetchAndSaveFcmToken.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.apiStatus = false;
      })
      .addCase(sendFcmTokenToServer.pending, state => {
        state.status = 'loading';
        state.apiStatus = null;
      })
      .addCase(sendFcmTokenToServer.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.message = action.payload.response?.message;
        state.apiStatus = action.payload.status;
      })
      .addCase(sendFcmTokenToServer.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.apiStatus = false;
      });
  },
});

export const {resetApiStatus} = fcmTokenSlice.actions;
export default fcmTokenSlice.reducer;
