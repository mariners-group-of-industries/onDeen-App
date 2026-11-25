import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {apiRequest} from '../../services/api';
import {showResponce} from '../../responce/showResponce';

export const getparticipantattendancelistbyidAPI = createAsyncThunk(
  'event/get_participant_attendance_list',
  async (id: {id: string}, {getState, rejectWithValue}) => {
    const token = (getState() as any).token.token?.access_token;
    const bearerToken = (getState() as any).user.loginToken;

    try {
      const response = await apiRequest({
        url: '/organizer_app/event/get_participant_attendance_list',
        method: 'POST',
        data: {
          participant_id: id,
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

const getparticipantattendancelistidSlice = createSlice({
  name: 'getparticipantattendancelist',
  initialState: {
    status: 'idle',
    error: null,
    getparticipantattendancelist: null,
  },
  reducers: {
    setgetparticipantattendancelistattanancebyid(state, action) {
      state.getparticipantattendancelist = action.payload;
    },
    cleangetparticipantattendancelistattancebyid(state) {
      state.getparticipantattendancelist = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getparticipantattendancelistbyidAPI.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(
        getparticipantattendancelistbyidAPI.fulfilled,
        (state, action) => {
          state.status = 'succeeded';
          state.getparticipantattendancelist = action.payload.response;
          state.error = null;
        },
      )
      .addCase(
        getparticipantattendancelistbyidAPI.rejected,
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload || 'Unknown error occurred';
        },
      );
  },
});

export const {
  cleangetparticipantattendancelistattancebyid,
  setgetparticipantattendancelistattanancebyid,
} = getparticipantattendancelistidSlice.actions;
export default getparticipantattendancelistidSlice.reducer;
