import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {apiRequest} from '../../services/api';
import {showResponce} from '../../responce/showResponce';

export const eventcreateAPI = createAsyncThunk(
  'eventcreate/listing',
  async (
    {showToast, data}: {showToast: any; data: object},
    {getState, rejectWithValue},
  ) => {
    
    const token = (getState() as any).token.token?.access_token;
    const bearerToken = (getState() as any).user.loginToken;
    try {
      const response = await apiRequest({
        url: '/organizer_app/event/create',
        method: 'POST',
        data: data,
        authToken: token,
        bearerToken: bearerToken,
        contentType: 'application/json',
        showToast,
      });
      ;
      
      if (response?.status) {
        showToast(response?.response?.message, 1);
      }
      if (!response?.status) {
        showToast(response?.response?.message, 3);
      }

      return response;
    } catch (error: any) {
      showToast(error.message || error || 'Failed', 3);
      ;
      return rejectWithValue('Failed to login');
    }
  },
);

const eventcreateSlice = createSlice({
  name: 'eventcreate',
  initialState: {
    status: 'idle',
    error: null,
    eventcreate: null,
  },
  reducers: {
    setEventcreate(state, action) {
      state.eventcreate = action.payload;
    },
    cleanEventcreate(state) {
      state.eventcreate = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(eventcreateAPI.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(eventcreateAPI.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.eventcreate = action.payload.response;
        state.error = null;
      })
      .addCase(eventcreateAPI.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error occurred';
      });
  },
});

export const {cleanEventcreate, setEventcreate} = eventcreateSlice.actions;
export default eventcreateSlice.reducer;
