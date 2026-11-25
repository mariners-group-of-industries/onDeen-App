// sectlistSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiGetRequest, apiRequest } from '../../services/api';
import { showResponce } from '../../responce/showResponce';

export const sectlistListing = createAsyncThunk(
  'sect/listing',
  async (_, { getState, rejectWithValue }) => {
    const token = (getState() as any).token.token?.access_token;
    try {
      const response = await apiGetRequest({
        url: '/organizer_app/profile/sect_list',
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
      return rejectWithValue('Failed to fetch categories');
    }
  }
);

const sectlistSlice = createSlice({
  name: 'sectlist',
  initialState: {
    status: 'idle',
    error: null,
    sectlist: null, 
  },
  reducers: {
    setSectlist(state, action) {
      state.sectlist = action.payload;
    },
    cleanSectlist(state) {
      state.sectlist = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sectlistListing.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(sectlistListing.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.sectlist = action.payload.response;  
        state.error = null;
      })
      .addCase(sectlistListing.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error occurred';
      });
  },
});

export const { cleanSectlist, setSectlist } = sectlistSlice.actions;
export default sectlistSlice.reducer;
