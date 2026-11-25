import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {apiGetRequest, apiRequest} from '../../services/api';

interface TokenState {
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TokenState = {
  token: null,
  status: 'idle',
  error: null,
};

export const generateToken = createAsyncThunk(
  'token/generateToken',
  async (_, {rejectWithValue}) => {
    try {
      const response = await apiGetRequest({
        url: '/generate_token',
        method: 'GET',
        // contentType: 'application/json',
      });
            return response;
      
    } catch (error: any) {
      console.error('Token generation failed:', error.message || error);
      return rejectWithValue(error.message || 'Failed to generate token');
    }
  },
);

const tokenSlice = createSlice({
  name: 'token',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      // Pending state handling
      .addCase(generateToken.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      // Fulfilled (success) state handling
      .addCase(generateToken.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload;
        state.error = null;
      })
      // Rejected (error) state handling
      .addCase(generateToken.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error occurred';
      });
  },
});

export default tokenSlice.reducer;