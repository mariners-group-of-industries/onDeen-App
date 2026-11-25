import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api';
import { RootState } from '../store';

interface Organizer {
  first_name: string | null;
  id: number;
  last_name: string | null;
  profile_image: string;
}

interface Speaker {
  first_name: string;
  id: number;
  last_name: string;
  profile_image: string;
}

interface FilterListResponse {
  organizers: Organizer[];
  speakers: Speaker[];
}

interface FilterListState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  filterListData: [] ;
}

const initialFilterListState: FilterListState = {
  status: 'idle',
  error: null,
  filterListData: [],
};

export const fetchFilterList = createAsyncThunk(
  '/customer_app/event/filter',
  async ({ type }: { type: number }, { getState, rejectWithValue }) => {
    const token = (getState() as RootState).token?.token?.access_token;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp?.verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser?.access_token;
// console.log('owubefiwbfiwebfiwebfiwebfibwef',type);

    try {
      const response = await apiRequest({
        url: '/customer_app/event/filter',
        method: 'POST',
        authToken: token,
        bearerToken: bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        contentType: 'application/json',
        data: { type },
      });

      if (!response.status) {
        return rejectWithValue(response.response?.message || 'Failed to fetch filter list data');
      }

      return response.response ;
    } catch (error: any) {

      
      return rejectWithValue(error.message || 'Failed to fetch filter list data');
    }
  }
);

const filterListSlice = createSlice({
  name: 'filterList',
  initialState: initialFilterListState,
  reducers: {
    clearFilterListData(state) {
      state.status = 'idle';
      state.error = null;
      state.filterListData = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFilterList.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchFilterList.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.filterListData = action.payload;
      })
      .addCase(fetchFilterList.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          typeof action.payload === 'string' ? action.payload : 'Unknown error';
        state.filterListData = [];
      });
  },
});

export const { clearFilterListData } = filterListSlice.actions;
export default filterListSlice.reducer;
