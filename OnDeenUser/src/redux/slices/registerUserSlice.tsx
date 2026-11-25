import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api';
import { RootState } from '../store';
import { showToast } from '../../helpers/scale';

interface RegisterUserState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  message: string | null;
  is_registered: boolean | null;
  access_token: string | null;
  formValues: object;
  user: { first_name: string; last_name: string } | null;
}

const initialState: RegisterUserState = {
  status: 'idle',
  error: null,
  message: null,
  is_registered: false,
  access_token: null,
  user: null,
};

export const newRegisterUser = createAsyncThunk(
  'user/register',
  async ({ formValues }: { formValues: object }, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const token = state.token?.token?.access_token;

    try {
      const response = await apiRequest({
        url: '/customer_app/users/register',
        method: 'POST',
        data: JSON.stringify(formValues), // Pass the correct data
        authToken: token,
        contentType: 'application/json',
      });

      return response
    } catch (error: any) {
      return error || 'Failed to register user.';
    }
  }
);


const registerUserSlice = createSlice({
  name: 'registerUser',
  initialState,
  reducers: {
    resetRegisterState: state => {
      state.status = 'idle';
      state.error = null;
      state.message = null;
      state.is_registered = false;
      state.access_token = null;
      state.user = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(newRegisterUser.pending, state => {
        state.status = 'loading';
        state.error = null;
        state.message = null;
      })
      .addCase(newRegisterUser.fulfilled, (state, action) => {
        if (action.payload.status) {
          // Registration was successful
          state.status = 'succeeded';
          state.message = action.payload.message;
          state.is_registered = true;
          state.access_token = action.payload.access_token;
          state.user = action.payload.user;
          showToast('Registration successful');
        } else {
          // Registration failed
          state.status = 'failed';
          state.error = action.payload.message || 'Registration failed';
          showToast(state.error);
        }
      })
      .addCase(newRegisterUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'An error occurred during registration';
        showToast(state.error);
      });
  },
});

export const { resetRegisterState } = registerUserSlice.actions;
export default registerUserSlice.reducer;
