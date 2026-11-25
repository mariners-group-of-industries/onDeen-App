import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {apiGetRequest, apiRequest} from '../../services/api';
import {RootState} from '../store';

// Question and Answer data interface
interface QuestionAnswer {
  id: number;
  question: string;
  answer: string;
  user_first_name: string;
  user_last_name: string;
  user_id: number;
  user_profile_image: string;
  organizer_first_name: string;
  organizer_last_name: string;
  organizer_id: number;
  organizer_profile_image: string;
}

interface QuestionAnswerState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  questionsAnswers: QuestionAnswer[];
  addQuestionStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  addQuestionError: string | null;
}

const initialState: QuestionAnswerState = {
  status: 'idle',
  error: null,
  questionsAnswers: [],
  addQuestionStatus: 'idle',
  addQuestionError: null,
};

// Async Thunk for fetching Question and Answer list by Event ID
export const fetchQuestionAnswersByEventId = createAsyncThunk(
  'questionAnswer/fetchQuestionAnswersByEventId',
  async (eventId: number, {getState, rejectWithValue}) => {
    const token = (getState() as RootState).token?.token?.access_token;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp
      .verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser
      .access_token;

    try {
      const response = await apiGetRequest({
        url: `/customer_app/event/question_and_answers/${eventId}`,
        method: 'GET',
        authToken: token,
        bearerToken:
          bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        contentType: 'application/json',
      });
      if (!response.status) {
        return rejectWithValue(response.message);
      }
      return response.response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to fetch questions and answers.',
      );
    }
  },
);

// Async Thunk for adding a new question
export const addQuestion = createAsyncThunk(
  'questionAnswer/addQuestion',
  async (
    {eventId, question}: {eventId: number; question: string},
    {getState, rejectWithValue},
  ) => {
    const token = (getState() as RootState).token?.token?.access_token;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp
      .verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser
      .access_token;
    try {
      const response = await apiRequest({
        url: '/customer_app/event/add_event_question',
        method: 'POST',
        authToken: token,
        bearerToken:
          bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        contentType: 'application/json',
        data: {event_id: eventId, question},
      });
      
      if (!response.status) {
        return rejectWithValue(response.message);
      }
      return response.response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add question.',
      );
    }
  },
);

const questionAnswerSlice = createSlice({
  name: 'questionAnswer',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchQuestionAnswersByEventId.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchQuestionAnswersByEventId.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.questionsAnswers = action.payload;
      })
      .addCase(fetchQuestionAnswersByEventId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(addQuestion.pending, state => {
        state.addQuestionStatus = 'loading';
      })
      .addCase(addQuestion.fulfilled, (state, action) => {
        state.addQuestionStatus = 'succeeded';
        state.addQuestionError = null;
      })
      .addCase(addQuestion.rejected, (state, action) => {
        state.addQuestionStatus = 'failed';
        state.addQuestionError = action.payload as string;
      });
  },
});

export default questionAnswerSlice.reducer;
