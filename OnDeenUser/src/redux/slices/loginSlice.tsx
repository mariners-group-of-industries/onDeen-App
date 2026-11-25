import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {apiRequest} from '../../services/api';

export const loginUser = createAsyncThunk(
  'user/login',
  async (
    credentials: {email_id: string; password: string},
    {getState, rejectWithValue},
  ) => {
    const token = (getState() as any).token.token?.access_token;

    try {
      const response = await apiRequest({
        url: '/customer_app/users/login',
        method: 'POST',
        data: {
          email_id: credentials.email_id,
          password: credentials.password,
        },
        authToken: token,
        contentType: 'application/json',
      });

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || 'Unable to reach the server. Please try again.',
      );
    }
  },
);

const loginSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    status: 'idle',
    error: null,
    isLogin: false,
    loginToken: '',
    isSkippedLogin: false,
    isSkippedLoginAllow: true,
    lastAttemptedEventId: null,
  },
  reducers: {
    setLoginToken(state, action) {
      const token = action?.payload?.access_token || action?.payload || '';
      state.loginToken = token;
      state.user = {
        ...(state.user || {}),
        access_token: token,
      };
      if (token) {
        state.isLogin = true;
        state.isSkippedLogin = false;
        state.isSkippedLoginAllow = false;
      }
    },
    setLoginState: (state, action) => {
      state.isLogin = action.payload;
    },
    setIsSkippedLogin: (state, action) => {
      state.isSkippedLogin = action.payload;
    },
    setIsSkippedLoginAllow: (state, action) => {
      state.isSkippedLoginAllow = action.payload;
    },
    logout(state) {
      state.user = {
        first_name: '',
        last_name: '',
        email_id: '',
        access_token: '',
      };
      state.isLogin = false;
      state.isSkippedLogin = false;
      state.isSkippedLoginAllow = true;
      state.status = 'idle';
      state.error = null;
      state.loginToken = '';
    },
    setLastAttemptedEventId: (state, action) => {
      state.lastAttemptedEventId = action.payload;
    },
    clearLastAttemptedEventId: (state) => {
      state.lastAttemptedEventId = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginUser.pending, state => {
        state.status = 'loading';
        state.isLogin = false;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        if (action.payload?.status) {
          // Successful login
          state.isLogin = true;
          state.isSkippedLogin = false;
          state.isSkippedLoginAllow = false;
          state.user = action.payload.response;
          state.loginToken = action.payload.response.access_token;
          state.status = 'succeeded';
          state.error = null;
        } else {
          // Login failed (status: false)
          state.status = 'failed';
          state.error = action.payload?.response?.message || 'Unable to sign in';
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.isLogin = false;
        state.error = action.payload || 'Unknown error occurred';
      });
  },
});

export const {logout, setLoginToken,setLoginState,setIsSkippedLogin,setIsSkippedLoginAllow,setLastAttemptedEventId,clearLastAttemptedEventId} = loginSlice.actions;
export default loginSlice.reducer;
