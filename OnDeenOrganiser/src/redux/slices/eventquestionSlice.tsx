// eventquestionSlice.js
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {apiGetRequest, apiRequest} from '../../services/api';
import {showResponce} from '../../responce/showResponce';

export const eventquestionListing = createAsyncThunk(
  'event/question_and_answers',
  async (id: string | number, {getState, rejectWithValue}) => {
    const token = (getState() as any).token.token?.access_token;
    const bearerToken = (getState() as any).user.loginToken;
    console.log(id, 'idididididididididididididididididididididididididididididididid');
    
    try {
      const response = await apiGetRequest({
        url: `/organizer_app/event/question_and_answers/${id}/2`,
        method: 'GET',
        authToken: token,
        bearerToken: bearerToken,
      });
      console.log(response?.response, 'RRRRR');
      
      if (response?.status) {
        // showResponce(response?.response?.message, 1);
      }
      if (!response?.status) {
        showResponce(response?.response?.message, 3);
      }
      return response;
    } catch (error: any) {
      return rejectWithValue('Failed to fetch eventquestion');
    }
  },
);


export const updateAnswers = createAsyncThunk(
  'organizer_app/event/update_event_answer',
  async (
    data: {id: number; answer: string; event_id: string | number},
    {getState, rejectWithValue},
  ) => {
    const token = (getState() as any).token.token?.access_token;
    const bearerToken = (getState() as any).user.loginToken;

    try {
      const response = await apiRequest({
        url: '/organizer_app/event/update_event_answer',
        method: 'POST',
        data: data,
        authToken: token,
        bearerToken: bearerToken,
        contentType: 'application/json',
      });

      if (response?.status) {
        // eventquestionListing(data?.event_id)
        // showResponce(response?.response?.message, 1);
      }
      if (!response?.status) {
        showResponce(response?.response?.message, 3);
        return rejectWithValue(
          response?.response?.message || 'Failed to update answer',
        );
      }
      return response;
    } catch (error: any) {
      return rejectWithValue('Failed to login');
    }
  },
);

const eventquestionSlice = createSlice({
  name: 'eventquestion',
  initialState: {
    status: 'idle',
    error: null,
    eventquestion: null,
  },
  reducers: {
    setRegisterquestion(state, action) {
      state.eventquestion = action.payload;
    },
    cleanRegisterquestion(state) {
      state.eventquestion = null;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(eventquestionListing.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(eventquestionListing.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.eventquestion = action.payload.response;
      })
      .addCase(eventquestionListing.rejected, (state, _action) => {
        state.status = 'failed';
      });
  },
});

export const {cleanRegisterquestion, setRegisterquestion} =
  eventquestionSlice.actions;
export default eventquestionSlice.reducer;
