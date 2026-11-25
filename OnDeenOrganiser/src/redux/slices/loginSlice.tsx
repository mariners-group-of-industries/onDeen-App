import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {apiRequest} from '../../services/api';

export const loginUser = createAsyncThunk(
  'user/login',
  async (
    credentials: {
      email_id: string;
      password: string;
      roleType?: number;
      showToast?: (message: string, type?: number) => void; // Ensure this is optional
    },
    { getState, rejectWithValue }
  ) => {
    const token = (getState() as any).token.token?.access_token;
    const { email_id, password, showToast } = credentials; // Destructure showToast

    try {
      const response = await apiRequest({
        url: '/organizer_app/login/login_password',
        method: 'POST',
        data: { email_id, password },
        authToken: token,
        contentType: 'application/json',
        showToast,  // Pass showToast here if needed
      });

      // Check if showToast exists and show it based on response
      if (showToast) {
        if (response?.status) {
          showToast(response?.response?.message || 'Login successful!', 1);
        } else {
          showToast(response?.response?.message || 'Failed to login.', 3);
        }
      }

      return response;
    } catch (error: any) {
      if (showToast) {
        showToast(error?.Error || 'Login failed. Please try again.', 3);
      }
      return rejectWithValue(error.response?.data || 'Failed to login');
    }
  }
);

const loginSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    status: 'idle',
    error: null,
    isLogin: false,
    loginToken: null,
    roleType: 3,
  },
  reducers: {
    setLoginToken(state, action) {
      state.loginToken = action.payload.loginToken;
      state.isLogin = action.payload.isLogin;
      state.roleType = Number(action.payload.roleType) || 3;
    },
    setBearerToken(state, action) {
      state.loginToken = action.payload;
    },
    logout(state) {
      state.isLogin = false;
      state.loginToken = null;
      state.roleType = 3;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginUser.pending, state => {
        state.status = 'loading';
        state.error = null;
        state.isLogin = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.response;
        state.loginToken = action.payload.response.access_token;
        state.roleType = Number(action.meta.arg.roleType) || 3;
        state.error = null;
        state.isLogin = Boolean(
          action.payload.status &&
          Number(action.payload.response?.user_status ?? 1) === 1 &&
          (action.payload.response?.application_status || 'APPROVED') === 'APPROVED',
        );
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload || 'Unknown error occurred';
        state.isLogin = false;
        state.status = action.payload.status;
      });
  },
});

export const {logout, setLoginToken, setBearerToken} = loginSlice.actions;
export default loginSlice.reducer;
