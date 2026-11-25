import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {apiRequest} from '../../services/api';
import {RootState} from '../store';
import { showResponce } from '../../responce/showResponce';

interface RegisterUserState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  message: string | null;
  is_registered: boolean | null;
}

const initialState: RegisterUserState = {
  status: 'idle',
  error: null,
  message: null,
  is_registered: null,
};

export const registerUser = createAsyncThunk(
  'user/register',
  async (
    {
      first_name,
      last_name,
      email_id,
      password,
      profile_image,
      gender,
      mobile_number,
      country_code,
      otp,
    }: {
      first_name: string;
      last_name: string;
      email_id: string;
      password: string;
      profile_image: string | null;
      gender: string;
      mobile_number: string;
      country_code: string;
      otp: string;
    },
    {getState, rejectWithValue},
  ) => {
    const state = getState() as RootState;
    const token = state.token?.token?.access_token;

    // Validate required fields
    if (
      !first_name ||
      !last_name ||
      !email_id ||
      !password ||
      !mobile_number ||
      !otp ||
      !country_code ||
      !gender
    ) {
      return rejectWithValue('All fields are required for registration.');
    }

    // Create FormData instance
    const formData = new FormData();
    formData.append('otp', otp);
    formData.append('first_name', first_name);
    formData.append('last_name', last_name);
    formData.append('email_id', email_id);
    formData.append('password', password);
    formData.append('mobile_number', mobile_number);
    formData.append('country_code', country_code);
    formData.append(
      'gender',
      gender === 'Male' ? '1' : gender === 'Female' ? '2' : '3',
    );

    try {
      const response = await apiRequest({
        url: '/customer_app/users/register',
        method: 'POST',
        data: formData,
        authToken: token,
        contentType: 'application/json',
      });

      if (!response.success) {
        return rejectWithValue(response.message || 'Registration failed.');
      }
      if (response?.status) {
        showResponce(response?.response?.message, 1);
      }
      if (!response?.status) {
        showResponce(response?.response?.message, 3);
      }

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || 'Failed to register user.',
      );
    }
  },
);

const registerUserSlice = createSlice({
  name: 'registerUser',
  initialState,
  reducers: {
    resetRegisterState: state => {
      state.status = 'idle';
      state.error = null;
      state.message = null;
      state.is_registered = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(registerUser.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.message = action.payload.message;
        state.is_registered = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const {resetRegisterState} = registerUserSlice.actions;
export default registerUserSlice.reducer;
