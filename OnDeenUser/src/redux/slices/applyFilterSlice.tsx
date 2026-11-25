import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {apiRequest} from '../../services/api';
import {RootState} from '../store';

interface FilterApplyRequest {
  speaker_id: number;
  journey_level_id: number;
  organizer_id: number;
  sort_by: string;
  category_id: number;
  start_date: string;
  location_type: string;
  end_date: string;
  data: any;
}

interface FilterApplyResponse {
  // Assuming you will return some specific data here, adjust this as needed
  events: any[];
}

interface FilterApplyState {
  filterStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  filterApplyData: FilterApplyResponse | null;
}

const initialFilterApplyState: FilterApplyState = {
  filterStatus: 'idle',
  error: null,
  filterApplyData: null,
};

export const applyFilter = createAsyncThunk(
  'filterApply/applyFilter',
  async (
    {
      data,
    }: {
      data: any;
    },
    {getState, rejectWithValue},
  ) => {
    const state = getState() as RootState;
    const token = state.token?.token?.access_token;
    const bearerToken = state.user?.loginToken;
    const accessTokenVerifyOtp = state.verifyOtp?.verifyOtp_access_token;
    const accessTokenNewRegister = state.registerUser?.access_token;

    try {
      const response = await apiRequest({
        url: '/customer_app/event/event',
        method: 'POST',
        authToken: token,
        bearerToken:
          bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        contentType: 'application/json',
        data: data,
      });
      // console.log('filterData in filter api call main >>>', filterData);
      if (!response.status) {
        return rejectWithValue(
          response.response?.message || 'Failed to apply filter',
        );
      }
      
      return response.response as FilterApplyResponse;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to apply filter');
    }
  },
);

const filterApplySlice = createSlice({
  name: 'filterApply',
  initialState: initialFilterApplyState,
  reducers: {
    clearFilterApplyData(state) {
      state.filterStatus = 'idle';
      state.error = null;
      state.filterApplyData = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(applyFilter.pending, state => {
        state.filterStatus = 'loading';
        state.error = null;
      })
      .addCase(applyFilter.fulfilled, (state, action) => {
        state.filterStatus = 'succeeded';
        state.filterApplyData = action.payload;
      })
      .addCase(applyFilter.rejected, (state, action) => {
        state.filterStatus = 'failed';
        state.error =
          typeof action.payload === 'string' ? action.payload : 'Unknown error';
        state.filterApplyData = null;
      });
  },
});

export const {clearFilterApplyData} = filterApplySlice.actions;
export default filterApplySlice.reducer;
