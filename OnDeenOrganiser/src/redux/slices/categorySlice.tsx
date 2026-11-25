// categorySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiGetRequest, apiRequest } from '../../services/api';
import { showResponce } from '../../responce/showResponce';

export const categoryListing = createAsyncThunk(
  'category/listing',
  async (_, { getState, rejectWithValue }) => {
    const token = (getState() as any).token.token?.access_token;
    try {
      const response = await apiGetRequest({
        url: '/organizer_app/profile/category_list',
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

const categorySlice = createSlice({
  name: 'category',
  initialState: {
    status: 'idle',
    error: null,
    category: null, 
  },
  reducers: {
    setCategories(state, action) {
      state.category = action.payload;
    },
    cleancategory(state) {
      state.category = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(categoryListing.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(categoryListing.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.category = action.payload.response;  
        state.error = null;
      })
      .addCase(categoryListing.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error occurred';
      });
  },
});

export const { cleancategory, setCategories } = categorySlice.actions;
export default categorySlice.reducer;
