import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiGetRequest } from '../../services/api';
import { RootState } from '../store';

interface Category {
  id: number;
  title: string;
  ar_title: string;
  image: string;
  home_view: boolean;
  is_curriculum: number;
  is_itinerary: number;
  is_material: number;
  is_speaker: number;
  is_tourslot: number;
  position: number;
  status: number;
}

interface CategoryState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  categoryData: Category[];
}

const initialState: CategoryState = {
  status: 'idle',
  error: null,
  categoryData: [],
};

// Async Thunk for fetching category data
export const fetchCategoryData = createAsyncThunk(
  'category/fetchCategoryData',
  async (_, { getState, rejectWithValue }) => {
    const token = (getState() as RootState).token?.token?.access_token;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp?.verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser?.access_token;
    try {
      const response = await apiGetRequest({
        url: '/customer_app/home/get_category',
        method: 'GET',
        authToken: token,
        bearerToken: bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        contentType: 'application/json',
      });
      
      return response.response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch category data';
      return rejectWithValue(message);
    }
  }
);

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    resetCategoryState: (state) => {
      state.categoryData = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategoryData.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCategoryData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.categoryData = action.payload;
      })
      .addCase(fetchCategoryData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { resetCategoryState } = categorySlice.actions;
export default categorySlice.reducer;
