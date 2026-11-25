import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {apiRequest} from '../../services/api';
import {showResponce} from '../../responce/showResponce';

export const eventbyidAPI = createAsyncThunk(
  'event/get_by_id',
  async (id: {id: string}, {getState, rejectWithValue}) => {
    const token = (getState() as any).token.token?.access_token;
    const bearerToken = (getState() as any).user.loginToken;

    try {
      const response = await apiRequest({
        url: '/organizer_app/event/get_by_id',
        method: 'POST',
        data: {
          id: id,
        },
        authToken: token,
        bearerToken: bearerToken,
        contentType: 'application/json',
      });
      if (response?.status) {
        // showResponce(response?.response?.message, 1);
      }
      if (!response?.status) {
        showResponce(response?.response?.message, 3);
      }
      //

      return response;
    } catch (error: any) {
      ;
      return rejectWithValue('Failed to login');
    }
  },
);

const eventbyidSlice = createSlice({
  name: 'eventbyid',
  initialState: {
    status: 'idle',
    error: null,
    eventbyid: null,
  },
  reducers: {
    setEventbyid(state, action) {
      state.eventbyid = action.payload;
    },
    cleaneventbyid(state) {
      state.eventbyid = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(eventbyidAPI.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(eventbyidAPI.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.eventbyid = action.payload.response;
        state.error = null;
      })
      .addCase(eventbyidAPI.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error occurred';
      });
  },
});

export const {cleaneventbyid, setEventbyid} = eventbyidSlice.actions;
export default eventbyidSlice.reducer;
