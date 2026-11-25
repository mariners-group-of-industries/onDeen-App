
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api';
import { showResponce } from '../../responce/showResponce';


export const subcategoryListing = createAsyncThunk(
  'subcategory/listing',
  async (
    category_details: {category_id: string},
    {getState, rejectWithValue},
  ) => {
    const token = (getState() as any).token.token?.access_token;

    try {
      const response = await apiRequest({
        url: '/organizer_app/profile/sub_category_list',
        method: 'POST',
        data: {
          category_id: category_details.category_id,
        },
        authToken: token,
        contentType: 'application/json',
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
      return rejectWithValue('Failed to login');
    }
  },
);

const subcategorySlice = createSlice({
  name: 'subcategory',
  initialState: {
    status: 'idle',
    error: null,
    subcategory: null, 
  },
  reducers: {
    setSubcategories(state, action) {
      state.subcategory = action.payload;
    },
    cleanSubcategory(state) {
      state.subcategory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(subcategoryListing.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(subcategoryListing.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.subcategory = action.payload.response;  
        state.error = null;
      })
      .addCase(subcategoryListing.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error occurred';
      });
  },
});

export const { cleanSubcategory, setSubcategories } = subcategorySlice.actions;
export default subcategorySlice.reducer;
