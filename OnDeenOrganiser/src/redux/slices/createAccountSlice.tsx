import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {apiRequest} from '../../services/api';
import {showResponce} from '../../responce/showResponce';

export const createAccount = createAsyncThunk(
  'createaccount/register',
  async (data: {data: userdata}, {getState, rejectWithValue}) => {
    const token = (getState() as any).token.token?.access_token;

    try {
      const response = await apiRequest({
        url: '/organizer_app/login/register',
        method: 'POST',
        data: data,
        authToken: token,
        contentType: 'application/json',
      });

      if (response?.status) {
        showResponce(response?.response?.message, 1);
      }
      if (!response?.status) {
        showResponce(response?.response?.message, 3);
      }
      return response;
    } catch (error: any) {
      return rejectWithValue('Failed to login');
    }
  },
);

export const updateAccount = createAsyncThunk(
  'profile/update_profile',
  async (data: {data: userdata}, {getState, rejectWithValue}) => {
    const token = (getState() as any).token.token?.access_token;
    const bearerToken = (getState() as any).user.loginToken;

    try {
      const response = await apiRequest({
        url: '/organizer_app/profile/update_profile',
        method: 'POST',
        data: data,
        authToken: token,
        bearerToken: bearerToken,
        contentType: 'application/json',
      });

      if (response?.status) {
        showResponce(response?.response?.message, 1);
      }
      if (!response?.status) {
        showResponce(response?.response?.message, 3);
      }
      return response;
    } catch (error: any) {
      return rejectWithValue('Failed to login');
    }
  },
);

const createAccountSlice = createSlice({
  name: 'createaccount',
  initialState: {
    createaccount: null,
    status: 'idle',
    error: null,
    loginToken: null,
  },
  reducers: {
    setLoginToken(state, action) {
      state.loginToken = action.payload;
    },
    logout(state) {
      state.loginToken = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(createAccount.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.createaccount = action.payload.response;
        state.loginToken = action.payload.response.access_token;
        state.error = null;
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error occurred';
      });
  },
});

export const {logout, setLoginToken} = createAccountSlice.actions;
export default createAccountSlice.reducer;
