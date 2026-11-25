// registerquestionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiGetRequest, apiRequest } from '../../services/api';
import { showResponce } from '../../responce/showResponce';

export const registerquestionListing = createAsyncThunk(
  'registerquestion/listing',
  async (_, { getState, rejectWithValue }) => {
    const token = (getState() as any).token.token?.access_token;
    try {
      const response = await apiGetRequest({
        url: '/organizer_app/profile/register_question',
        method: 'GET',
        authToken: token,
      });
      if (response?.status) {
        // showResponce(response?.response?.message, 1);
      }
      if (!response?.status) {
        showResponce(response?.response?.message, 3);
      }
      return response; 
    } catch (error: any) {
      ;
      return rejectWithValue('Failed to fetch registerquestion');
    }
  }
);

const registerquestionSlice = createSlice({
  name: 'registerquestion',
  initialState: {
    status: 'idle',
    error: null,
    registerquestion: null, 
  },
  reducers: {
    setRegisterquestion(state, action) {
      state.registerquestion = action.payload;
    },
    cleanRegisterquestion(state) {
      state.registerquestion = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerquestionListing.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerquestionListing.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.registerquestion = action.payload.response;  
      })
      .addCase(registerquestionListing.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error occurred';
      });
  },
});

export const { cleanRegisterquestion, setRegisterquestion } = registerquestionSlice.actions;
export default registerquestionSlice.reducer;
